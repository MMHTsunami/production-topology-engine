# Ports System Visual Reference Guide

## Canvas category sections

Equipment nodes display separate, color-tinted sections in this order: IT
Infrastructure, Audio, Video, and DMX Lights. Each port occupies its own row
within its category; its input handle is on the left, its output handle is on
the right, and bidirectional ports have both. Port numbers, when present in the
name, appear beside the matching handles.

Ports without an assigned category are shown in the equipment's category when
it has only one category. Otherwise they appear in a neutral **Uncategorized**
section, rather than being attributed to an arbitrary category. These display
fallbacks do not change the stored port data.

## Port Generation Examples

### Audio Equipment: Input/Output Separation
```
Equipment: 16-Channel Mixer
  Categories: [audio]
  Input Count: 16
  Output Count: 8

Generated Ports:
┌─────────────────────────────────┐
│ 16-Channel Mixer (🟦 Audio)    │
│                                 │
│ ●─ Input 1   (input)           │
│ ●─ Input 2   (input)           │
│ ●─ Input 3   (input)           │
│ ...                             │
│ ●─ Input 16  (input)           │
│                                 │
│ ─●  Output 1   (output)        │
│ ─●  Output 2   (output)        │
│ ...                             │
│ ─●  Output 8   (output)        │
│                                 │
│ Total: 24 ports (16 in + 8 out)│
└─────────────────────────────────┘
```

### IT Equipment: Bidirectional Ports
```
Equipment: Network Switch
  Categories: [it]
  Bidirectional Ports: 24

Generated Ports (all bidirectional):
┌──────────────────────────┐
│ Network Switch (🟪 IT)   │
│                          │
│ ●─ Port 1 (both ways) ─●│
│ ●─ Port 2 (both ways) ─●│
│ ●─ Port 3 (both ways) ─●│
│ ...                      │
│ ●─ Port 24 (both ways)─●│
│                          │
│ Total: 24 bidirectional │
│ Ports [from INPUT count]│
└──────────────────────────┘
```

### Video Equipment: Multiple Input/Output
```
Equipment: Video Switcher
  Categories: [video]
  Input Count: 8
  Output Count: 2

Generated Ports:
┌──────────────────────────┐
│ Video Switcher (🟩 Video)│
│                          │
│ ●─ Input 1              │
│ ●─ Input 2              │
│ ●─ Input 3              │
│ ...                      │
│ ●─ Input 8              │
│                          │
│ ─●  Output 1            │
│ ─●  Output 2            │
│                          │
│ Total: 10 ports         │
└──────────────────────────┘
```

### Multi-Category: Audio + IT
```
Equipment: Dante Audio Interface
  Categories: [audio, it]
  Input Count: 64
  Output Count: 64

Generated Ports:
┌──────────────────────────────┐
│ Dante Audio IF (🟦🟪)         │
│                              │
│ ●─ Input 1                  │
│ ●─ Input 2                  │
│ ...                          │
│ ●─ Input 64                 │
│ (64 audio input ports)       │
│                              │
│ ─●  Output 1                │
│ ─●  Output 2                │
│ ...                          │
│ ─●  Output 64               │
│ (64 audio output ports)      │
│                              │
│ Total: 128 audio ports       │
│ Note: Dante connection       │
│       handled separately     │
└──────────────────────────────┘
```

## Port Type Indicators

### Visual Badges in Equipment Editor

```
Port Item Display:
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ Input 1  │ input │ (no signal)    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Output 1 │ output │              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Port 1   │ bidirectional │ Network  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ XLR L    │ input │ Audio           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Legend:
  ┌──────────┐ = Port name (editable)
  │ input    │ = Direction badge
  │ output   │   (blue background)
  │ bidirect │
  │ Network  │ = Signal type badge
  │ Audio    │   (green background)
```

## Handle Display on Canvas

### Audio Equipment (Input/Output Separation)
```
                          User's View (React Flow Canvas)
    
    Canvas Node:          Left Side (Inputs)    Right Side (Outputs)
                          ───────────────────   ────────────────────
                          
                          ●  Port 1             
    ┌─────────────────┐   
    │  Audio Mixer    │   ●  Port 2              ●  Port 1
    │  (4in / 2out)   │       
    │  🟦 Audio       │   ●  Port 3              ●  Port 2
    │                 │   
    │ ⊕ Inputs: 4   │   ●  Port 4
    │ ⊕ Outputs: 2  │
    │                 │   ← Ports evenly spaced vertically
    └─────────────────┘
    
    Connections possible:
    ┌─ Input handle ──→ Can receive connections (type="target")
    Output handle ──→ Can send connections (type="source")
```

