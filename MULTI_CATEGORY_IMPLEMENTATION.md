# Multi-Category Equipment Implementation

## Overview
This document describes the changes made to support equipment that belongs to multiple categories (domains), with editable I/O counts and bi-directional connection support.

## Key Features Implemented

### 1. **Multi-Category Support for Equipment**
- Equipment can now belong to multiple categories simultaneously
- Examples:
  - Audio mixer: Audio + IT (for network connectivity)
  - Video switcher with audio: Video + Audio
  - Networked DMX controller: DMX + IT

### 2. **Editable I/O Counts**
- `input_count`: Number of input connections
- `output_count`: Number of output connections
- Equipment editor allows users to specify these counts
- Displayed on equipment nodes with visual badges

### 3. **Equipment Editor Modal**
- Click on any equipment in the inventory list to open the editor
- Edit equipment properties:
  - Name
  - Manufacturer
  - Model
  - Notes
  - Categories (multi-select checkboxes)
  - Input/Output counts

### 4. **Bi-Directional Connection Support**
- Already supported via `PortDirection.BIDIRECTIONAL`
- Ports can be configured as input, output, or bidirectional
- Visual handles show appropriate connection points

## Technical Changes

### Backend

#### Database Model Changes (`backend/models.py`)
- **New `CategoryList` TypeDecorator**: Custom SQLAlchemy type for storing list of categories as JSON
- **Equipment Model Updates**:
  - Removed single `category` field
  - Added `categories: list[CategoryEnum]` field (stores as JSON)
  - Added `input_count: int` field
  - Added `output_count: int` field

#### Schema Changes (`backend/schemas.py`)
- **EquipmentBase**: Updated to require `categories` as a list with at least one item
- **EquipmentCreate**: Accepts list of categories
- **EquipmentUpdate**: Categories and I/O counts are optional for partial updates
- All schemas validate `categories` is non-empty when provided

#### API Routes (`backend/routers/equipment.py`)
- **POST /api/equipment**: Creates equipment with multiple categories
- **PUT /api/equipment/{id}**: Updates equipment including categories and I/O counts
- Proper handling of category list assignment and updates

### Frontend

#### New Components
1. **EquipmentEditor.jsx** (`frontend/src/components/EquipmentEditor.jsx`)
   - Modal component for editing equipment
   - Multi-select category checkboxes
   - Input fields for I/O counts
   - Form validation

2. **Stylesheet** (`frontend/src/styles/EquipmentEditor.css`)
   - Modern modal UI with dark theme
   - Form styling matching the production system design

#### Updated Components

1. **App.jsx** (`frontend/src/App.jsx`)
   - Added equipment editor state management
   - Multi-category selection in add form with checkboxes
   - Equipment list items now clickable to open editor
   - Multiple category markers displayed per equipment
   - Updated filtering logic to check if equipment includes selected category

2. **EquipmentNode.jsx** (`frontend/src/components/EquipmentNode.jsx`)
   - Display multiple category badges on nodes
   - Use primary category color for handles
   - Show I/O count badges (input in blue, output in green)

3. **Styling Updates** (`frontend/src/index.css`)
   - `.node-domains`: Flexbox container for multiple category dots
   - `.node-domain`: Individual category badge
   - `.node-connections`: Display for I/O count information
   - `.equipment-markers`: Multiple markers for equipment in inventory
   - `.category-multi-select`: Styling for checkbox group in add form
   - `.checkbox-group` and `.checkbox-label`: Checkbox styling

## Data Flow Example

### Creating a Multi-Category Audio Mixer

1. **User Input**:
   - Name: "FOH Console"
   - Categories: [Audio, IT]
   - Manufacturer: "Yamaha"
   - Model: "CL5"
   - Inputs: 32
   - Outputs: 16

2. **API Call**:
   ```json
   POST /api/equipment
   {
     "name": "FOH Console",
     "categories": ["audio", "it"],
     "manufacturer": "Yamaha",
     "model": "CL5",
     "input_count": 32,
     "output_count": 16,
     "x": 100,
     "y": 200
   }
   ```

3. **Database Storage**:
   - Stored as: `["audio", "it"]` in JSON field
   - I/O counts stored as integers

4. **Frontend Display**:
   - Shows both Audio (Blue) and IT (Purple) category markers
   - Displays "32 inputs" and "16 outputs"
   - Can be filtered by either Audio or IT category

## Color Scheme

Domain colors remain consistent across the application:
- **Audio**: Electric Blue (`#3b82f6`)
- **Video**: Emerald Green (`#10b981`)
- **DMX Lights**: Amber/Orange (`#f59e0b`)
- **IT Infrastructure**: Purple/Slate (`#8b5cf6`)

## Usage

### Adding Equipment
1. Enter equipment name
2. Select one or more categories with checkboxes
3. Click "Add to canvas"

### Editing Equipment
1. Click on equipment name in the inventory list
2. Modify properties in the modal dialog
3. Click "Save Changes"

### Viewing Equipment
- Inventory shows all category badges for multi-category equipment
- Canvas nodes display category dots and I/O badges
- Filter by domain shows all equipment matching that category

## Backwards Compatibility Notes

- Old single-category equipment will need migration if data exists
- Fresh database creates with new schema
- API properly handles list-based categories
- Frontend gracefully handles equipment with 1 or multiple categories

## Future Enhancements

Potential improvements for future iterations:
1. Ports management UI in the editor modal
2. Bi-directional port indicators on nodes
3. Category tags with delete capability (X button)
4. Port templates based on category
5. Export topology showing category relationships
6. Category-based filtering rules and presets
