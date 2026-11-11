import { useState } from 'react'
import { DOMAIN_COLORS, DOMAIN_LABELS, DOMAINS } from '../domain'
import PortEditor from './PortEditor'
import '../styles/EquipmentEditor.css'

function EquipmentEditor({ equipment, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(equipment.name)
  const [categories, setCategories] = useState(equipment.categories || [])
  const [manufacturer, setManufacturer] = useState(equipment.manufacturer || '')
  const [model, setModel] = useState(equipment.model || '')
  const [notes, setNotes] = useState(equipment.notes || '')
  const [inputCount, setInputCount] = useState(equipment.input_count || 0)
  const [outputCount, setOutputCount] = useState(equipment.output_count || 0)
  const [categoryPortConfig, setCategoryPortConfig] = useState(
    equipment.category_port_config || {}
  )
  const [showPortEditor, setShowPortEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isITEquipment = categories.includes('it')

  const toggleCategory = (category) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    )
  }

  const handleInputCountChange = (value) => {
    const newCount = Math.max(0, parseInt(value, 10) || 0)
    setInputCount(newCount)
  }

  const handleOutputCountChange = (value) => {
    const newCount = Math.max(0, parseInt(value, 10) || 0)
    setOutputCount(newCount)
  }

  const handlePortConfigSave = (newConfig) => {
    setCategoryPortConfig(newConfig)
    setShowPortEditor(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (categories.length === 0) {
      alert('Please select at least one category')
      return
    }
    onSave({
      name,
      categories,
      manufacturer,
      model,
      notes,
      input_count: isITEquipment ? inputCount : inputCount,
      output_count: isITEquipment ? 0 : outputCount,
      category_port_config: categoryPortConfig,
      x: equipment.x,
      y: equipment.y,
    })
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(equipment.id)
    }
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      {showPortEditor && (
        <PortEditor
          equipment={{ ...equipment, categories, category_port_config: categoryPortConfig }}
          onSave={handlePortConfigSave}
          onCancel={() => setShowPortEditor(false)}
        />
      )}
      {showDeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3>Delete Equipment</h3>
            <p>Are you sure you want to delete <strong>{equipment.name}</strong>? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button type="button" className="btn-keep" onClick={handleCancelDelete}>
                Keep Equipment
              </button>
              <button type="button" className="btn-delete-confirm" onClick={handleConfirmDelete}>
                Delete Equipment
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="equipment-editor-overlay">
        <div className="equipment-editor">
          <h2>Edit Equipment</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Basic Information</legend>
              <div className="form-group">
                <label htmlFor="edit-name">Equipment Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-manufacturer">Manufacturer</label>
                <input
                  id="edit-manufacturer"
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-model">Model</label>
                <input
                  id="edit-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={3}
              />
              </div>
            </fieldset>

            <fieldset>
              <legend>Categories</legend>
              <div className="category-checkboxes">
                {DOMAINS.map((domain) => (
                  <label key={domain} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={categories.includes(domain)}
                      onChange={() => toggleCategory(domain)}
                    />
                    <span
                      className="category-marker"
                      style={{ backgroundColor: DOMAIN_COLORS[domain] }}
                    />
                    {DOMAIN_LABELS[domain]}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Port Configuration by Category</legend>
              <button
                type="button"
                onClick={() => setShowPortEditor(true)}
                className="port-config-button"
              >
                📊 Configure Ports Per Category
              </button>
              {Object.keys(categoryPortConfig).length > 0 && (
                <div className="port-config-summary">
                  <p className="summary-title">Current Configuration:</p>
                  <ul>
                    {Object.entries(categoryPortConfig).map(([cat, config]) => (
                      <li key={cat}>
                        <span className="config-category">{DOMAIN_LABELS[cat]}:</span>{' '}
                        {cat === 'it'
                          ? `${config.bidirectional || 0} bidirectional`
                          : `${config.input || 0} input, ${config.output || 0} output`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend>Connections</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-input-count">
                    {isITEquipment ? 'Bidirectional Ports' : 'Inputs'}
                  </label>
                  <input
                    id="edit-input-count"
                    type="number"
                    value={inputCount}
                    onChange={(e) => handleInputCountChange(e.target.value)}
                    min="0"
                  />
                </div>
                {!isITEquipment && (
                  <div className="form-group">
                    <label htmlFor="edit-output-count">Outputs</label>
                    <input
                      id="edit-output-count"
                      type="number"
                      value={outputCount}
                      onChange={(e) => handleOutputCountChange(e.target.value)}
                      min="0"
                    />
                  </div>
                )}
              </div>
            </fieldset>

            <div className="editor-actions">
              <div className="editor-actions-left">
                <button type="button" onClick={handleDeleteClick} className="danger">
                  🗑️ Delete Equipment
                </button>
              </div>
              <div className="editor-actions-right">
                <button type="button" onClick={onCancel} className="secondary">
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default EquipmentEditor
