# Signal Path Validation Rules

## Overview
Signal paths define how ports can be connected in the Production Topology Engine. The system enforces strict validation rules to ensure only valid signal routing is allowed.

## Core Rules

### 1. **Same Category Requirement**
Ports can ONLY be connected if they belong to the same category:
- **Audio** ports can only connect to other **Audio** ports
- **Video** ports can only connect to other **Video** ports
- **DMX** ports can only connect to other **DMX** ports
- **IT** ports can only connect to other **IT** ports

**Error Message**: `"Ports must be in the same category. Source is '<category>', destination is '<category>'"`

### 2. **Port Direction Compatibility**

#### For Standard Ports (Input/Output)
- **Output** ports can connect **TO** Input ports
- **Input** ports can **RECEIVE** connections from Output ports
- **Input** ports CANNOT be sources
- **Output** ports CANNOT be destinations

**Error Messages**:
- `"The source port must be an output"` - when trying to connect from an input or invalid type
- `"The destination port must be an input"` - when trying to connect to an output or invalid type

#### For Bidirectional Ports
- **Bidirectional** ports can ONLY connect to other **Bidirectional** ports
- Bidirectional and standard ports cannot mix in a single connection

**Error Message**: `"Bidirectional ports can only connect to other bidirectional ports"`

## Connection Matrix

### Standard Ports (Audio, Video, DMX, IT)
```
          → Input  → Output  → Bidirectional
Output    ✓        ✗        ✗
Input     ✗        ✗        ✗
Bidir     ✗        ✗        ✓
```

### Bidirectional Ports (IT)
```
          → Input  → Output  → Bidirectional
Output    ✗        ✗        ✗
Input     ✗        ✗        ✗
Bidir     ✗        ✗        ✓
```

## Validation Order

The system validates connections in this order:

1. **Different Port Check**: Ensure source and destination are different ports
2. **Category Validation**: Ensure both ports are in the same category
3. **Bidirectional Compatibility**: Ensure both are bidirectional or neither is
4. **Direction Validation**: For non-bidirectional ports, validate output→input flow

## Examples

### ✓ Valid Connections

#### Audio Output to Audio Input
```
Audio Console (Output) → Audio Speaker (Input)
```

#### IT Bidirectional to IT Bidirectional
```
Router 1 (Bidirectional) ↔ Router 2 (Bidirectional)
```

#### Video Output to Video Input
```
Video Camera (Output) → Video Monitor (Input)
```

#### DMX Output to DMX Input
```
DMX Controller (Output) → DMX Light Rig (Input)
```

### ✗ Invalid Connections

#### Cross-Category (Different Categories)
```
❌ Audio Console (Output) → Video Monitor (Input)
   Error: "Ports must be in the same category"
```

#### Bidirectional Mixed with Standard
```
❌ Router (Bidirectional) → Console (Output)
   Error: "Bidirectional ports can only connect to other bidirectional ports"
```

#### Reversed Direction
```
❌ Speaker (Input) → Console (Output)
   Error: "The source port must be an output"
```

#### Same Port Connection
```
❌ Console Out → Console Out
   Error: "A connection must use two different ports"
```

## Implementation Details

### Backend Validation
All validation is performed in `/backend/routers/connections.py` in the `validate_endpoints()` function. This function is called:
- When creating a new connection (POST `/api/connections`)
- When updating an existing connection (PATCH `/api/connections/{id}`)

### Port Categories
Port categories are stored in the `Port` model:
```python
category: Mapped[str | None] = mapped_column(String(50), default=None)
```

Supported categories:
- `"audio"`
- `"video"`
- `"dmx"`
- `"it"`

### Port Directions
Defined in the `PortDirection` enum:
```python
class PortDirection(str, Enum):
    INPUT = "input"
    OUTPUT = "output"
    BIDIRECTIONAL = "bidirectional"
```

## API Responses

### Successful Connection (201 Created)
```json
{
  "id": 1,
  "source_port_id": 5,
  "destination_port_id": 8,
  "label": "Signal",
  "cable_type": "Cat6"
}
```

### Validation Error (422 Unprocessable Entity)
```json
{
  "detail": "Ports must be in the same category. Source is 'audio', destination is 'video'"
}
```

## Testing

Comprehensive tests covering all validation rules are in `/backend/tests/test_api.py`:

- `test_signal_path_same_category_requirement` - Validates category enforcement
- `test_signal_path_bidirectional_compatibility` - Validates bidirectional mixing rules
- `test_signal_path_bidirectional_to_bidirectional` - Validates bidirectional connections
- `test_signal_path_output_to_input` - Validates standard direction flow
- `test_signal_path_prevents_input_to_output` - Validates reversed direction rejection

Run tests:
```bash
python -m pytest backend/tests/test_api.py -v
```
