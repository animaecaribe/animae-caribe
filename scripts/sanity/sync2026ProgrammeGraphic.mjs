import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import {createClient} from '@sanity/client'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd())
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-09', useCdn: false, perspective: 'raw',
  token: process.env.SANITY_API_WRITE_TOKEN,
})
// Left-to-right order of the supplied graphic. The existing EU asset includes
// both the European Union and European Film Festival logos in one image.
const sponsorSlugs = [
  'ministry-trade-investment-tourism', 'global-trinidad-tobago', 'filmtt',
  'environmental-management-authority', 'imax', 'wipay', 'boss-office-furniture',
  'utt', 'european-union', 'pavilion-plus', 'ttt', 'haygem-tours-travel-service',
  'starlift-steel-orchestra', 'creative-tech-hub-caribbean',
  'private-sector-organisation-trinidad-tobago', 'ttcsi',
]
const [partners, pages, editions] = await Promise.all([
  client.fetch('*[_type == "partner"]'),
  client.fetch('*[_type == "festivalPage"]'),
  client.fetch('*[_type == "festivalEdition" && year == 2026]'),
])
if (pages.filter((page) => !page._id.startsWith('drafts.')).length !== 1) throw new Error('Expected one published festival page.')
const selectedIds = new Set()
const selected = sponsorSlugs.map((slug, index) => {
  const matches = partners.filter((partner) => partner.slug?.current === slug)
  const ids = new Set(matches.map((partner) => partner._id.replace(/^drafts\./, '')))
  if (ids.size !== 1 || !matches.some((partner) => !partner._id.startsWith('drafts.'))) throw new Error(`Missing or ambiguous existing sponsor: ${slug}`)
  selectedIds.add([...ids][0])
  return {slug, matches, sortOrder: index + 1}
})
const unpin = partners.filter((partner) => partner.beltRow === 'first' && !selectedIds.has(partner._id.replace(/^drafts\./, '')))
console.log(JSON.stringify({firstRow: selected.map(({slug, sortOrder}) => ({slug, sortOrder})), moveToAutomaticRows: unpin.map(({name}) => name)}, null, 2))
if (process.argv.includes('--apply')) {
  await fs.mkdir('.cache/graphic-sync', {recursive: true})
  await fs.writeFile(`.cache/graphic-sync/backup-${Date.now()}.json`, JSON.stringify({partners, pages, editions}, null, 2))
  const asset = await client.assets.upload('image', await fs.readFile('public/assets/festival/2026-festival-programme.jpeg'), {
    filename: '2026-festival-programme.jpeg', contentType: 'image/jpeg', title: 'Animae Caribe Festival 2026 programme - 28-31 October',
  })
  const image = {_type: 'imageWithAlt', asset: {_type: 'reference', _ref: asset._id}, alt: 'Animae Caribe Festival 2026 programme, 28-31 October, including the Saturday closing panyard party'}
  let transaction = client.transaction()
  for (const page of pages) {
    transaction = transaction.patch(page._id, (patch) => patch.ifRevisionId(page._rev)
      .setIfMissing({calendarSection: {_type: 'festivalCalendarSection'}})
      .set({
        'calendarSection.isVisible': true,
        'calendarSection.calendarImage': image,
        'calendarSection.eyebrow': 'Programme at a Glance',
        'calendarSection.heading': 'Festival Events Calendar',
        'calendarSection.description': 'Explore the Animae Caribe Festival programme for 28-31 October 2026. Select the image to view it larger, or download a copy to keep.',
        'calendarSection.modalTitle': 'Animae Caribe Festival 2026 Programme',
        'calendarSection.downloadLabel': 'Download programme image',
      }))
  }
  for (const edition of editions) transaction = transaction.patch(edition._id, (patch) => patch.ifRevisionId(edition._rev).set({calendarImage: image}))
  for (const {matches, sortOrder} of selected) {
    for (const partner of matches) transaction = transaction.patch(partner._id, (patch) => patch.ifRevisionId(partner._rev)
      .set({active: true, beltRow: 'first', sortOrder, relationship: 'sponsor', sponsorYear: 2026, relatedExperiences: []}).unset(['relatedExperience']))
  }
  for (const partner of unpin) transaction = transaction.patch(partner._id, (patch) => patch.ifRevisionId(partner._rev).set({beltRow: 'auto'}))
  await transaction.commit()
  const result = await client.fetch(`{
    "firstRow": *[_type=="partner" && active==true && beltRow=="first" && !(_id in path("drafts.**"))] | order(sortOrder asc){"slug":slug.current},
    "calendar": *[_type=="festivalPage" && !(_id in path("drafts.**"))][0].calendarSection
  }`)
  if (JSON.stringify(result.firstRow.map(({slug}) => slug)) !== JSON.stringify(sponsorSlugs)) throw new Error('Sponsor first row differs from graphic.')
  if (!result.calendar.isVisible || result.calendar.calendarImage.asset._ref !== asset._id) throw new Error('Calendar update verification failed.')
  console.log('Verified the replacement calendar image, visible section and all 16 sponsor records in graphic order. Other partner rows retain automatic balancing.')
}