### IT Equipment (Bidirectional Ports)
```
                          User's View (React Flow Canvas)
    
    Canvas Node:          Left Side              Right Side
                          ──────────────         ──────────────
                          
                          ●  Port 1             ●  Port 1
    ┌──────────────────┐       
    │  Network Switch  │   ●  Port 2             ●  Port 2
    │  24 Bidirectional
    │  🟪 IT           │   ●  Port 3             ●  Port 3
    │                  │       
    │ ⊕ Ports: 24    │   ...                   ...
    │                  │   
    │ Each port works  │   ●  Port 24            ●  Port 24
    │ in both directions
    └──────────────────┘
    
    Connections possible:
    ●─ Can be both target AND source simultaneously
    ●─ Can connect to input or output (bidirectional)
```

## Equipment Editor Workflow

### Step 1: Basic Information
```
┌─────────────────────────────────────────┐
│ Edit Equipment                          │
├─────────────────────────────────────────┤
│ BASIC INFORMATION                       │
│                                         │
│ Equipment Name:                         │
│ [Audio Mixer              ]              │
│                                         │
│ Manufacturer:                           │
│ [Behringer               ]              │
│                                         │
│ Model:                                  │
│ [X1222                   ]              │
│                                         │
│ Notes:                                  │
│ [16-channel mixer        ]              │
└─────────────────────────────────────────┘
```

### Step 2: Categories Selection
```
┌─────────────────────────────────────────┐
│ CATEGORIES                              │
│                                         │
│ ☑ 🟦 Audio         (checked)            │
│ ☐ 🟩 Video         (unchecked)          │
│ ☐ 🟧 DMX           (unchecked)          │
│ ☐ 🟪 IT            (unchecked)          │
│                                         │
│ ✓ At least one required                 │
└─────────────────────────────────────────┘
```

### Step 3: Connections (varies by category)
```
For AUDIO/VIDEO/DMX:               For IT ONLY:
┌───────────────────┐              ┌────────────────────┐
│ CONNECTIONS       │              │ CONNECTIONS        │
│                   │              │                    │
│ Inputs: [4    ]   │              │ Bidirectional:     │
│ Outputs: [2   ]   │              │ Ports: [24     ]   │
└───────────────────┘              │                    │
                                   │ (input_count only, │
                                   │  output ignored)   │
                                   └────────────────────┘
```

### Step 4: Ports Management
```
┌─────────────────────────────────────────┐
│ PORTS (6)                               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Input 1      │ input    │        │ ✕ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Input 2      │ input    │        │ ✕ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Output 1     │ output   │        │ ✕ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Output 2     │ output   │        │ ✕ │
│ └─────────────────────────────────────┘ │
│                                         │
│ You can:                                │
│ • Edit port names                       │
│ • Delete individual ports               │
│ • Change input/output count to rebuild  │
└─────────────────────────────────────────┘
```

### Step 5: Save
```
┌─────────────────────────────────────────┐
│                                         │
│          [Cancel]    [Save Changes]    │
│                                         │
└─────────────────────────────────────────┘

Result: Equipment saved with 6 auto-generated ports
        Ports appear as handles on canvas node
```

## Editing Workflow: Changing Port Count

### Before Change
```
Equipment: Mixer (4 in, 2 out)
┌────────────────────────────┐
│ Mixer (🟦 Audio)           │
│                            │
│ ●─ Input 1                 │
│ ●─ Input 2                 │
│ ●─ Input 3                 │
│ ●─ Input 4                 │
│ ─●  Output 1               │
│ ─●  Output 2               │
│                            │
│ Total: 6 ports             │
└────────────────────────────┘
```

### User Changes in Editor
```
┌─────────────────────────────┐
│ CONNECTIONS                 │
│                             │
│ Inputs:  [4] → Change to [8]│
│ Outputs: [2] → Change to [4]│
└─────────────────────────────┘

┌─────────────────────────────────────┐
│ PORTS (12) ← Updated count          │
│ (Live preview of new port list)     │
└─────────────────────────────────────┘
```

