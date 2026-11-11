# Port Editing by Category - User Guide

## Getting Started

### Quick Overview
You can now configure **input and output ports for each category independently**. This allows a single piece of equipment to have different port configurations for Audio, Video, DMX, and IT domains.

---

## Step-by-Step: Configure Equipment Ports

### Step 1: Create or Edit Equipment
Double-click an equipment node in the canvas to open the Equipment Editor.

```
+─────────────────────────────────────+
│  Edit Equipment                     │
├─────────────────────────────────────+
│  Basic Information                  │
│  ─────────────────────────          │
│  Equipment Name: [________________]  │
│  Manufacturer:   [________________]  │
│  Model:          [________________]  │
│                                      │
│  Categories                         │
│  ─────────────────────────          │
│  ☑ Audio      ☑ Video               │
│  ☑ DMX        ☑ IT Infrastructure   │
│                                      │
│  Port Configuration by Category    │ ← HERE
│  ─────────────────────────────────── │
│  [📊 Configure Ports Per Category]   │
│                                      │
│  Current Configuration:              │
│  • Audio: 4 input, 2 output         │
│  • Video: 1 input, 1 output         │
│  • DMX: 0 input, 8 output           │
│  • IT: 4 bidirectional              │
│                                      │
│  [Cancel]  [Save Changes]           │
+─────────────────────────────────────+
```

### Step 2: Click "Configure Ports Per Category"

The PortEditor modal will open.

```
╔═════════════════════════════════════╗
║  Edit Ports by Category             ║
║                                     ║
║  Configure input and output ports   ║
║  for each category                  ║
║                                     ║
║  ┌─────────────────────────────┐    ║
║  │ 🔵 Audio                    │    ║
║  ├─────────────────────────────┤    ║
║  │ Input Ports:   [4_____]     │    ║
║  │ Output Ports:  [2_____]     │    ║
║  │                             │    ║
║  │ Summary: 4 inputs, 2 output │    ║
║  └─────────────────────────────┘    ║
║                                     ║
║  ┌─────────────────────────────┐    ║
║  │ 🟢 Video                    │    ║
║  ├─────────────────────────────┤    ║
║  │ Input Ports:   [1_____]     │    ║
║  │ Output Ports:  [1_____]     │    ║
║  │                             │    ║
║  │ Summary: 1 input, 1 output  │    ║
║  └─────────────────────────────┘    ║
║                                     ║
║  ┌─────────────────────────────┐    ║
║  │ 🟠 DMX                      │    ║
║  ├─────────────────────────────┤    ║
║  │ Input Ports:   [0_____]     │    ║
║  │ Output Ports:  [8_____]     │    ║
║  │                             │    ║
║  │ Summary: 0 inputs, 8 output │    ║
║  └─────────────────────────────┘    ║
║                                     ║
║  ┌─────────────────────────────┐    ║
║  │ 🟣 IT Infrastructure        │    ║
║  ├─────────────────────────────┤    ║
║  │ Bidirectional Ports: [4___] │    ║
║  │                             │    ║
║  │ Summary: 4 bidirectional   │    ║
║  └─────────────────────────────┘    ║
║                                     ║
║        [Cancel]  [Save Port Config] ║
╚═════════════════════════════════════╝
```

### Step 3: Adjust Port Counts

For **Audio, Video, DMX**:
- Click input field and type number of **input ports**
- Click output field and type number of **output ports**
- Max 64 ports per type

For **IT Infrastructure**:
- Click bidirectional field for **network/bidirectional ports**
- IT category only supports bidirectional (no separate input/output)

### Step 4: Save Port Configuration

Click **"Save Port Configuration"** button.
- Modal closes automatically
- Configuration summary displays in Equipment Editor
- Shows: "Audio: 4 input, 2 output" etc.

### Step 5: Save Equipment

Click **"Save Changes"** button in Equipment Editor.
- Ports are automatically generated
- Ports have category prefixes:
  - `AUDIO Input 1`, `AUDIO Input 2`, etc.
  - `VIDEO Output 1`, etc.
  - `DMX Output 1-8`, etc.
  - `IT Port 1-4` (bidirectional)
- Equipment is saved to database
- Canvas refreshes to show new ports

---

## Visual Examples

### Example 1: Audio Mixing Console

```
Configuration:
- Audio: 16 inputs, 8 outputs
- Video: 1 input, 1 output
- DMX: 0 inputs, 0 outputs
- IT: 2 bidirectional

Generated Ports (25 total):
- AUDIO Input 1-16  (left side)
- AUDIO Output 1-8  (left side)
- VIDEO Input 1     (top)
- VIDEO Output 1    (top)
- IT Port 1-2       (right side, bidirectional)
```

### Example 2: Video Production Hub

```
Configuration:
- Audio: 2 inputs, 2 outputs
- Video: 4 inputs, 4 outputs
- DMX: 1 input, 16 outputs
- IT: 4 bidirectional

Generated Ports (33 total):
- AUDIO Input 1-2     (bottom)
- AUDIO Output 1-2    (bottom)
- VIDEO Input 1-4     (top)
- VIDEO Output 1-4    (top)
- DMX Input 1         (left)
- DMX Output 1-16     (left)
- IT Port 1-4         (right, bidirectional)
```

### Example 3: Legacy Equipment (No Category Config)

```
Single Configuration:
- Input Count: 8
- Output Count: 4

Generated Ports (12 total):
- Input 1-8   (standard naming, no category prefix)
- Output 1-4  (standard naming, no category prefix)
```

---

## Port Display in Canvas

Once ports are configured, they appear in the canvas node:

