import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../../src/lib/partners.ts', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext}})
const {splitPartnersIntoBalancedRows: split, normalizeSanityPartners: normalize} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const items = (count, pinned = 0) => Array.from({length: count}, (_, index) => ({name: String(index), src: `${index}.jpg`, beltRow: index < pinned ? 'first' : 'auto'}))

test('automatic row counts and contiguous balanced distribution remain unchanged', () => {
  for (const count of [0, 1, 2, 19, 20, 21, 36, 37, 80]) {
    const input = items(count)
    const rows = split(input)
    assert.equal(rows.length, count === 0 ? 0 : count === 1 ? 1 : count <= 20 ? 2 : count <= 36 ? 3 : 4)
    assert.deepEqual(rows.flat(), input)
    if (count) assert.ok(Math.max(...rows.map((r) => r.length)) - Math.min(...rows.map((r) => r.length)) <= 1)
  }
})
test('all forced logos stay in the first row with no lost or duplicated partners', () => {
  for (let count = 1; count <= 100; count++) {
    for (let pinned = 0; pinned <= count; pinned++) {
      const input = items(count, pinned)
      const rows = split(input)
      assert.equal(rows.flat().length, count)
      assert.equal(new Set(rows.flat()).size, count)
      assert.equal(rows[0].filter((p) => p.beltRow === 'first').length, pinned)
      const remaining = rows.slice(1).map((r) => r.length)
      if (remaining.length) assert.ok(Math.max(...remaining) - Math.min(...remaining) <= 1)
    }
  }
})
test('2026 sponsors reserve the first row while remaining logos redistribute evenly', () => {
  assert.deepEqual(split(items(39, 15)).map((r) => r.length), [15, 8, 8, 8])
  assert.deepEqual(split(items(28, 2)).map((r) => r.length), [10, 9, 9])
})
test('normalization retains positioning, sort order is stable and input is unchanged', () => {
  const input = normalize([{name: 'Later', logoUrl: 'a', sortOrder: 8}, {name: 'First', logoUrl: 'b', beltRow: 'first', sortOrder: 1}, {name: 'No logo'}])
  const before = structuredClone(input)
  assert.equal(split(input)[0][0].name, 'First')
  assert.deepEqual(input, before)
  const ordered = split([{name: 'B', src: 'b', sortOrder: 2}, {name: 'A', src: 'a', sortOrder: 1}, {name: 'C', src: 'c', sortOrder: 3}])
  assert.deepEqual(ordered.flat().map((p) => p.name), ['A', 'B', 'C'])
})
