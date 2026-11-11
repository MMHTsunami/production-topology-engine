# Signal Path Validation - Quick Reference

## Connection Rules at a Glance

### Rule 1: Same Category Only ✓
```
✅ Audio → Audio
✅ Video → Video
✅ DMX → DMX
✅ IT ↔ IT
❌ Audio → Video (different categories - NOT ALLOWED)
```

### Rule 2: Output → Input (for standard ports) ✓
```
✅ Audio Output → Audio Input
✅ Video Output → Video Input
✅ DMX Output → DMX Input
❌ Audio Input → Audio Output (reversed - NOT ALLOWED)
```

### Rule 3: Bidirectional ↔ Bidirectional Only ✓
```
✅ Router (Bidir) ↔ Router (Bidir)
❌ Router (Bidir) → Console (Output) (mixed - NOT ALLOWED)
❌ Console (Output) → Router (Bidir) (mixed - NOT ALLOWED)
```

## Implementation Summary

| Feature | Status | Location |
|---------|--------|----------|
| Category Validation | ✅ Done | `backend/routers/connections.py:28-32` |
| Direction Validation | ✅ Done | `backend/routers/connections.py:44-47` |
| Bidirectional Checking | ✅ Done | `backend/routers/connections.py:34-41` |
| Tests | ✅ Done (8 tests) | `backend/tests/test_api.py` |
| Documentation | ✅ Done | `SIGNAL_PATHS.md` |

## Validation Code Flow

```
Connection Request
    ↓
[1] Same Port Check? → If NO, return error
    ↓
[2] Same Category? → If NO, return error
    ↓
[3] Bidir Compatibility? → If NO, return error
    ↓
[4] Direction Valid? → If NO, return error
    ↓
✅ Connection Created
```

## Error Messages

| Error | When | Fix |
|-------|------|-----|
| "Ports must be in the same category..." | Connecting different categories | Use ports from same category |
| "Bidirectional ports can only connect..." | Mixing bidir with standard | Use matching port types |
| "The source port must be an output" | Using input as source | Reverse the connection direction |
| "The destination port must be an input" | Using output as destination | Reverse the connection direction |

## Testing

Run all tests:
```bash
python -m pytest backend/tests/test_api.py -v
```

Expected output: **8 passed** ✅

## API Examples

### ✅ Valid: Audio Output to Audio Input
```json
POST /api/connections
{
  "source_port_id": 5,      // Audio Console Output
  "destination_port_id": 8  // Audio Speaker Input
}
// Status: 201 Created ✅
```

### ❌ Invalid: Cross-Category
```json
POST /api/connections
{
  "source_port_id": 5,      // Audio Console Output
  "destination_port_id": 12 // Video Monitor Input
}
// Status: 422 Error ❌
// Detail: "Ports must be in the same category..."
```

### ✅ Valid: Bidirectional to Bidirectional
```json
POST /api/connections
{
  "source_port_id": 15,     // IT Router Bidir
  "destination_port_id": 18 // IT Router Bidir
}
// Status: 201 Created ✅
```

### ❌ Invalid: Reversed Direction
```json
POST /api/connections
{
  "source_port_id": 10,     // Audio Speaker Input
  "destination_port_id": 5  // Audio Console Output
}
// Status: 422 Error ❌
// Detail: "The source port must be an output"
```

## Key Points

1. **Category is King**: First check - must match
2. **Bidir is All-or-Nothing**: Both must be bidir or neither can be
3. **Direction Matters**: Output → Input always for standard ports
4. **Clear Errors**: System tells you exactly what's wrong
5. **Both Create & Update**: Rules apply to `/POST` and `/PATCH`

## Port Categories & Valid Directions

| Category | Valid Directions | Typical Use |
|----------|------------------|-------------|
| Audio | Input, Output, Bidirectional | Mixers, speakers, microphones |
| Video | Input, Output, Bidirectional | Cameras, monitors, switchers |
| DMX | Input, Output, Bidirectional | Lights, controllers, dimmers |
| IT | Input, Output, Bidirectional | Routers, switches, servers |

---

**For complete documentation**: See `SIGNAL_PATHS.md`
**For implementation details**: See `SIGNAL_PATHS_IMPLEMENTATION.md`
