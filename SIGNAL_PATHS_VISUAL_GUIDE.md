# Signal Path Validation - Visual Guide

## Connection Rules Visualization

### Category Isolation Matrix

```
        AUDIO   VIDEO   DMX     IT
AUDIO   ✓       ✗       ✗       ✗
VIDEO   ✗       ✓       ✗       ✗
DMX     ✗       ✗       ✓       ✗
IT      ✗       ✗       ✗       ✓
```

### Port Direction Compatibility

#### Standard Ports (Audio, Video, DMX, IT)
```
Source   →  INPUT   OUTPUT   BIDIR
─────────────────────────────────
OUTPUT   →    ✓       ✗       ✗
INPUT    →    ✗       ✗       ✗
BIDIR    →    ✗       ✗       ✓ (only bidir)
```

#### Bidirectional Mode (IT Only)
```
Bidir ↔ Bidir ONLY
Bidir ✗ Output
Bidir ✗ Input
```

## Validation Flow Diagram

```
┌─────────────────────────────────────┐
│   Connection Request (Create/Update) │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────┐
        │ Different   │ NO
        │ Port?       ├─────→ ❌ "Must use two different ports"
        └────┬────────┘
             │ YES
             ▼
        ┌─────────────┐
        │ Same        │ NO
        │ Category?   ├─────→ ❌ "Ports must be in same category"
        └────┬────────┘
             │ YES
             ▼
        ┌──────────────┐
        │ Bidir        │ MISMATCH
        │ Compat?      ├─────→ ❌ "Bidir only connects to bidir"
        └────┬─────────┘
             │ OK
             ▼
        ┌──────────────┐
        │ Valid        │ NO
        │ Direction?   ├─────→ ❌ "Output→Input required"
        └────┬─────────┘
             │ YES
             ▼
        ┌──────────────┐
        │ ✅ CREATE   │
        │ CONNECTION  │
        └──────────────┘
```

## Real-World Examples

### Example 1: Audio Studio Setup ✅
```
Microphone (Audio Output)
        │
        └──→ Audio Input Port
             │
             └──→ Mixer Console (Input)
                  │
                  └──→ Mixer Output Port
                       │
                       └──→ Speaker (Audio Input) ✓ VALID
```

### Example 2: Video Production Setup ✅
```
Camera (Video Output)
        │
        └──→ Video Input Port
             │
             └──→ Video Switcher (Input)
                  │
                  └──→ Switcher Output Port
                       │
                       └──→ Monitor (Video Input) ✓ VALID
```

### Example 3: Network Infrastructure ✅
```
Router 1 (IT Bidirectional)
        ↔
Router 2 (IT Bidirectional) ✓ VALID
```

### Example 4: Invalid Cross-Category ❌
```
Audio Console (Output)
        ❌ INVALID
        │
        └──→ Video Monitor (Input)
            [Error: "Ports must be in same category"]
```

### Example 5: Invalid Direction ❌
```
Speaker (Audio Input)
        ❌ INVALID
        │
        └──→ Microphone (Audio Output)
            [Error: "The source port must be an output"]
```

### Example 6: Invalid Bidirectional Mix ❌
```
Router (Bidirectional IT)
        ❌ INVALID
        │
        └──→ Ethernet Switch (Output IT)
            [Error: "Bidirectional ports can only connect to bidirectional"]
```

## Port Type Reference

### Audio Ports
```
┌─────────────────────┐
│  Audio Equipment    │
├─────────────────────┤
│ Speaker (Input)  ←  │
│ Mic (Output)     →  │
│ Mixer (Bidir)    ↔  │
└─────────────────────┘
```

### Video Ports
```
┌─────────────────────┐
│  Video Equipment    │
├─────────────────────┤
│ Monitor (Input)  ←  │
│ Camera (Output)  →  │
│ Switcher (Bidir) ↔  │
└─────────────────────┘
```

### DMX Ports
```
┌─────────────────────┐
│  DMX Equipment      │
├─────────────────────┤
│ Lights (Input)   ←  │
│ Controller (Out) →  │
│ Dimmer (Bidir)   ↔  │
└─────────────────────┘
```

### IT Ports
```
┌─────────────────────┐
│  IT Equipment       │
├─────────────────────┤
│ Server (Input)   ←  │
│ Switch (Output)  →  │
│ Router (Bidir)   ↔  │
└─────────────────────┘
```

## Error Message Decision Tree

```
                    Connection Attempt
                           │
                           ▼
                    [Validate Endpoints]
                           │
        ┌──────────┬────────┴────────┬──────────┐
        ▼          ▼                 ▼          ▼
   Same Port? Category Okay? Bidir Match? Valid Direction?
        │          │          │          │
        NO         NO         NO         NO
        │          │          │          │
        ▼          ▼          ▼          ▼
      Error1    Error2     Error3     Error4
        │          │          │          │
        └──────────┴──────────┴──────────┘
                      │
                      ▼
           ❌ Return 422 Error
              with message

Error1: "A connection must use two different ports"
Error2: "Ports must be in the same category. Source is 'X', destination is 'Y'"
Error3: "Bidirectional ports can only connect to other bidirectional ports"
Error4a: "The source port must be an output"
Error4b: "The destination port must be an input"
```

## Connection Matrix Summary

### ✅ VALID Connections

| From | To | Category | Result |
|------|-----|----------|--------|
| Output | Input | Same | ✅ |
| Bidir | Bidir | Same | ✅ |
| Output → | ← Input | Audio | ✅ |
| Output → | ← Input | Video | ✅ |
| Output → | ← Input | DMX | ✅ |
| Bidir ↔ | ↔ Bidir | IT | ✅ |

### ❌ INVALID Connections

| From | To | Category | Reason |
|------|-----|----------|--------|
| Output | Input | Different | Category mismatch |
| Input | Output | Same | Direction reversed |
| Output | Bidir | Same | Bidir mismatch |
| Bidir | Output | Same | Bidir mismatch |
| Input | Input | Same | Both inputs |
| Output | Output | Same | Both outputs |

---

**Visual Guide Complete** - See `SIGNAL_PATHS.md` for detailed documentation
