# Quick Start Guide: Multi-Category Equipment with Automatic Ports

## What's New

Equipment in your production topology can now:
1. **Belong to multiple domains** - e.g., an audio mixer with network connectivity can be tagged as both Audio and IT
2. **Automatically generate ports** - Ports are created based on input/output counts (separate for audio/video/DMX, bidirectional for IT)
3. **Show I/O counts** - Display the number of input/output connections at a glance
4. **Manage port naming** - Edit port names directly in the Equipment Editor
5. **Be edited in-place** - Click any equipment to open an editor modal

## Getting Started

### Starting the Application

1. **Start the Backend**:
   ```bash
   cd "C:\VSC_Projects\Production Software (Radiant)\Automated Documentation and Visualization"
   python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Start the Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open in Browser**:
   ```
   http://localhost:5173
   ```

## Adding Equipment with Ports

### Basic Audio Equipment (with automatic port generation)
1. Type: "FOH Console"
2. Categories: Check **Audio** only
3. Inputs: 16
4. Outputs: 8
5. Click "Add to canvas"
6. **Result**: 16 input ports + 8 output ports are automatically created!

### Multi-Category Equipment (e.g., Dante-Networked Audio Mixer)
1. Type: "Dante Mixer"
2. Categories: Check **Audio** AND **IT**
3. Click "Add to canvas"

The equipment will appear with both category colors in the sidebar!

### IT Equipment with Bidirectional Ports
1. Type: "Network Switch"
2. Categories: Check **IT** only
3. Bidirectional Ports: 24 (for IT equipment, input count = number of bidirectional ports)
4. Click "Add to canvas"
5. **Result**: 24 bidirectional "Network" ports are automatically created!

## Editing Equipment and Managing Ports

### From Sidebar
1. Click on any equipment name in the **INVENTORY** list
2. The Equipment Editor modal opens
3. Make changes:
   - **Categories**: Check/uncheck domains
   - **Input Count**: Number of input ports (0 or more)
     - For IT equipment: sets the number of bidirectional ports
     - For other equipment: sets the number of separate input ports
   - **Output Count**: Number of output ports (0 or more, only for non-IT equipment)
   - **Ports Section**: View and customize all ports
     - Edit port names directly
     - Delete individual ports
     - Port count automatically updates based on I/O counts
4. Click "Save Changes"

### Port Behavior by Equipment Type

| Equipment Type | Input Count | Output Count | Ports Generated |
|----------------|-------------|--------------|-----------------|
| Audio | 4 | 2 | 4 Input ports + 2 Output ports |
| Video | 8 | 1 | 8 Input ports + 1 Output port |
| DMX | 1 | 8 | 1 Input port + 8 Output ports |
| **IT** | 24 | 0 | 24 **Bidirectional** ports (networking) |

### What You'll See on the Canvas
- Equipment nodes show multiple category dots (one per category)
- Nodes display I/O count badges when configured
- Red/Green handles on node edges represent ports for making connections
- Each port can be connected to create signal flow

### Customizing Ports
1. Open Equipment Editor by clicking equipment in sidebar
2. Scroll to "Ports" section
3. Edit port names directly (e.g., "Analog In 1" instead of "Input 1")
4. Delete ports by clicking the ✕ button
5. Changes to Input/Output counts automatically regenerate the port list
6. Click "Save Changes" when done

## Category Color Reference

Use these colors to quickly identify equipment types:

| Domain | Color | Use Case | Port Type |
|--------|-------|----------|-----------|
| 🟦 Audio | Blue | Mixers, speakers, microphones, amplifiers | Input/Output |
| 🟩 Video | Green | Cameras, switchers, projectors, displays | Input/Output |
| 🟧 DMX | Orange | Lighting controllers, fixtures, dimmers | Input/Output |
| 🟪 IT | Purple | Network switches, servers, routers, cables | **Bidirectional** |

## Example Equipment with Ports

### Audio Mixer with Dante Networking
- **Categories**: Audio + IT
- **Inputs**: 32 (analog/digital audio ins)
- **Outputs**: 16 (analog/digital audio outs)
- **Ports Created**:
  - 32 Input ports (for audio connections)
  - 16 Output ports (for audio connections)
- Shows Audio (Blue) and IT (Purple) badges on node and in inventory

### Network Switch
- **Categories**: IT
- **Bidirectional Ports**: 24
- **Ports Created**:
  - 24 Bidirectional "Network" ports (for network connections)
- Ports can connect in any direction

### Video Switcher
- **Categories**: Video + Audio
- **Video Inputs**: 8 (video inputs)
- **Video Outputs**: 2 (program + preview video out)
- **Ports Created**:
  - 8 Input ports (for video connections)
  - 2 Output ports (for video connections)
- Shows Video (Green) and Audio (Blue) badges

### DMX Lighting Control System
- **Categories**: DMX + IT
- **DMX Inputs**: 1 (master control)
- **DMX Outputs**: 8 (universe outputs)
- **Ports Created**:
  - 1 Input port (DMX in)
  - 8 Output ports (DMX universe 1-8)
  - Can also have network connectivity for remote control

## Auto Port Generation

When you create or update equipment:
1. **Input/Output counts are saved** to the database
2. **Ports are automatically generated** based on type and counts
3. **Port names are auto-generated** (e.g., "Input 1", "Output 1", "Port 1")
4. **Port direction is set**:
   - Audio/Video/DMX: Separate INPUT and OUTPUT ports
   - IT: All ports are BIDIRECTIONAL

You can customize port names after creation in the Equipment Editor.

## Tips & Tricks

1. **Quick Filtering**: Click a domain filter to show only equipment in that category - multi-category equipment appears when ANY of its categories match!

2. **Visual Organization**: Use the canvas position and multiple categories to show cross-domain dependencies

3. **Naming Conventions**: Use standard names like:
   - "HDMI 1", "SDI 2" for video
   - "XLR Left", "AES/EBU" for audio
   - "DMX Universe 1" for lighting
   - "Port 1", "Uplink" for network

4. **Bidirectional IT Ports**: Perfect for network equipment - ports can be both source and destination

5. **Edit Anytime**: Equipment can be edited after creation without losing connections - ports are regenerated based on new counts

## Troubleshooting

**Equipment not showing on canvas after creation?**
- Check that you selected at least one category
- Refresh the page to reload data

**Ports not generating?**
- Ensure Input/Output counts are greater than 0
- Check equipment categories - IT equipment uses input_count for bidirectional ports
- Refresh the page

**Can't see all ports on node?**
- Nodes display ports visually as handles on edges
- View all ports in the Equipment Editor modal
- Large port counts show multiple handles distributed vertically

**Port names reset after save?**
- Custom port names are preserved in the database
- If ports appear to reset, the port count changed
- Update input/output counts to match desired port count

**Deleting ports not working?**
- Individual port deletion is for UI preview
- Actual port count is controlled by Input/Output counts
- Adjust Input/Output counts, then Save to regenerate

## Next Steps

1. Create your first piece of equipment with port counts
2. Watch ports auto-generate on the canvas
3. Customize port names in the Equipment Editor
4. Create connections between equipment ports
5. Document your production topology!

Enjoy managing your production systems!