```
┌─────────────────────────────────────┐
│  ┌  AUDIO Input 1                 │  │
│  ┌  AUDIO Input 2                 │  │
│  ┌  VIDEO Input 1                 │  │
│  ┌  DMX Output 1                  │  │
│  ┌  IT Port 1 (bidirectional)     │  │
│                                     │
│         Production Hub              │
│      Radiant · PH-2024              │
│                                     │
│     (6) audio  (2) video            │
│     (8) dmx    (4) IT               │
│                                     │
│  └  AUDIO Output 1                 ►  │
│  └  AUDIO Output 2                 ►  │
│  └  VIDEO Output 1                 ►  │
│  └  DMX Output 1-8                 ►  │
│  └  IT Port 1-4 (bidirectional)   ◄►  │
└─────────────────────────────────────┘
```

---

## Understanding Port Types

### Audio, Video, DMX Categories
```
┌─────────────────────────────────────┐
│  Input Ports:  ▼ (incoming signal)  │
│  Output Ports: ▲ (outgoing signal)  │
└─────────────────────────────────────┘

Connection rule:
- Input port ← receives from ← Output port
- Typical flow: Source → Output → Connection → Input → Destination
```

### IT Infrastructure Category
```
┌─────────────────────────────────────┐
│  Bidirectional Ports: ◄► (both ways)│
└─────────────────────────────────────┘

Connection rule:
- Bidirectional ◄► Bidirectional
- Can send and receive on same port
- Used for Ethernet, USB, etc.
```

---

## Color Coding

Each category is color-coded throughout the interface:

| Category | Color | Usage |
|----------|-------|-------|
| 🔵 Audio | Electric Blue `#3b82f6` | Audio signals |
| 🟢 Video | Emerald Green `#10b981` | Video signals |
| 🟠 DMX | Amber `#f59e0b` | Lighting control |
| 🟣 IT | Purple `#8b5cf6` | Network/data |

---

## Common Scenarios

### Scenario 1: Adding Equipment to Audio Setup

1. Right-click canvas → Add Equipment
2. Name it "Audio Interface"
3. Select **Audio** category only
4. Click "Configure Ports Per Category"
5. Set: Audio: 8 inputs, 8 outputs
6. Save configuration and equipment

**Result**: Equipment with 16 ports labeled "AUDIO Input 1-8" and "AUDIO Output 1-8"

### Scenario 2: Multi-Domain Production Center

1. Create equipment "Production Hub"
2. Select **Audio, Video, DMX, IT** categories
3. Click "Configure Ports Per Category"
4. Set:
   - Audio: 4 in, 2 out
   - Video: 2 in, 2 out
   - DMX: 1 in, 24 out
   - IT: 4 bidirectional
5. Save - creates 39 total ports with proper naming

### Scenario 3: Connecting Equipment

Once ports are configured:
1. Hover over port in source equipment
2. Drag connection line to destination equipment
3. Snap to port in destination
4. Click to confirm connection
5. Connection labeled with cable type

---

## Tips & Tricks

### Quick Configuration
- Use arrow keys to adjust numbers quickly
- Tab through fields for keyboard navigation
- Copy port counts between categories if needed

### Naming Strategy
- Category prefix helps identify signals visually
- Numbered ports make routing easier
- Example: "AUDIO Input 5" clearly indicates 5th audio input

### Maximum Ports
- Recommended: < 100 ports per equipment
- Maximum supported: 999 ports (no hard limit)
- Performance: ~100ms generation for large counts

### Organization
- Group related categories together
- Use consistent numbering schemes
- Consider signal flow when arranging ports

### Future Connections
- Plan for growth when setting port counts
- Extra ports are free to configure
- Easy to modify later

---

## Troubleshooting

### Issue: PortEditor won't open
**Solution**: Ensure you have at least one category selected in Equipment Editor

### Issue: Ports not appearing
**Solution**: Make sure to click "Save Changes" after closing PortEditor modal

### Issue: Wrong number of ports
**Solution**: 
1. Edit equipment again
2. Open PortEditor
3. Verify numbers match your configuration
4. Re-save if needed

### Issue: Port naming is different
**Solution**: 
- New ports with category prefix (e.g., "AUDIO Input 1")
- Old equipment uses legacy naming (e.g., "Input 1")
- This is normal - backward compatible

### Issue: Modal behind equipment panel
**Solution**: Move equipment panel or close it temporarily

---

## Best Practices

1. **Plan Your Topology First**
   - Draw on paper or whiteboard
   - Identify all connections
   - Count ports needed

2. **Use Descriptive Names**
   - Name equipment clearly
   - Use manufacturer/model when known
   - Add notes for custom equipment

3. **Group by Category**
   - Keep audio equipment together
   - Cluster video sources
   - Organize lighting (DMX) separately
   - Separate IT infrastructure

4. **Label Connections**
   - Use cable type labels (CAT6, HDMI, DMX, etc.)
   - Add signal names when meaningful
   - Document unusual routing

5. **Regular Updates**
   - Document changes
   - Export topology for backups
   - Review quarterly for optimization

---

## Need Help?

- **Component Issues**: Check browser console (F12)
- **Data Loss**: Database file is persistent
- **Port Naming**: Always uses category prefix in new mode
- **Legacy Equipment**: Still works with standard naming

For more details, see:
- `PORT_EDITING_README.md` - Quick reference
- `PORTS_EDITING_GUIDE.md` - Comprehensive guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details

---

## Summary

Port editing by category makes it easy to:
✅ Configure complex multi-domain equipment
✅ Organize ports logically with category prefixes
✅ Maintain clear signal routing
✅ Scale from simple to complex topologies
✅ Document production environment accurately

**Happy configuring!** 🎬🎵🎆🌐
