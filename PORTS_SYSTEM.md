# Ports System Documentation

## Overview

The ports system provides automatic port generation and management for equipment based on their domain category and input/output counts. This enables precise documentation of physical connections and visual representation on the production topology canvas.

## Architecture

### Database Models

#### Port Model (`backend/models.py`)
```python
class Port(Base):
    __tablename__ = "ports"
    
    id: int (primary key)
    equipment_id: int (foreign key → Equipment)
    name: str (max 120 chars)
    direction: PortDirection enum
    signal: str | None (e.g., "Network", "Audio", "DMX")
    
    equipment: Equipment relationship (back_populates="ports")
```

#### PortDirection Enum
- `INPUT`: One-way incoming signal (audio, video, DMX input)
- `OUTPUT`: One-way outgoing signal (audio, video, DMX output)
- `BIDIRECTIONAL`: Two-way connection (IT networking)

#### Equipment Model Changes
The `Equipment` model already had:
- `input_count: int` - Number of input ports (or bidirectional for IT)
- `output_count: int` - Number of output ports
- `ports: relationship[Port]` - Collection of ports on this equipment

### Port Generation Logic

Port generation is controlled by the `_generate_ports_for_equipment()` function in `backend/routers/equipment.py`:

#### For Non-IT Equipment (Audio, Video, DMX)
```
Input Ports:  1 to input_count
              name: "Input 1", "Input 2", ...
              direction: INPUT
              signal: None (can be customized)

Output Ports: 1 to output_count
              name: "Output 1", "Output 2", ...
              direction: OUTPUT
              signal: None (can be customized)
```

#### For IT Equipment
```
Bidirectional Ports: 1 to input_count
                     name: "Port 1", "Port 2", ...
                     direction: BIDIRECTIONAL
                     signal: "Network"
                     
output_count: Ignored (should be 0 for IT equipment)
```

### Port Generation Triggers

Ports are automatically generated in these scenarios:

1. **Equipment Creation** (`POST /api/equipment`)
   - After equipment record is created in database
   - `_generate_ports_for_equipment()` called before response

2. **Equipment Update** (`PUT /api/equipment/{id}`)
   - When `input_count`, `output_count`, or `categories` fields change
   - Existing ports are deleted and regenerated
   - Connections to those ports are also deleted (cascading delete)

3. **Manual Regeneration** (`POST /api/equipment/{id}/regenerate-ports`)
   - Explicitly regenerate ports for existing equipment
   - Useful if manual port edits were lost

## API Endpoints

### Create Equipment with Automatic Ports
```
POST /api/equipment
Content-Type: application/json

{
  "name": "Audio Mixer",
  "categories": ["audio"],
  "manufacturer": "Behringer",
  "model": "X1222",
  "notes": "16-channel mixer",
  "input_count": 4,
  "output_count": 2,
  "x": 100,
  "y": 100
}

Response (201 Created):
{
  "id": 1,
  "name": "Audio Mixer",
  "categories": ["audio"],
  "input_count": 4,
  "output_count": 2,
  "ports": [
    {"id": 1, "name": "Input 1", "direction": "input", "signal": null},
    {"id": 2, "name": "Input 2", "direction": "input", "signal": null},
    {"id": 3, "name": "Input 3", "direction": "input", "signal": null},
    {"id": 4, "name": "Input 4", "direction": "input", "signal": null},
    {"id": 5, "name": "Output 1", "direction": "output", "signal": null},
    {"id": 6, "name": "Output 2", "direction": "output", "signal": null}
  ]
}
```

### Create IT Equipment with Bidirectional Ports
```
POST /api/equipment
Content-Type: application/json

{
  "name": "Network Switch",
  "categories": ["it"],
  "manufacturer": "Cisco",
  "model": "Catalyst 2960",
  "input_count": 24,
  "output_count": 0,
  "x": 200,
  "y": 100
}

Response (201 Created):
{
  "id": 2,
  "name": "Network Switch",
  "categories": ["it"],
  "input_count": 24,
  "output_count": 0,
  "ports": [
    {"id": 7, "name": "Port 1", "direction": "bidirectional", "signal": "Network"},
    {"id": 8, "name": "Port 2", "direction": "bidirectional", "signal": "Network"},
    ...
    {"id": 30, "name": "Port 24", "direction": "bidirectional", "signal": "Network"}
  ]
}
```

