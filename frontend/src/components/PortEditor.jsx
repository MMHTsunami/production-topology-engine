import { useState } from 'react'
import { DOMAIN_COLORS, DOMAIN_LABELS, DOMAINS } from '../domain'
import '../styles/PortEditor.css'

function PortEditor({ equipment, onSave, onCancel }) {
  const [categoryPortConfig, setCategoryPortConfig] = useState(
    equipment.category_port_config || {}
  )

  const getDefaultConfig = (category) => {
    return categoryPortConfig[category] || { input: 0, output: 0, bidirectional: 0 }
  }

  const isITCategory = (category) => category === 'it'

  const handlePortCountChange = (category, portType, value) => {
    const newCount = Math.max(0, parseInt(value, 10) || 0)
    setCategoryPortConfig((prev) => ({
      ...prev,
      [category]: {
        ...getDefaultConfig(category),
        [portType]: newCount,
      },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(categoryPortConfig)
  }

  return (
    <div className="port-editor-modal">
      <div className="port-editor-container">
        <h2>Edit Ports by Category</h2>
        <p className="port-editor-subtitle">
          Configure input and output ports for each category
        </p>

        <form onSubmit={handleSubmit} className="port-editor-form">
          <div className="category-configs">
            {equipment.categories.map((category) => {
              const config = getDefaultConfig(category)
              const color = DOMAIN_COLORS[category]
              const isIT = isITCategory(category)

              return (
                <div
                  key={category}
                  className="category-config-card"
                  style={{ '--accent-color': color }}
                >
                  <div className="category-header">
                    <div className="category-badge">
                      <span
                        className="category-dot"
                        style={{ backgroundColor: color }}
                      />
                      <span className="category-name">
                        {DOMAIN_LABELS[category]}
                      </span>
                    </div>
                  </div>

                  <div className="port-count-group">
                    {isIT ? (
                      <div className="port-count-item">
                        <label htmlFor={`${category}-bidirectional`}>
                          Bidirectional Ports
                        </label>
                        <div className="count-input-wrapper">
                          <input
                            id={`${category}-bidirectional`}
                            type="number"
                            min="0"
                            max="64"
                            value={config.bidirectional || 0}
                            onChange={(e) =>
                              handlePortCountChange(
                                category,
                                'bidirectional',
                                e.target.value
                              )
                            }
                            className="count-input"
                          />
                          <span className="count-unit">ports</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="port-count-item">
                          <label htmlFor={`${category}-input`}>
                            Input Ports
                          </label>
                          <div className="count-input-wrapper">
                            <input
                              id={`${category}-input`}
                              type="number"
                              min="0"
                              max="64"
                              value={config.input || 0}
                              onChange={(e) =>
                                handlePortCountChange(
                                  category,
                                  'input',
                                  e.target.value
                                )
                              }
                              className="count-input"
                            />
                            <span className="count-unit">ports</span>
                          </div>
                        </div>

                        <div className="port-count-item">
                          <label htmlFor={`${category}-output`}>
                            Output Ports
                          </label>
                          <div className="count-input-wrapper">
                            <input
                              id={`${category}-output`}
                              type="number"
                              min="0"
                              max="64"
                              value={config.output || 0}
                              onChange={(e) =>
                                handlePortCountChange(
                                  category,
                                  'output',
                                  e.target.value
                                )
                              }
                              className="count-input"
                            />
                            <span className="count-unit">ports</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="port-summary">
                    {isIT ? (
                      <span className="summary-item">
                        {config.bidirectional || 0} bidirectional port
                        {config.bidirectional !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <>
                        <span className="summary-item input-summary">
                          {config.input || 0} input{config.input !== 1 ? 's' : ''}
                        </span>
                        <span className="summary-item output-summary">
                          {config.output || 0} output
                          {config.output !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="port-editor-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Port Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PortEditor
