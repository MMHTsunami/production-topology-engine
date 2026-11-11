import { useEffect } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { DOMAIN_COLORS, DOMAIN_LABELS, groupPortsByDomain } from '../domain'

function EquipmentNode({ id, data }) {
  const { equipment, activeDomains } = data
  const primaryColor = DOMAIN_COLORS[equipment.categories[0]] || '#75849a'
  const ports = equipment.ports ?? []
  const groups = groupPortsByDomain(equipment.categories, ports).filter(
    ({ category }) => activeDomains.length === 0 || activeDomains.includes(category),
  )
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(id)
  }, [id, equipment, activeDomains, updateNodeInternals])

  return (
    <article className="equipment-node" style={{ '--node-accent': primaryColor }}>
      <div className="node-domains">
        {equipment.categories.filter((cat) => activeDomains.length === 0 || activeDomains.includes(cat)).map((cat) => (
          <span
            key={cat}
            className="node-domain"
            style={{ backgroundColor: DOMAIN_COLORS[cat] }}
            title={DOMAIN_LABELS[cat]}
          >
            <span className="node-domain-dot" />
          </span>
        ))}
      </div>
      <strong className="node-name">{equipment.name}</strong>
      <span className="node-model">
        {[equipment.manufacturer, equipment.model].filter(Boolean).join(' · ') || 'Production device'}
      </span>
      <div className="node-connections">
        {equipment.input_count > 0 && (
          <span className="node-connection-info">
            <span className="input-badge">{equipment.input_count}</span> inputs
          </span>
        )}
        {equipment.output_count > 0 && (
          <span className="node-connection-info">
            <span className="output-badge">{equipment.output_count}</span> outputs
          </span>
        )}
      </div>
      <div className="node-ports">
        {groups.map(({ category, ports: categoryPorts }) => (
          <section
            className="node-port-section"
            key={category}
            style={{ '--port-color': DOMAIN_COLORS[category] || '#75849a' }}
          >
            <div className="node-port-section-title">
              {DOMAIN_LABELS[category] || 'Uncategorized'}
            </div>
            {(() => {
              // Separate ports by direction
              const inputPorts = categoryPorts.filter((p) => p.direction === 'input')
              const outputPorts = categoryPorts.filter((p) => p.direction === 'output')
              const bidirectionalPorts = categoryPorts.filter((p) => p.direction === 'bidirectional')

              // For I/O layout, create pairs of input/output ports
              const maxIOCount = Math.max(inputPorts.length, outputPorts.length)
              const ioPairs = Array.from({ length: maxIOCount }, (_, i) => ({
                input: inputPorts[i] || null,
                output: outputPorts[i] || null,
              }))

              // For bidirectional layout, create pairs (2 per row)
              const biPairs = Array.from({ length: Math.ceil(bidirectionalPorts.length / 2) }, (_, i) => ({
                left: bidirectionalPorts[i * 2] || null,
                right: bidirectionalPorts[i * 2 + 1] || null,
              }))

              return (
                <>
                  {/* Render bidirectional ports first */}
                  {biPairs.map((pair, pairIndex) => (
                    <div className="node-port-row" key={`bi-pair-${pairIndex}`}>
                      {pair.left && (
                        <div className="node-port-cell node-port-left-cell">
                          <Handle
                            id={String(pair.left.id)}
                            position={Position.Left}
                            type="source"
                            title={pair.left.name}
                          />
                          <span className="node-port-label">
                            {pair.left.name.match(/(\d+)$/)?.[1] || pair.left.name}
                          </span>
                        </div>
                      )}
                      {pair.right && (
                        <div className="node-port-cell node-port-right-cell">
                          <span className="node-port-label">
                            {pair.right.name.match(/(\d+)$/)?.[1] || pair.right.name}
                          </span>
                          <Handle
                            id={String(pair.right.id)}
                            position={Position.Right}
                            type="source"
                            title={pair.right.name}
                          />
                        </div>
                      )}
                      {!pair.left && pair.right && <div className="node-port-cell node-port-left-cell" />}
                      {pair.left && !pair.right && <div className="node-port-cell node-port-right-cell" />}
                    </div>
                  ))}

                  {/* Render input/output ports in pairs */}
                  {ioPairs.map((pair, pairIndex) => (
                    <div className="node-port-row" key={`io-pair-${pairIndex}`}>
                      {pair.input && (
                        <div className="node-port-cell node-port-left-cell">
                          <Handle
                            id={String(pair.input.id)}
                            position={Position.Left}
                            type="target"
                            title={pair.input.name}
                          />
                          <span className="node-port-label">
                            IN {pair.input.name.match(/(\d+)$/)?.[1] || ''}
                          </span>
                        </div>
                      )}
                      {!pair.input && <div className="node-port-cell node-port-left-cell" />}

                      {pair.output && (
                        <div className="node-port-cell node-port-right-cell">
                          <span className="node-port-label">
                            OUT {pair.output.name.match(/(\d+)$/)?.[1] || ''}
                          </span>
                          <Handle
                            id={String(pair.output.id)}
                            position={Position.Right}
                            type="source"
                            title={pair.output.name}
                          />
                        </div>
                      )}
                      {!pair.output && <div className="node-port-cell node-port-right-cell" />}
                    </div>
                  ))}
                </>
              )
            })()}
            {categoryPorts.length === 0 && <div className="node-port-empty">No ports configured</div>}
          </section>
        ))}
        {groups.length === 0 && <span className="node-port-empty">No ports configured</span>}
      </div>
    </article>
  )
}

export default EquipmentNode
