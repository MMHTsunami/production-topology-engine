# Port Editing by Category - Implementation Guide

## Overview

The port editing system now allows you to configure input and output port counts **individually for each category** (Audio, Video, DMX, and IT Infrastructure). This enables multi-domain equipment to have different port configurations per category.

---

## Architecture

### Backend Models

#### `CategoryPortConfig` TypeDecorator
Stores category-specific port configurations as JSON in the database:

```python
{
    "audio": {"input": 4, "output": 2},
    "video": {"input": 1, "output": 1},
    "dmx": {"input": 0, "output": 8},
    "it": {"bidirectional": 4}
}
```

#### Equipment Model Enhancement
- **New field**: `category_port_config: dict` — stores per-category port counts
- **Legacy fields preserved**: `input_count`, `output_count` — for backward compatibility

### Port Generation Logic

The `_generate_ports_for_equipment()` function in `/backend/routers/equipment.py` supports two modes:

#### Mode 1: Category-Specific (New)
When `category_port_config` is populated, ports are generated per category:
- Each category gets its own set of ports
- Port names are prefixed with category (e.g., "AUDIO Input 1")
- IT category uses bidirectional ports exclusively
- Audio/Video/DMX use separate input/output ports

#### Mode 2: Legacy (Backward Compatible)
When `category_port_config` is empty, falls back to:
- Global `input_count` and `output_count` fields
- IT equipment: bidirectional ports
- Other equipment: separate input/output ports

---

## Frontend Components

### PortEditor Component
**File**: `/frontend/src/components/PortEditor.jsx`

#### Features
- **Modal dialog** for configurable port settings
- **Per-category panels** with domain-specific styling
- **Category-aware controls**:
  - Audio/Video/DMX: separate input/output spinners
  - IT: single bidirectional port spinner
- **Live preview**: shows total port counts per category
- **Responsive design**: adapts to mobile and desktop

#### Props
```jsx
<PortEditor
  equipment={{...equipment, categories: ['audio', 'video']}}
  onSave={(config) => handleSave(config)}  // Receives updated config
  onCancel={() => closeEditor()}
/>
```

#### Example Usage in EquipmentEditor
```jsx
{showPortEditor && (
  <PortEditor
    equipment={{ ...equipment, categories }}
    onSave={handlePortConfigSave}
    onCancel={() => setShowPortEditor(false)}
  />
)}

<button onClick={() => setShowPortEditor(true)}>
  📊 Configure Ports Per Category
</button>
```

### EquipmentEditor Integration
**File**: `/frontend/src/components/EquipmentEditor.jsx`

#### New Features
- **Port Editor Button**: Opens modal to configure category-specific ports
- **Configuration Summary**: Shows current port counts for each category
- **State Management**: `categoryPortConfig` state tracks per-category settings
- **Save Integration**: Sends `category_port_config` with equipment updates

---

## API Endpoints

### Equipment Update
```bash
PUT /api/equipment/{equipment_id}
Content-Type: application/json

{
  "name": "Audio Mixer",
  "categories": ["audio"],
  "category_port_config": {
    "audio": {
      "input": 8,
      "output": 2
    }
  }
}
```

### Response
```json
{
  "id": 1,
  "name": "Audio Mixer",
  "categories": ["audio"],
  "category_port_config": {
    "audio": {"input": 8, "output": 2}
  },
  "ports": [
    {"id": 1, "name": "AUDIO Input 1", "direction": "input", ...},
    {"id": 2, "name": "AUDIO Input 2", "direction": "input", ...},
    ...
    {"id": 9, "name": "AUDIO Output 1", "direction": "output", ...}
  ]
}
```

### Port Regeneration
```bash
POST /api/equipment/{equipment_id}/regenerate-ports
```

Regenerates ports based on current `category_port_config` or legacy counts.

---

## Database Schema

### New Column
```sql
ALTER TABLE equipment ADD COLUMN category_port_config TEXT;
```

### Example Storage
```json
{
  "audio": {"input": 4, "output": 2},
  "video": {"input": 1, "output": 1},
  "dmx": {"input": 0, "output": 8},
  "it": {"bidirectional": 4}
}
```

---

## Usage Workflow

### Creating Multi-Domain Equipment

1. **Create Equipment**
   - Name: "Production Hub"
   - Categories: Audio, Video, DMX, IT

2. **Click "Configure Ports Per Category"**
   - Audio: 8 inputs, 2 outputs
   - Video: 1 input, 1 output
   - DMX: 0 inputs, 16 outputs
   - IT: 4 bidirectional ports

