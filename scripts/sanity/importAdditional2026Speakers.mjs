import fs from 'node:fs/promises'
import path from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
import {createClient} from '@sanity/client'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd())
const source = await fs.readFile('src/data/acf26Speakers.ts', 'utf8')
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext}})
const {acf26Speakers} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const additions = acf26Speakers.filter((person) => person.sortOrder >= 20)
// Richard is already displayed on the website. Preserve that profile when
// switching the grid from its fixed fallback list to the CMS selection.
const requested = [acf26Speakers.find((person) => person._id === 'acf26-richard-young'), ...additions]
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-09', useCdn: false, perspective: 'raw',
  token: process.env.SANITY_API_WRITE_TOKEN,
})
const [people, pages] = await Promise.all([
  client.fetch('*[_type == "person"]'),
  client.fetch('*[_type == "festivalPage"]'),
])
if (pages.filter((page) => !page._id.startsWith('drafts.')).length !== 1) throw new Error('Expected one published festival page.')
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
const plan = requested.map((person) => {
  const matches = people.filter((doc) => doc._id.replace(/^drafts\./, '') === person._id || normalize(doc.name || '') === normalize(person.name))
  const ids = new Set(matches.map((doc) => doc._id.replace(/^drafts\./, '')))
  if (ids.size > 1) throw new Error(`Ambiguous records for ${person.name}`)
  return {person, matches, id: [...ids][0] || person._id}
})
console.log(plan.map(({person, matches, id}) => ({name: person.name, id, action: matches.length ? 'reuse' : 'create'})))
if (process.argv.includes('--apply')) {
  await fs.mkdir('.cache/speaker-import', {recursive: true})
  await fs.writeFile(`.cache/speaker-import/before-${Date.now()}.json`, JSON.stringify({people, pages}, null, 2))
  let transaction = client.transaction()
  for (const {person, matches, id} of plan) {
    // Never overwrite an existing editor profile on reruns.
    if (matches.some((doc) => doc._id === id)) continue
    if (matches.length) throw new Error(`Publish the existing draft for ${person.name} before importing.`)
    const filename = path.basename(person.image.url)
    const asset = await client.assets.upload('image', await fs.readFile(path.join('public', person.image.url)), {filename, contentType: 'image/jpeg', title: `${person.name} portrait`})
    transaction = transaction.create({
      _id: id, _type: 'person', name: person.name,
      slug: {_type: 'slug', current: filename.replace(/\.jpg$/, '')},
      active: true, sortOrder: person.sortOrder, role: person.role, bio: person.bio,
      image: {
        _type: 'imageWithAlt', asset: {_type: 'reference', _ref: asset._id}, alt: person.name,
        ...(person._id === 'acf26-kiwan-landreth-smith' ? {hotspot: {_type: 'sanity.imageHotspot', x: 0.5, y: 0.23, width: 0.5, height: 0.35}} : {}),
      },
    })
  }
  for (const page of pages) {
    const refs = [...(page.speakersSection?.people || [])]
    for (const {id} of plan) {
      if (!refs.some((ref) => ref._ref === id)) refs.push({_type: 'reference', _key: id.replace(/[^a-zA-Z0-9_-]/g, '-'), _ref: id})
    }
    transaction = transaction.patch(page._id, (patch) => patch.ifRevisionId(page._rev).setIfMissing({speakersSection: {_type: 'festivalSpeakersSection'}}).set({'speakersSection.people': refs}))
  }
  await transaction.commit()
  const page = await client.fetch('*[_type=="festivalPage" && !(_id in path("drafts.**"))][0]{"people":speakersSection.people[]->{_id,name,active,role,bio,"image":image.asset->url}}')
  for (const {id} of plan) {
    const found = page.people.find((person) => person?._id === id)
    if (!found?.image || !found.bio || !found.active) throw new Error(`Verification failed for ${id}`)
  }
  console.log(`Verified ${page.people.length} selected CMS speakers, including all four additions and Richard. Andres was unchanged.`)
}