### Update Equipment and Regenerate Ports
```
PUT /api/equipment/{equipment_id}
Content-Type: application/json

{
  "input_count": 8,
  "output_count": 4
}

Response (200 OK):
{
  "id": 1,
  "name": "Audio Mixer",
  "input_count": 8,
  "output_count": 4,
  "ports": [
    {"id": 31, "name": "Input 1", "direction": "input", "signal": null},
    ...
    {"id": 38, "name": "Input 8", "direction": "input", "signal": null},
    {"id": 39, "name": "Output 1", "direction": "output", "signal": null},
    ...
    {"id": 42, "name": "Output 4", "direction": "output", "signal": null}
  ]
}
```

Note: Old port IDs (31-42) are new because ports were regenerated.

### Regenerate Ports Manually
```
POST /api/equipment/{equipment_id}/regenerate-ports

Response (200 OK):
{
  "id": 1,
  "name": "Audio Mixer",
  "ports": [...]
}
```

### Get Equipment with Ports
```
GET /api/equipment/{equipment_id}

Response (200 OK):
{
  "id": 1,
  "name": "Audio Mixer",
  "categories": ["audio"],
  "manufacturer": "Behringer",
  "model": "X1222",
  "input_count": 4,
  "output_count": 2,
  "ports": [
    {"id": 1, "equipment_id": 1, "name": "Input 1", "direction": "input", "signal": null},
    ...
  ]
}
```

### List All Ports
```
GET /api/ports

Response (200 OK):
[
  {"id": 1, "equipment_id": 1, "name": "Input 1", "direction": "input", "signal": null},
  {"id": 2, "equipment_id": 1, "name": "Input 2", "direction": "input", "signal": null},
  ...
]
```

### Create Manual Port
```
POST /api/ports
Content-Type: application/json

{
  "equipment_id": 1,
  "name": "Custom Port",
  "direction": "input",
  "signal": "XLR"
}

Response (201 Created):
{
  "id": 100,
  "equipment_id": 1,
  "name": "Custom Port",
  "direction": "input",
  "signal": "XLR"
}
```

### Update Port
```
PATCH /api/ports/{port_id}
Content-Type: application/json

{
  "name": "XLR Left",
  "signal": "Audio"
}

Response (200 OK):
{
  "id": 1,
  "equipment_id": 1,
  "name": "XLR Left",
  "direction": "input",
  "signal": "Audio"
}
```

### Delete Port
```
DELETE /api/ports/{port_id}

Response (204 No Content)
```

## Frontend Integration

### EquipmentEditor Component (`frontend/src/components/EquipmentEditor.jsx`)

The Equipment Editor now includes:

1. **Dynamic Input/Output Labels**
   - For IT equipment: "Bidirectional Ports" (input count only)
   - For other equipment: "Inputs" and "Outputs"

2. **Ports Section**
   - Shows count of generated ports
   - List view with editable port names
   - Delete button for individual ports
   - Visual badges for direction and signal type

3. **Automatic Port Regeneration**
   - Changing input/output counts regenerates ports in UI
   - Port names can be customized before saving
   - Deleted ports reflect in preview

4. **Smart Port Generation**
   ```javascript
   // For IT equipment:
   // input_count = 24 → 24 bidirectional ports
   
   // For other equipment:
   // input_count = 4, output_count = 2 → 4 input + 2 output ports
   ```

### EquipmentNode Component (`frontend/src/components/EquipmentNode.jsx`)

The equipment nodes display ports as:

1. **Visual Handles**
   - Input ports: Left side (type="target")
   - Output ports: Right side (type="source")
   - Bidirectional ports: Both sides (type="source" and "target")

2. **Port Distribution**
   - Ports distributed vertically based on count
   - Position calculated: `top = ((index + 1) / (total + 1)) * 100%`

3. **Color Coding**
   - Handles use primary domain color
   - Supports connections between any port types

### Styling (`frontend/src/styles/EquipmentEditor.css`)

New styles for ports section:

```css
.ports-section {
  background: #0f1623;
  border: 1px solid #2d3f5b;
  border-radius: 6px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.port-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  background: #1a2332;
  border: 1px solid #2d3f5b;
  border-radius: 4px;
}

.port-direction {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.port-signal {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}
```

