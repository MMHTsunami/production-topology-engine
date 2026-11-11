import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { abbreviateDevice, connectionPorts, isCompatibleConnection, signalPresentation } from './connections.js'

const ports = new Map([
  [1, { id: 1, category: 'it', direction: 'bidirectional' }],
  [2, { id: 2, category: 'it', direction: 'bidirectional' }],
  [3, { id: 3, category: 'audio', direction: 'output' }],
  [4, { id: 4, category: 'audio', direction: 'input' }],
  [5, { id: 5, category: 'video', direction: 'input' }],
  [6, { id: 6, category: 'audio', direction: 'bidirectional' }],
])

function connection(sourceHandle, targetHandle) {
  return { sourceHandle: String(sourceHandle), targetHandle: String(targetHandle) }
}

test('resolves bidirectional handles in either order', () => {
  assert.equal(connectionPorts(connection(1, 2), ports).source.id, 1)
  assert.equal(isCompatibleConnection(connection(1, 2), ports), true)
  assert.equal(isCompatibleConnection(connection(2, 1), ports), true)
  assert.equal(isCompatibleConnection(connection(1, 1), ports), false)
})

test('enforces direction and category rules', () => {
  assert.equal(isCompatibleConnection(connection(3, 4), ports), true)
  assert.equal(isCompatibleConnection(connection(4, 3), ports), false)
  assert.equal(isCompatibleConnection(connection(3, 5), ports), false)
  assert.equal(isCompatibleConnection(connection(3, 6), ports), false)
  assert.equal(isCompatibleConnection(connection(6, 4), ports), false)
  assert.equal(isCompatibleConnection(connection(1, 6), ports), false)
  assert.equal(isCompatibleConnection(connection(3, 99), ports), false)
})

test('labels destination first using device abbreviations and port numbers', () => {
  const source = { equipmentName: 'Front of House', name: 'Audio Output 12', category: 'audio', equipmentCategories: ['audio'] }
  const destination = { equipmentName: 'Speaker', name: 'Audio Input 3', category: 'audio', equipmentCategories: ['audio'] }
  assert.deepEqual(signalPresentation(source, destination), { label: 'SPEA:3 / FOH:12', color: '#3b82f6' })
  assert.equal(abbreviateDevice('Stage-Box 1'), 'SB1')
  assert.equal(abbreviateDevice('   '), '?')
})

test('preserves unnumbered port names and colors each category', () => {
  for (const [category, color] of Object.entries({ audio: '#3b82f6', video: '#10b981', dmx: '#f59e0b', it: '#8b5cf6' })) {
    const source = { equipmentName: 'Router One', name: 'Uplink', category, equipmentCategories: [category] }
    const destination = { equipmentName: 'Router Two', name: 'Port 8', category, equipmentCategories: [category] }
    assert.deepEqual(signalPresentation(source, destination), { label: 'RT:8 / RO:Uplink', color })
  }
})

test('uses a single equipment category for legacy ports and neutral for ambiguous connections', () => {
  const source = { equipmentName: 'A', name: 'Output 1', category: null, equipmentCategories: ['audio'] }
  const destination = { equipmentName: 'B', name: 'Input 2', category: null, equipmentCategories: ['audio'] }
  assert.equal(signalPresentation(source, destination).color, '#3b82f6')
  assert.equal(signalPresentation(source, { ...destination, equipmentCategories: ['audio', 'video'] }).color, '#64748b')
  assert.equal(signalPresentation(source, { ...destination, category: 'video' }).color, '#64748b')
})
