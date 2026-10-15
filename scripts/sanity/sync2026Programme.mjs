import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import {isDeepStrictEqual} from 'node:util'
import {createClient} from '@sanity/client'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd())
const programme = JSON.parse(await fs.readFile(new URL('./programme2026.json', import.meta.url), 'utf8'))
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-09', useCdn: false, perspective: 'raw',
  token: process.env.SANITY_API_WRITE_TOKEN,
})
const edition = await client.fetch('*[_type == "festivalEdition" && year == $year && !(_id in path("drafts.**"))][0]', {year: programme.editionYear})
if (!edition) throw new Error('Festival 2026 edition missing.')
const [events, pages] = await Promise.all([
  client.fetch('*[_type == "event" && festivalEdition._ref == $id]', {id: edition._id}),
  client.fetch('*[_type == "festivalPage"]'),
])
const timestamp = (day, time) => `${day}T${time}:00-04:00`
const targets = new Map()
const pending = []
for (const entry of programme.events) {
  if (targets.has(entry.id)) throw new Error(`Duplicate target ID ${entry.id}`)
  if (entry.requiresConfirmation?.length) pending.push({title: entry.title, fields: entry.requiresConfirmation})
  const start = entry.day && timestamp(entry.day, entry.start)
  const end = entry.end && entry.day && timestamp(entry.day, entry.end)
  if (start && !Number.isFinite(Date.parse(start))) throw new Error(`Invalid start time: ${entry.title}`)
  if (end && (!Number.isFinite(Date.parse(end)) || Date.parse(end) <= Date.parse(start))) throw new Error(`Invalid end time: ${entry.title}`)
  if (entry.day && !entry.day.startsWith('2026-10-')) throw new Error(`Unexpected festival date: ${entry.day}`)
  targets.set(entry.id, {
    title: entry.title,
    festivalEdition: {_type: 'reference', _ref: edition._id},
    startDateTime: start, ...(end ? {endDateTime: end} : {}),
    venue: entry.venue || 'CinemaONE IMAX, One Woodbrook Place, Port of Spain',
    eventType: entry.eventType, shortDescription: entry.description,
    ...(entry.attendanceType ? {attendanceType: entry.attendanceType} : {}),
    ...(entry.priceLabel ? {priceLabel: entry.priceLabel} : {}),
    isVisible: true,
  })
}
const byId = new Map(events.map((doc) => [doc._id, doc]))
const plan = []
for (const [id, fields] of targets) {
  const current = byId.get(id)
  const status = current ? current.isVisible === false ? 'reactivate' : 'update' : 'create'
  const changes = Object.keys(fields).filter((key) => !isDeepStrictEqual(current?.[key], fields[key]))
  const obsoleteFields = ['date', 'startTime', 'endTime', 'endDateTime', 'attendanceType', 'priceLabel'].filter((key) => !(key in fields) && key in (current || {}))
  plan.push({id, title: fields.title, status, changes, obsoleteFields, sourceRows: programme.events.find((event) => event.id === id).rows})
}
const hide = events.filter((event) => !event._id.startsWith('drafts.') && event.isVisible !== false && !targets.has(event._id))
const audit = {
  source: programme.source, additionalSource: programme.additionalSource, sheet: programme.sheet, edition: edition._id,
  beforeVisible: events.filter((event) => !event._id.startsWith('drafts.') && event.isVisible !== false).length,
  afterVisible: targets.size,
  updates: plan, hide: hide.map(({_id, title}) => ({id: _id, title})), pending,
}
await fs.mkdir('.cache/programme-audit', {recursive: true})
await fs.writeFile('.cache/programme-audit/proposed-changes.json', JSON.stringify(audit, null, 2))
console.log(JSON.stringify({beforeVisible: audit.beforeVisible, afterVisible: audit.afterVisible, counts: Object.fromEntries(['update', 'reactivate', 'create'].map((status) => [status, plan.filter((item) => item.status === status).length])), hide: hide.length, pending}, null, 2))