3. **Save Configuration**
   - Ports auto-generated with category prefixes
   - PortEditor modal closes
   - Equipment updated in canvas

### Editing Existing Equipment

1. **Click equipment node** → Opens EquipmentEditor
2. **Scroll to "Port Configuration by Category"**
3. **Click "Configure Ports Per Category"** button
4. **Adjust counts** for each category
5. **Save Port Configuration** → Returns to EquipmentEditor
6. **Save Changes** → Updates equipment and regenerates ports

---

## Color Coding

Each category maintains its domain color in the PortEditor:
- **Audio**: Electric Blue (`#3b82f6`)
- **Video**: Emerald Green (`#10b981`)
- **DMX**: Amber/Orange (`#f59e0b`)
- **IT Infrastructure**: Purple/Slate (`#8b5cf6`)

---

## Styling Files

### PortEditor CSS
**File**: `/frontend/src/styles/PortEditor.css`

- Modal overlay with backdrop blur
- Category cards with gradient backgrounds
- Input spinners with count units
- Port summary indicators
- Responsive grid layout
- Accessible form controls

### EquipmentEditor CSS Updates
**File**: `/frontend/src/styles/EquipmentEditor.css`

New additions:
- `.port-config-button`: Blue gradient button with shadow
- `.port-config-summary`: Styled summary section
- `.config-category`: Category label styling

---

## Validation Rules

### Backend (Pydantic)
```python
class CategoryPortCountsBase(BaseModel):
    input: int = Field(default=0, ge=0)        # >= 0
    output: int = Field(default=0, ge=0)       # >= 0
    bidirectional: int = Field(default=0, ge=0) # >= 0
```

### Frontend
- Number inputs: min=0, max=64
- No negative values allowed
- Integer validation on input

---

## Migration Path

### Backward Compatibility
- Equipment without `category_port_config` uses legacy mode
- Existing equipment continues to work unchanged
- First update to equipment triggers port regeneration

### Migration Script (Optional)
To convert existing equipment to category mode:

```python
from backend.database import SessionLocal
from backend.models import Equipment, CategoryEnum

db = SessionLocal()
for equip in db.query(Equipment).all():
    config = {}
    if CategoryEnum.IT in equip.categories:
        config['it'] = {'bidirectional': equip.input_count}
    else:
        for cat in ['audio', 'video', 'dmx']:
            if cat in [c.value for c in equip.categories]:
                config[cat] = {'input': equip.input_count, 'output': equip.output_count}
    
    equip.category_port_config = config
    db.commit()
```

---

## Testing Checklist

- [ ] Database initializes with `category_port_config` field
- [ ] PortEditor modal opens from EquipmentEditor
- [ ] Port counts update correctly for each category
- [ ] Ports regenerate with correct naming (e.g., "AUDIO Input 1")
- [ ] Configuration persists after save
- [ ] Legacy equipment (without config) still works
- [ ] Frontend shows port summary after configuration
- [ ] Responsive design works on mobile
- [ ] Color coding matches domain colors
- [ ] IT category shows bidirectional controls only
- [ ] Audio/Video/DMX show separate input/output controls

---

## Files Modified

### Backend
- `backend/models.py` — Added `CategoryPortConfig` type and field
- `backend/schemas.py` — Added `CategoryPortCountsBase` and `category_port_config` fields
- `backend/routers/equipment.py` — Enhanced port generation logic

### Frontend
- `frontend/src/components/PortEditor.jsx` — New component (created)
- `frontend/src/components/EquipmentEditor.jsx` — Integrated PortEditor
- `frontend/src/styles/PortEditor.css` — New styles (created)
- `frontend/src/styles/EquipmentEditor.css` — Added port config styling

### Database
- `production_flow.db` — New column `category_port_config` (auto-created)

---

## Troubleshooting

### Issue: Port configuration not saving
**Solution**: Verify `category_port_config` is included in request payload

### Issue: Ports not regenerating
**Solution**: Check backend logs for `_generate_ports_for_equipment` execution

### Issue: Modal not opening
**Solution**: Verify PortEditor component is imported and `showPortEditor` state is managed

### Issue: Bidirectional not showing for IT
**Solution**: Ensure "IT Infrastructure" is selected in categories before opening PortEditor

---

## Future Enhancements

1. **Port Type Customization**: Allow custom signal types per port
2. **Auto-naming**: Intelligent port naming based on category conventions
3. **Bulk Operations**: Configure multiple equipment at once
4. **Import/Export**: Save and restore port configurations
5. **Port Groups**: Logical grouping of related ports
6. **Connection Validation**: Prevent incompatible port connections
