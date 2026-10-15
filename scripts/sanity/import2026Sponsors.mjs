import fs from 'node:fs/promises'
import path from 'node:path'
import {createRequire} from 'node:module'
import {createClient} from '@sanity/client'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd())

// One entry per supplied image. The combined EU / film festival artwork belongs
// to the existing EU partner, rather than creating a second EU document.
export const sponsors = [
  [11, 'environmental-management-authority', 'Environmental Management Authority', ['EMA']],
  [10, 'imax', 'IMAX', []],
  [9, 'wipay', 'WiPay', []],
  [8, 'boss-office-furniture', 'BOSS Office Furniture', []],
  [7, 'utt', 'UTT', ['The University of Trinidad and Tobago']],
  [6, 'european-union', 'European Union', []],
  [5, 'pavilion-plus', 'Pavilion+', []],
  [4, 'ttt', 'TTT', ['Trinidad and Tobago Television']],
  [3, 'haygem-tours-travel-service', 'Haygem Tours & Travel Service Ltd', []],
  [2, 'starlift-steel-orchestra', 'Starlift Steel Orchestra', []],
  [1, 'private-sector-organisation-trinidad-tobago', 'Private Sector Organisation of Trinidad and Tobago', ['PSOTT']],
  [0, 'ttcsi', 'Trinidad and Tobago Coalition of Services Industries', ['TTCSI']],
  [14, 'ministry-trade-investment-tourism', 'Ministry of Trade, Investment and Tourism', []],
  [13, 'global-trinidad-tobago', 'Global Trinidad & Tobago', []],
  [12, 'filmtt', 'FilmTT', ['Trinidad & Tobago Film Company Limited']],
]

const args = process.argv.slice(2)
const sourceDir = args.includes('--logos-dir') ? args[args.indexOf('--logos-dir') + 1] : null
if (!sourceDir) throw new Error('Usage: node scripts/sanity/import2026Sponsors.mjs --logos-dir <folder> [--apply]')
const apply = args.includes('--apply')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-09', useCdn: false, perspective: 'raw',
  token: process.env.SANITY_API_WRITE_TOKEN,
})
const existing = await client.fetch('*[_type == "partner"]')
const normalized = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const plans = []
for (const [number, slug, name, aliases] of sponsors) {
  const keys = new Set([slug, name, ...aliases].map(normalized))
  const matches = existing.filter((doc) => keys.has(normalized(doc.name)) || keys.has(normalized(doc.slug?.current)))
  const published = matches.filter((doc) => !doc._id.startsWith('drafts.'))
  const ids = new Set(matches.map((doc) => doc._id.replace(/^drafts\./, '')))
  if (ids.size > 1) throw new Error(`Ambiguous partner matches for ${name}; inspect before importing.`)
  const oldName = `AC2026 Schedule TEMPLATE IMAX${number ? ` (${number})` : ''}.jpg`
  const newName = `${slug}.jpg`
  let source = path.join(sourceDir, oldName)
  try { await fs.access(source) } catch { source = path.join(sourceDir, newName); await fs.access(source) }
  if (path.basename(source) === oldName) {
    try { await fs.access(path.join(sourceDir, newName)); throw new Error(`Refusing to overwrite ${newName}`) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  plans.push({name, slug, source, newName, matches, published: published[0], id: [...ids][0] || `partner.${slug}`})
}
console.log(JSON.stringify(plans.map(({name, id, published, matches, newName}, index) => ({name, id, action: published ? 'update' : matches.length ? 'publish existing draft' : 'create', filename: newName, beltRow: 'first', position: index + 1})), null, 2))
if (apply) {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error('SANITY_API_WRITE_TOKEN is required.')
  const backupDir = path.resolve('.cache/sponsor-import')
  await fs.mkdir(backupDir, {recursive: true})
  await fs.writeFile(path.join(backupDir, `partners-before-${Date.now()}.json`), JSON.stringify(existing, null, 2))
  const outputDir = path.resolve('public/assets/sponsors/2026')
  await fs.mkdir(outputDir, {recursive: true})
  let transaction = client.transaction()
  for (const [index, plan] of plans.entries()) {
    const bytes = await fs.readFile(plan.source)
    const asset = await client.assets.upload('image', bytes, {filename: plan.newName, contentType: 'image/jpeg', title: `${plan.name} — 2026 sponsor logo`})
    const changes = {
      active: true, relationship: 'sponsor', sponsorYear: 2026,
      beltRow: 'first', sortOrder: index + 1, relatedExperiences: [],
      logo: {_type: 'imageWithAlt', asset: {_type: 'reference', _ref: asset._id}, alt: plan.slug === 'european-union' ? 'European Union and European Film Festival logos' : `${plan.name} logo`},
    }
    if (plan.published) {
      transaction = transaction.patch(plan.id, (patch) => patch.ifRevisionId(plan.published._rev).set(changes).unset(['relatedExperience']))
    } else {
      const draft = plan.matches[0]
      const base = Object.fromEntries(Object.entries(draft || {}).filter(([key]) => !['_id', '_rev', '_createdAt', '_updatedAt'].includes(key)))
      transaction = transaction.create({_id: plan.id, _type: 'partner', name: plan.name, slug: {_type: 'slug', current: plan.slug}, ...base, ...changes, relatedExperience: undefined})
    }
    // Keep an existing editor draft consistent so publishing it cannot undo placement.
    for (const draft of plan.matches.filter((doc) => doc._id.startsWith('drafts.'))) {
      transaction = transaction.patch(draft._id, (patch) => patch.ifRevisionId(draft._rev).set(changes).unset(['relatedExperience']))
    }
    await fs.writeFile(path.join(outputDir, plan.newName), bytes)
  }
  await transaction.commit()
  // Rename the supplied files only after the document transaction succeeds.
  for (const plan of plans) {
    const destination = path.join(sourceDir, plan.newName)
    if (path.resolve(plan.source) === path.resolve(destination)) continue
    try { await fs.access(destination); throw new Error(`Refusing to overwrite ${destination}`) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    await fs.rename(plan.source, destination)
  }
  console.log(`Imported and renamed ${plans.length} sponsors. Backup: ${backupDir}`)
}