const applyConfirmed = process.argv.includes('--apply-confirmed')
if (process.argv.includes('--apply') || applyConfirmed) {
  if (pending.length && !applyConfirmed) throw new Error('Resolve the listed source ambiguities in programme2026.json before applying, or use --apply-confirmed for unambiguous events only.')
  const pendingIds = new Set(programme.events.filter((entry) => entry.requiresConfirmation?.length).map((entry) => entry.id))
  // A room ambiguity need not block independently confirmed title/time changes:
  // retain the existing room verbatim until the organizer confirms it.
  const retainVenueIds = new Set(programme.events.filter((entry) => entry.requiresConfirmation?.length === 1 && entry.requiresConfirmation[0] === 'venue' && byId.has(entry.id)).map((entry) => entry.id))
  if (applyConfirmed) {
    for (const id of retainVenueIds) targets.get(id).venue = byId.get(id).venue
  }
  const selectedPlan = applyConfirmed ? plan.filter((item) => !pendingIds.has(item.id) || retainVenueIds.has(item.id)) : plan
  await fs.writeFile(`.cache/programme-audit/backup-${Date.now()}.json`, JSON.stringify({edition, events, pages}, null, 2))
  let transaction = client.transaction()
  for (const item of selectedPlan) {
    const fields = targets.get(item.id)
    const current = byId.get(item.id)
    if (current) {
      transaction = transaction.patch(item.id, (patch) => patch.ifRevisionId(current._rev).set(fields).unset(item.obsoleteFields))
    } else {
      // Fixed IDs prevent repeat imports from producing duplicate events.
      transaction = transaction.create({_id: item.id, _type: 'event', ...fields})
    }
    const draft = byId.get(`drafts.${item.id}`)
    if (draft) {
      const obsolete = ['date', 'startTime', 'endTime', 'endDateTime', 'attendanceType', 'priceLabel'].filter((key) => !(key in fields) && key in draft)
      transaction = transaction.patch(draft._id, (patch) => patch.ifRevisionId(draft._rev).set(fields).unset(obsolete))
    }
  }
  if (applyConfirmed) {
    for (const id of pendingIds) {
      if (byId.has(id) || retainVenueIds.has(id)) continue
      const fields = targets.get(id)
      const entry = programme.events.find((event) => event.id === id)
      const draftFields = {...fields, isVisible: false}
      if (!draftFields.startDateTime) {
        delete draftFields.startDateTime
        draftFields.startTime = entry.start
        draftFields.endTime = entry.end
      }
      transaction = transaction.createIfNotExists({_id: `drafts.${id}`, _type: 'event', ...draftFields})
    }
  }
  for (const item of hide) {
    transaction = transaction.patch(item._id, (patch) => patch.ifRevisionId(item._rev).set({isVisible: false}))
    const draft = byId.get(`drafts.${item._id}`)
    if (draft) transaction = transaction.patch(draft._id, (patch) => patch.ifRevisionId(draft._rev).set({isVisible: false}))
  }
  const endDate = programme.events.map((event) => event.day).sort().at(-1)
  const editionChanges = {
    startDate: programme.startDate || '2026-10-28', ...(programme.endDate ? {endDate: programme.endDate} : !pending.length ? {endDate} : {}),
    description: programme.description || 'Screenings, panels, masterclasses, industry conversations and digital creativity at CinemaONE IMAX, with a 25th-anniversary closing celebration at Phase II Pan Groove panyard.',
  }
  transaction = transaction.patch(edition._id, (patch) => patch.ifRevisionId(edition._rev).set(editionChanges))
  await transaction.commit()
  const published = await client.fetch('*[_type == "event" && festivalEdition._ref == $id && coalesce(isVisible, true) == true && !(_id in path("drafts.**"))]', {id: edition._id})
  const expectedCount = selectedPlan.length + (applyConfirmed ? [...pendingIds].filter((id) => !retainVenueIds.has(id) && byId.get(id)?.isVisible !== false && byId.has(id)).length : 0)
  if (published.length !== expectedCount || published.some((event) => !targets.has(event._id))) throw new Error('Published programme differs from the target event list.')
  for (const event of published) {
    if (applyConfirmed && pendingIds.has(event._id) && !retainVenueIds.has(event._id)) continue
    for (const [key, value] of Object.entries(targets.get(event._id))) {
      if (!isDeepStrictEqual(event[key], value)) throw new Error(`Published field differs: ${event.title} / ${key}`)
    }
  }
  await fs.writeFile('.cache/programme-audit/verified-events.json', JSON.stringify(published, null, 2))
  console.log(`Verified ${selectedPlan.length} confirmed events; ${pending.length} entries await clarification. ${published.length} events are currently visible. Superseded records were hidden, not deleted.`)
}
