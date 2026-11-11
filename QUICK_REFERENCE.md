# Quick Reference Card - Ports System

## 🚀 Quick Start (30 seconds)

```
1. Create Equipment:
   Name: "Audio Mixer"
   Categories: [✓] Audio
   Inputs: 16
   Outputs: 8
   Click: "Add to canvas"
   
   Result: 16 INPUT ports + 8 OUTPUT ports ✅

2. Create IT Equipment:
   Name: "Network Switch"
   Categories: [✓] IT
   Bidirectional Ports: 24
   Click: "Add to canvas"
   
   Result: 24 BIDIRECTIONAL ports ✅

3. Connect:
   Drag from output handle to input handle
   Complete your topology!
```

## 📊 Port Generation Rules

| Category | Inputs | Outputs | Result |
|----------|--------|---------|--------|
| Audio | N | M | N INPUT + M OUTPUT |
| Video | N | M | N INPUT + M OUTPUT |
| DMX | N | M | N INPUT + M OUTPUT |
| **IT** | N | — | **N BIDIRECTIONAL** |

Note: For multi-category (e.g., Audio + IT), uses separate input/output (not bidirectional).

## 🎯 Port Types

```
INPUT
  Direction: ← One-way incoming
  Display: Left side handle
  Connect from: OUTPUT or BIDIRECTIONAL
  Example: Mixer input

OUTPUT
  Direction: → One-way outgoing
  Display: Right side handle
  Connect to: INPUT or BIDIRECTIONAL
  Example: Amplifier output

BIDIRECTIONAL (IT Only)
  Direction: ↔ Two-way
  Display: Both sides
  Connect to: Anything
  Example: Network port
```

## 🎨 Equipment Editor (3 Steps)

### Step 1: Open
- Click equipment name in sidebar
- Equipment Editor modal appears

### Step 2: Edit
- Change input/output counts
- Ports regenerate in real-time
- Edit port names directly

### Step 3: Save
- Click "Save Changes"
- Ports persist to database
- Canvas updates

## 🔧 Port Management

### View Ports
```
Equipment Editor → Ports Section
Shows all ports with:
  • Port name (editable)
  • Direction (input/output/bidirectional)
  • Signal type (optional, e.g., "Network")
```

### Edit Port Names
```
Click port name input
Type new name (e.g., "XLR Left" instead of "Input 1")
Name updates in real-time
```

### Add/Remove Ports
```
Change Input Count: Add/remove INPUT ports
Change Output Count: Add/remove OUTPUT ports
Save Changes: Regenerate all ports
```

### Delete Individual Port
```
Click ✕ button on port item
Port deleted (preview only)
Actual deletion controlled by count changes
```

## 🛠️ API Quick Reference

### Create Equipment with Auto-Generated Ports
```
POST /api/equipment
{
  "name": "Mixer",
  "categories": ["audio"],
  "input_count": 4,
  "output_count": 2
}

Response includes:
"ports": [
  {"id": 1, "name": "Input 1", "direction": "input"},
  {"id": 2, "name": "Input 2", "direction": "input"},
  ...
  {"id": 6, "name": "Output 2", "direction": "output"}
]
```

### Update Equipment (triggers port regeneration)
```
PUT /api/equipment/{id}
{
  "input_count": 8,
  "output_count": 4
}

Old ports deleted, new ports created (12 total)
```

### Regenerate Ports Manually
```
POST /api/equipment/{id}/regenerate-ports

Useful if ports need to be reset
```

## 🎓 Common Scenarios

### Scenario 1: Audio to Audio Connection
```
Mixer (Audio, 16 in / 8 out)
    ↓ OUTPUT 1
    ↓
Amp (Audio, 2 in / 0 out)
    ↑ INPUT 1

Result: Drag from Mixer Output 1 to Amp Input 1 ✅
```

### Scenario 2: Network Switch Setup
```
Switch A (IT, 24 bidirectional)
    ↔ Port 1
    ↔
Switch B (IT, 24 bidirectional)
    ↔ Port 1

Result: Drag between any ports (bidirectional) ✅
```

### Scenario 3: Multi-Domain System
```
Mixer (Audio + IT)
    ↓ Dante Audio Output
    ↓
Network Switch (IT)
    ↔
Speaker (Audio)

Audio flows through network! ✅
```

## ⚠️ Important Notes

1. **IT Equipment Only**: Bidirectional ports only if ONLY "IT" category
2. **Port Count Changes**: Regenerates ALL ports (old ones deleted)
3. **Connections**: Auto-delete when ports regenerate
4. **Naming**: Custom names reset when port count changes
5. **Zero Ports**: Equipment with 0 input/output has no ports

## 🐛 Troubleshooting

**Problem**: Ports not appearing
**Solution**: Check input_count or output_count > 0, refresh page

**Problem**: Want bidirectional but getting separate input/output
**Solution**: Set category to IT ONLY (remove other categories)

**Problem**: Port names reset after save
**Solution**: This happens when port count changes (expected)

**Problem**: Old connections still showing
**Solution**: Refresh page after port regeneration

## 📱 UI Elements

```
Equipment Node (Canvas):
┌─────────────────┐
│ Equipment Name  │
│ 🟦🟩  Category dots
│ ⊕ Input/Output badges
│ •─ Port handles (one per port)
└─────────────────┘

Equipment Editor:
- Basic Information section
- Categories checkboxes
- Connections section
- Ports section (NEW)
- Save/Cancel buttons
```

## 🎯 Keyboard Shortcuts

None implemented yet (uses mouse/touchpad)

## 📞 Need Help?

| Question | Answer | Document |
|----------|--------|----------|
| How do I create equipment? | See step-by-step | QUICK_START.md |
| Show me diagrams | See ASCII art | PORTS_VISUAL_GUIDE.md |
| What's the API? | See endpoints | PORTS_SYSTEM.md |
| What was built? | See summary | PORTS_IMPLEMENTATION_SUMMARY.md |
| Navigation? | See index | DOCUMENTATION_INDEX.md |
| Quick overview? | See here | DELIVERY_SUMMARY.md |

## ✨ Features At a Glance

✅ Auto-generate ports
✅ Edit port names
✅ Change port counts
✅ Bidirectional for IT
✅ Separate in/out for others
✅ Visual on canvas
✅ Port management UI
✅ Full documentation
✅ Production ready

## 🚀 Ready? Let's Go!

1. Start backend: `python -m uvicorn backend.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open: `http://localhost:5173`
4. Create equipment with port counts
5. Enjoy your topology! 🎉

---

**Version**: 1.0 | **Status**: ✅ Complete | **Type**: Quick Reference