## Data Flow

### Creating Equipment with Ports

```
Frontend: User fills Equipment Editor form
    ↓
POST /api/equipment
    ↓
Backend: equipment = Equipment(**data) created
    ↓
db.add(equipment)
db.commit()
    ↓
Backend: _generate_ports_for_equipment(equipment, db)
    ↓
if is_it:
  Create input_count bidirectional ports
else:
  Create input_count input ports
  Create output_count output ports
    ↓
db.commit()
db.refresh(equipment)
    ↓
Response: Equipment with ports array to frontend
    ↓
Frontend: Display ports in node and sidebar
```

### Updating Equipment Ports

```
Frontend: User changes input_count in Equipment Editor
    ↓
PUT /api/equipment/{id}
    ↓
Backend: Update equipment fields
db.commit()
db.refresh(equipment)
    ↓
if (input_count or output_count or categories changed):
  _generate_ports_for_equipment(equipment, db)
  db.commit()
    ↓
Response: Equipment with new ports array
    ↓
Frontend: Display updated ports
```

## Performance Considerations

1. **Cascading Deletes**
   - When ports are regenerated, old ports are deleted
   - Connections to old ports are also deleted (via CASCADE)
   - Consider impact on large topologies with many connections

2. **Port Count Limits**
   - No hard limit on port count
   - UI may need optimization for equipment with 100+ ports
   - Consider pagination or virtual scrolling for large lists

3. **Lazy Loading**
   - Equipment relationships configured with `lazy="selectin"`
   - Ports are fetched with equipment in single query

## Configuration

### Port Generation Defaults

Defined in `_generate_ports_for_equipment()`:

```python
# For all equipment types:
- Default port count: 0 (no ports if counts not specified)
- Default port names: "Input N", "Output N", "Port N"
- Default signal type: None for audio/video/DMX, "Network" for IT

# For IT equipment specifically:
- Only uses input_count (output_count ignored)
- All ports created as BIDIRECTIONAL
- Signal type always "Network"
```

## Testing

### Manual Testing

See `test_ports.py` in project root:

```bash
python test_ports.py
```

Tests:
1. Audio equipment port generation
2. IT equipment bidirectional ports
3. Port regeneration on update
4. Video equipment ports

### Automated Tests

Run with pytest:
```bash
pytest backend/tests/test_api.py -v
```

## Future Enhancements

1. **Port Templates**
   - Pre-configured port sets for common equipment
   - e.g., "Dante Audio Standard" = 64 input + 64 output

2. **Bulk Port Operations**
   - Rename multiple ports at once
   - Batch edit port properties

3. **Port Validation**
   - Validate connection compatibility
   - e.g., prevent audio-to-video connections

4. **Port Statistics**
   - Visual indicators of connection count
   - Occupied vs. available ports display

5. **Export/Import**
   - Export port configuration
   - Import from CSV or standard formats

6. **Port Aliases**
   - Alternate names for ports (XLR Left ≈ Input 1)
   - Display preferences per user

## Troubleshooting

### Ports not generating
- Check equipment has input_count > 0 or output_count > 0
- Verify equipment.categories includes valid category
- Check database connection and migrations

### Bidirectional ports not appearing for IT equipment
- Ensure equipment.categories includes "it"
- Check that input_count > 0
- output_count is ignored for IT equipment

### Connections lost after port regeneration
- This is expected behavior (CASCADE delete)
- Regenerate connections after changing port counts
- Consider port count carefully before saving

### Port name changes not persisting
- Ensure custom port names saved before count change
- Changing counts regenerates all ports
- Save equipment to persist port name changes

## Database Schema

```sql
CREATE TABLE ports (
  id INTEGER PRIMARY KEY,
  equipment_id INTEGER NOT NULL,
  name VARCHAR(120) NOT NULL,
  direction VARCHAR(50) NOT NULL,
  signal VARCHAR(120),
  FOREIGN KEY(equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  UNIQUE(equipment_id, name)
);

CREATE INDEX ix_ports_equipment_id ON ports(equipment_id);
```

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [React Flow Handles](https://reactflow.dev/docs/api/handles/)
- [Pydantic Validation](https://docs.pydantic.dev/)
