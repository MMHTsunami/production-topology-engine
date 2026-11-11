import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import EquipmentNode from './components/EquipmentNode'
import EquipmentEditor from './components/EquipmentEditor'
import { api } from './services/api'
import { DOMAIN_COLORS, DOMAIN_LABELS, DOMAINS, matchesDomains, portDomain, toggleDomain } from './domain'
import { connectionPorts, isCompatibleConnection, signalPresentation } from './connections'

const nodeTypes = { equipment: EquipmentNode }

function App() {
  const [equipment, setEquipment] = useState([])
  const [connections, setConnections] = useState([])
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [name, setName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState(['audio'])
  const [activeDomains, setActiveDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingSignal, setDeletingSignal] = useState(false)
  const [selectedSignalId, setSelectedSignalId] = useState('')
  const [error, setError] = useState('')
  const [editingEquipment, setEditingEquipment] = useState(null)

  const loadTopology = useCallback(async () => {
    try {
      const [equipmentData, connectionData] = await Promise.all([
        api('/api/equipment'),
        api('/api/connections'),
      ])
      setEquipment(equipmentData)
      setConnections(connectionData)
      setSelectedSignalId((current) =>
        connectionData.some((connection) => String(connection.id) === current) ? current : '',
      )
      const portMap = new Map()
      equipmentData.forEach((item) => {
        item.ports.forEach((port) =>
          portMap.set(port.id, { ...port, equipmentCategories: item.categories, equipmentName: item.name }),
        )
      })
      setNodes(
        equipmentData.map((item) => ({
          id: String(item.id),
          type: 'equipment',
          position: { x: item.x, y: item.y },
          data: { equipment: item },
        })),
      )
      setEdges(
        connectionData.flatMap((connection) => {
          const sourcePort = portMap.get(connection.source_port_id)
          const destinationPort = portMap.get(connection.destination_port_id)
          if (!sourcePort || !destinationPort) return []
          const presentation = signalPresentation(sourcePort, destinationPort)
          return [
            {
              id: String(connection.id),
              source: String(sourcePort.equipment_id),
              target: String(destinationPort.equipment_id),
              sourceHandle: String(sourcePort.id),
              targetHandle: String(destinationPort.id),
              label: presentation.label,
              type: 'smoothstep',
              animated: false,
              style: { stroke: presentation.color, color: presentation.color, strokeWidth: 2 },
              labelStyle: { fill: '#cbd5e1', fontWeight: 600 },
              labelBgStyle: { fill: '#111827', fillOpacity: 0.9 },
            },
          ]
        }),
      )
      setError('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(loadTopology)
  }, [loadTopology])

  const portsById = useMemo(() => {
    const portMap = new Map()
    equipment.forEach((item) => {
      item.ports.forEach((port) =>
        portMap.set(port.id, { ...port, equipmentCategories: item.categories, equipmentName: item.name }),
      )
    })
    return portMap
  }, [equipment])

  const visibleNodes = useMemo(
    () =>
      nodes
        .filter((node) => matchesDomains(node.data.equipment.categories, activeDomains))
        .map((node) => ({ ...node, data: { ...node.data, activeDomains } })),
    [activeDomains, nodes],
  )
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  )
  const visibleEdges = useMemo(
    () =>
      activeDomains.length === 0
        ? edges
        : edges.filter((edge) => {
            const source = portsById.get(Number(edge.sourceHandle))
            const destination = portsById.get(Number(edge.targetHandle))
            return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target) &&
              source && destination &&
              activeDomains.includes(portDomain(source.equipmentCategories, source)) &&
              activeDomains.includes(portDomain(destination.equipmentCategories, destination))
          }),
    [activeDomains, edges, portsById, visibleNodeIds],
  )
  const onNodesChange = (changes) =>
    setNodes((current) => applyNodeChanges(changes, current))
  const onEdgesChange = (changes) =>
    setEdges((current) => applyEdgeChanges(changes, current))

  const handleAddEquipment = async (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || selectedCategories.length === 0) return

    try {
      const position = { x: 120 + equipment.length * 38, y: 100 + equipment.length * 34 }
      const created = await api('/api/equipment', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          categories: selectedCategories,
          x: position.x,
          y: position.y,
          input_count: 0,
          output_count: 0,
        }),
      })
      await api('/api/ports', {
        method: 'POST',
        body: JSON.stringify({
          equipment_id: created.id,
          name: 'Output',
          direction: 'output',
          signal: 'Signal',
        }),
      })
      await api('/api/ports', {
        method: 'POST',
        body: JSON.stringify({
          equipment_id: created.id,
          name: 'Input',
          direction: 'input',
          signal: 'Signal',
        }),
      })
      setName('')
      await loadTopology()
    } catch (requestError) {
      await loadTopology()
      setError(requestError.message)
    }
  }

  const handleConnect = async (connection) => {
    const { source: sourcePort, destination: destinationPort } = connectionPorts(connection, portsById)
    if (!isCompatibleConnection(connection, portsById)) {
      setError('Select two different ports in the same category: output to input, or bidirectional to bidirectional.')
      return
    }

    try {
      await api('/api/connections', {
        method: 'POST',
        body: JSON.stringify({
          source_port_id: sourcePort.id,
          destination_port_id: destinationPort.id,
          label: sourcePort.signal || destinationPort.signal || 'Signal',
          cable_type: null,
        }),
      })
      await loadTopology()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleDeleteSignal = async () => {
    if (!selectedSignalId || deletingSignal) return
    const edgeId = selectedSignalId
    setDeletingSignal(true)
    try {
      await api(`/api/connections/${edgeId}`, { method: 'DELETE' })
      setConnections((current) => current.filter((connection) => String(connection.id) !== edgeId))
      setEdges((current) => current.filter((edge) => edge.id !== edgeId))
      setSelectedSignalId((current) => current === edgeId ? '' : current)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingSignal(false)
    }
  }

  const handleNodeDragStop = async (_event, node) => {
    const item = node.data.equipment
    try {
      await api(`/api/equipment/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: item.name,
          categories: item.categories,
          manufacturer: item.manufacturer,
          model: item.model,
          notes: item.notes,
          input_count: item.input_count,
          output_count: item.output_count,
          x: node.position.x,
          y: node.position.y,
        }),
      })
      setEquipment((current) =>
        current.map((equipmentItem) =>
          equipmentItem.id === item.id
            ? { ...equipmentItem, x: node.position.x, y: node.position.y }
            : equipmentItem,
        ),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const isValidConnection = (connection) => {
    return isCompatibleConnection(connection, portsById)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">PF</div>
        <div>
          <p className="eyebrow">PRODUCTION SYSTEMS</p>
          <h1>Topology Studio</h1>
        </div>
        <div className="connection-status">
          <span className={`status-dot ${error ? 'status-error' : ''}`} />
          {error ? 'API unavailable' : 'Local workspace'}
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <div>
              <p className="eyebrow">WORKSPACE</p>
              <h2>Equipment</h2>
            </div>
            <span className="count-badge">{equipment.length}</span>
          </div>

          <form className="add-form" onSubmit={handleAddEquipment}>
            <label htmlFor="equipment-name">Add equipment</label>
            <input
              id="equipment-name"
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. FOH console"
              value={name}
            />
            <fieldset className="category-multi-select">
              <legend>Categories</legend>
              <div className="checkbox-group">
                {DOMAINS.map((domain) => (
                  <label key={domain} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(domain)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, domain])
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== domain),
                          )
                        }
                      }}
                    />
                    <span
                      className="domain-marker"
                      style={{ backgroundColor: DOMAIN_COLORS[domain] }}
                    />
                    {DOMAIN_LABELS[domain]}
                  </label>
                ))}
              </div>
            </fieldset>
            <button disabled={!name.trim() || selectedCategories.length === 0 || loading} type="submit">
              <span aria-hidden="true">+</span> Add to canvas
            </button>
          </form>

          <div className="inventory-heading">
            <span>INVENTORY</span>
            <button
              className="text-button"
              aria-pressed={activeDomains.length === 0}
              onClick={() => setActiveDomains([])}
              type="button"
            >
              All
            </button>
          </div>
          <nav aria-label="Filter equipment by domain" className="domain-filters">
            {DOMAINS.map((domain) => {
              const count = equipment.filter((item) =>
                item.categories.includes(domain),
              ).length
              return (
                <button
                  aria-pressed={activeDomains.includes(domain)}
                  className={`domain-filter ${activeDomains.includes(domain) ? 'is-active' : ''}`}
                  key={domain}
                  onClick={() => setActiveDomains((current) => toggleDomain(current, domain))}
                  style={{ '--domain-color': DOMAIN_COLORS[domain] }}
                  type="button"
                >
                  <span className="domain-marker" />
                  <span>{DOMAIN_LABELS[domain]}</span>
                  <span className="filter-count">{count}</span>
                </button>
              )
            })}
          </nav>

          <div className="equipment-list">
            {equipment
              .filter((item) =>
                matchesDomains(item.categories, activeDomains),
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="equipment-row"
                  onClick={() => setEditingEquipment(item)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="equipment-markers">
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        className="equipment-marker"
                        style={{ backgroundColor: DOMAIN_COLORS[cat] }}
                        title={DOMAIN_LABELS[cat]}
                      />
                    ))}
                  </div>
                  <div className="equipment-row-copy">
                    <strong>{item.name}</strong>
                    <span>{item.categories.map((c) => DOMAIN_LABELS[c]).join(', ')}</span>
                  </div>
                  <span className="port-count">{item.ports.length} ports</span>
                </div>
              ))}
            {!loading && equipment.length === 0 && (
              <p className="empty-note">Add a device to start mapping your system.</p>
            )}
          </div>

          <div className="sidebar-footer">
            <span className="footer-icon" aria-hidden="true">↗</span>
            Connect an output to an input, or connect two bidirectional ports. Select a signal on the canvas or in the toolbar to delete it.
          </div>
        </aside>

        <section aria-label="Topology canvas" className="canvas-panel">
          <div className="canvas-toolbar">
            <div>
              <p className="eyebrow">LIVE TOPOLOGY</p>
              <h2>{activeDomains.length === 0 ? 'System overview' : DOMAINS.filter((domain) => activeDomains.includes(domain)).map((domain) => DOMAIN_LABELS[domain]).join(' + ')}</h2>
            </div>
            <div className="canvas-stats">
              <span><strong>{equipment.length}</strong> devices</span>
              <span><strong>{connections.length}</strong> links</span>
              <select
                aria-label="Select signal"
                className="signal-select"
                value={selectedSignalId}
                onChange={(event) => {
                  const id = event.target.value
                  setSelectedSignalId(id)
                  setEdges((current) => current.map((edge) => ({ ...edge, selected: edge.id === id })))
                }}
              >
                <option value="">Select a signal</option>
                {connections.map((connection) => {
                  const source = portsById.get(connection.source_port_id)
                  const destination = portsById.get(connection.destination_port_id)
                  const sourceName = equipment.find((item) => item.id === source?.equipment_id)?.name
                  const destinationName = equipment.find((item) => item.id === destination?.equipment_id)?.name
                  return (
                    <option key={connection.id} value={String(connection.id)}>
                      {source && destination ? signalPresentation(source, destination).label : connection.label} (#{connection.id}): {sourceName || 'Unknown device'} / {source?.name || 'Unknown port'} → {destinationName || 'Unknown device'} / {destination?.name || 'Unknown port'}
                    </option>
                  )
                })}
              </select>
              <button
                type="button"
                className="delete-signal-button"
                disabled={!selectedSignalId || deletingSignal}
                onClick={handleDeleteSignal}
              >
                Delete selected signal
              </button>
            </div>
          </div>
          {error && <div className="error-banner" role="alert">{error}</div>}
          <div className="canvas">
            {loading ? (
              <div className="canvas-message">Connecting to local API…</div>
            ) : equipment.length === 0 ? (
              <div className="canvas-message">
                <span className="empty-orbit" aria-hidden="true">+</span>
                <strong>Your system starts here</strong>
                <span>Add equipment from the sidebar, then connect its ports.</span>
              </div>
            ) : (
              <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                onConnect={handleConnect}
                onEdgesChange={onEdgesChange}
                onEdgeClick={(_event, edge) => setSelectedSignalId(edge.id)}
                onNodeDragStop={handleNodeDragStop}
                onNodesChange={onNodesChange}
                isValidConnection={isValidConnection}
                connectionMode={ConnectionMode.Loose}
                deleteKeyCode={null}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                minZoom={0.2}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#253143" gap={24} size={1} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => DOMAIN_COLORS[node.data.equipment.category]}
                  maskColor="rgba(8, 14, 24, 0.72)"
                />
              </ReactFlow>
            )}
          </div>
        </section>
      </div>
      {editingEquipment && (
        <EquipmentEditor
          equipment={editingEquipment}
          onCancel={() => setEditingEquipment(null)}
          onSave={async (updates) => {
            try {
              await api(`/api/equipment/${editingEquipment.id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
              })
              setEditingEquipment(null)
              await loadTopology()
            } catch (requestError) {
              setError(requestError.message)
            }
          }}
          onDelete={async (equipmentId) => {
            try {
              await api(`/api/equipment/${equipmentId}`, {
                method: 'DELETE',
              })
              setEditingEquipment(null)
              await loadTopology()
            } catch (requestError) {
              setError(requestError.message)
            }
          }}
        />
      )}
    </main>
  )
}

export default App
