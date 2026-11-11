export const DOMAINS = ['audio', 'video', 'dmx', 'it']

export const DOMAIN_LABELS = {
  audio: 'Audio',
  video: 'Video',
  dmx: 'DMX Lights',
  it: 'IT Infrastructure',
}

export const DOMAIN_COLORS = {
  audio: '#3b82f6',
  video: '#10b981',
  dmx: '#f59e0b',
  it: '#8b5cf6',
}

export const PORT_DOMAIN_ORDER = ['it', 'audio', 'video', 'dmx']

export function matchesDomains(categories, activeDomains) {
  return activeDomains.length === 0 || activeDomains.some((domain) => categories.includes(domain))
}

export function toggleDomain(activeDomains, domain) {
  return activeDomains.includes(domain)
    ? activeDomains.filter((active) => active !== domain)
    : [...activeDomains, domain]
}

export function portDomain(categories, port) {
  const domains = categories.filter((category) => PORT_DOMAIN_ORDER.includes(category))
  return PORT_DOMAIN_ORDER.includes(port.category)
    ? port.category
    : !port.category && domains.length === 1
      ? domains[0]
      : 'uncategorized'
}

export function groupPortsByDomain(categories, ports) {
  const groups = new Map()
  const domains = categories.filter((category) => PORT_DOMAIN_ORDER.includes(category))
  domains.forEach((category) => groups.set(category, []))

  ports.forEach((port) => {
    const category = portDomain(categories, port)
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(port)
  })

  return [...PORT_DOMAIN_ORDER, 'uncategorized']
    .filter((category) => groups.has(category))
    .map((category) => ({ category, ports: groups.get(category) }))
}