### After Save
```
Equipment: Mixer (8 in, 4 out)
┌──────────────────────────────┐
│ Mixer (🟦 Audio)             │
│                              │
│ ●─ Input 1                   │
│ ●─ Input 2                   │
│ ●─ Input 3                   │
│ ●─ Input 4                   │
│ ●─ Input 5                   │
│ ●─ Input 6                   │
│ ●─ Input 7                   │
│ ●─ Input 8                   │
│ ─●  Output 1                 │
│ ─●  Output 2                 │
│ ─●  Output 3                 │
│ ─●  Output 4                 │
│                              │
│ Total: 12 ports              │
└──────────────────────────────┘

Note: Old port IDs deleted, new ports created
      Connections to old ports also deleted
```

## Port Connection Rules

### Valid Connections by Direction

```
INPUT Port:              Can connect from:
                         • OUTPUT port (other equipment)
                         • BIDIRECTIONAL port (same or other)
                         
OUTPUT Port:             Can connect from:
                         • INPUT port (other equipment)
                         • BIDIRECTIONAL port (same or other)
                         
BIDIRECTIONAL Port:      Can connect from:
                         • INPUT port
                         • OUTPUT port
                         • Another BIDIRECTIONAL port
                         • Itself (same equipment, if needed)
```

### Example Connection Scenarios

```
Scenario 1: Audio Equipment to Audio Equipment
┌──────────────┐                ┌──────────────┐
│ Mixer1       │                │ Mixer2       │
│              │                │              │
│ ─● Output 1 ═════════════════ ●─ Input 1    │
│              │ XLR Cable      │              │
│ ─● Output 2 ═════════════════ ●─ Input 2    │
└──────────────┘                └──────────────┘
(Valid: Output connects to Input)

Scenario 2: Network Equipment
┌──────────────┐                ┌──────────────┐
│ Switch A     │                │ Switch B     │
│              │                │              │
│ ●─ Port 1 ══════════════════ Port 1 ─●       │
│              │ Network Cable  │              │
│ ●─ Port 2 ══════════════════ Port 2 ─●       │
└──────────────┘                └──────────────┘
(Valid: Bidirectional connects to Bidirectional)

Scenario 3: Complex Setup
┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│ Speakers     │    │ Amp          │    │ Mixer       │
│              │    │              │    │             │
│ ●─ Left  ────┼────●─ Left   ─●  ├───┤ Right Output│
│ ●─ Right ────┼────●─ Right  ─●  │    │             │
└──────────────┘    └──────────────┘    └─────────────┘
(Valid: Speakers are speakers/inputs, Amp has inputs/outputs)
```

## Color Coding Summary

### Domain Colors
```
🟦 Audio       #3b82f6 (Electric Blue)
🟩 Video       #10b981 (Emerald Green)
🟧 DMX         #f59e0b (Amber/Orange)
🟪 IT          #8b5cf6 (Purple/Slate)
```

### Port Direction Badges
```
input           █ Blue badge (#60a5fa)
output          █ Blue badge (#60a5fa)
bidirectional   █ Blue badge (#60a5fa)
```

### Port Signal Badges
```
Network         █ Green badge (#6ee7b7)
Audio           █ Green badge (#6ee7b7)
(others)        █ Gray text (no badge)
```

## Quick Reference: Port Generation

| Setup | Input | Output | IT? | Result |
|-------|-------|--------|-----|--------|
| Audio Mixer | 16 | 8 | No | 16 INPUT + 8 OUTPUT |
| Network Switch | 24 | 0 | Yes | 24 BIDIRECTIONAL |
| Video Switcher | 8 | 2 | No | 8 INPUT + 2 OUTPUT |
| DMX Controller | 1 | 8 | No | 1 INPUT + 8 OUTPUT |
| Dante Interface | 64 | 64 | No | 64 INPUT + 64 OUTPUT |
| Networked Mixer | 32 | 16 | No | 32 INPUT + 16 OUTPUT (IT category ignored for ports) |

Note: For multi-category equipment, port type depends on ALL categories, not just first one.
For example, Audio + IT equipment still generates separate Input/Output (not bidirectional).
Only pure IT equipment gets bidirectional ports.
