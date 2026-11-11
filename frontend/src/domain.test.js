import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { groupPortsByDomain, matchesDomains, portDomain, toggleDomain } from './domain.js'

test('combines category filters and resets to all when cleared', () => {
  let active = toggleDomain([], 'audio')
  active = toggleDomain(active, 'video')
  assert.deepEqual(active, ['audio', 'video'])
  assert.equal(matchesDomains(['audio'], active), true)
  assert.equal(matchesDomains(['video', 'it'], active), true)
  assert.equal(matchesDomains(['it'], active), false)
  active = toggleDomain(active, 'audio')
  assert.deepEqual(active, ['video'])
  assert.equal(matchesDomains(['audio'], active), false)
  active = toggleDomain(active, 'video')
  assert.deepEqual(active, [])
  assert.equal(matchesDomains(['it'], active), true)
  assert.equal(matchesDomains([], active), true)
})

test('groups ports in IT, audio, video, and lights order while preserving row order', () => {
  const ports = [
    { id: 1, category: 'video' },
    { id: 2, category: 'audio' },
    { id: 3, category: 'it' },
    { id: 4, category: 'audio' },
    { id: 5, category: 'dmx' },
  ]
  const groups = groupPortsByDomain(['dmx', 'video', 'audio', 'it'], ports)
  assert.deepEqual(groups.map((group) => group.category), ['it', 'audio', 'video', 'dmx'])
  assert.deepEqual(groups.map((group) => group.ports.map((port) => port.id)), [[3], [2, 4], [1], [5]])
})

test('shows missing categories and handles legacy and unknown port categories', () => {
  assert.deepEqual(groupPortsByDomain(['audio'], [{ id: 1, category: null }]), [
    { category: 'audio', ports: [{ id: 1, category: null }] },
  ])
  assert.deepEqual(groupPortsByDomain(['video', 'it'], [
    { id: 2, category: null },
    { id: 3, category: 'other' },
    { id: 4, category: 'audio' },
  ]), [
    { category: 'it', ports: [] },
    { category: 'audio', ports: [{ id: 4, category: 'audio' }] },
    { category: 'video', ports: [] },
    { category: 'uncategorized', ports: [{ id: 2, category: null }, { id: 3, category: 'other' }] },
  ])
  assert.deepEqual(groupPortsByDomain([], []), [])
})

test('resolves port categories consistently for filtering and grouping', () => {
  assert.equal(portDomain(['audio'], { category: null }), 'audio')
  assert.equal(portDomain(['audio', 'it'], { category: null }), 'uncategorized')
  assert.equal(portDomain(['audio'], { category: 'video' }), 'video')
  assert.equal(portDomain(['audio'], { category: 'other' }), 'uncategorized')
})
