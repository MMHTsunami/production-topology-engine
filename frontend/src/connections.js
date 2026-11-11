import { DOMAIN_COLORS, PORT_DOMAIN_ORDER } from './domain.js'

export function abbreviateDevice(name) {
  const words = name.trim().split(/[\s_-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  return (words.length === 1 ? words[0].slice(0, 4) : words.map((word) => word[0]).join('')).toUpperCase()
}

function endpointLabel(port) {
  const number = port.name.match(/\d+$/)?.[0]
  return `${abbreviateDevice(port.equipmentName)}:${number || port.name}`
}

export function signalPresentation(source, destination) {
  const sourceCategory = source.category || (
    source.equipmentCategories.length === 1 ? source.equipmentCategories[0] : null
  )
  const destinationCategory = destination.category || (
    destination.equipmentCategories.length === 1 ? destination.equipmentCategories[0] : null
  )
  const category = sourceCategory === destinationCategory && PORT_DOMAIN_ORDER.includes(sourceCategory)
    ? sourceCategory
    : null

  return {
    label: `${endpointLabel(destination)} / ${endpointLabel(source)}`,
    color: category ? DOMAIN_COLORS[category] : '#64748b',
  }
}

export function connectionPorts(connection, portsById) {
  const source = portsById.get(Number(connection.sourceHandle))
  const destination = portsById.get(Number(connection.targetHandle))
  return { source, destination }
}

export function isCompatibleConnection(connection, portsById) {
  const { source, destination } = connectionPorts(connection, portsById)
  if (!source || !destination || source.id === destination.id || source.category !== destination.category) {
    return false
  }
  return (
    (source.direction === 'output' && destination.direction === 'input') ||
    (source.direction === 'bidirectional' && destination.direction === 'bidirectional')
  )
}
