from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Equipment, Port, PortDirection, CategoryEnum
from backend.schemas import EquipmentCreate, EquipmentRead, EquipmentUpdate

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


def _generate_ports_for_equipment(equipment: Equipment, db: Session) -> None:
    """Generate ports for equipment based on input/output counts or category config.
    
    Supports two modes:
    1. Legacy mode: uses equipment.input_count and equipment.output_count
    2. Category mode: uses equipment.category_port_config for per-category port counts
    """
    # Clear existing ports
    db.query(Port).filter(Port.equipment_id == equipment.id).delete()
    
    is_it_equipment = CategoryEnum.IT in equipment.categories
    
    # Use category-specific config if available, otherwise fall back to legacy counts
    if equipment.category_port_config:
        # Per-category port generation
        for category in equipment.categories:
            if category not in equipment.category_port_config:
                continue
            
            config = equipment.category_port_config[category]
            category_str = category.value if isinstance(category, CategoryEnum) else category
            
            if category_str == "it":
                # IT equipment uses bidirectional ports
                bidirectional_count = config.get("bidirectional", 0)
                for i in range(1, bidirectional_count + 1):
                    port = Port(
                        equipment_id=equipment.id,
                        name=f"{category_str.upper()} Port {i}",
                        direction=PortDirection.BIDIRECTIONAL,
                        signal="Network",
                        category=category_str
                    )
                    db.add(port)
            else:
                # Audio, Video, DMX use separate input/output ports
                input_count = config.get("input", 0)
                output_count = config.get("output", 0)
                
                for i in range(1, input_count + 1):
                    port = Port(
                        equipment_id=equipment.id,
                        name=f"{category_str.upper()} Input {i}",
                        direction=PortDirection.INPUT,
                        signal=None,
                        category=category_str
                    )
                    db.add(port)
                
                for i in range(1, output_count + 1):
                    port = Port(
                        equipment_id=equipment.id,
                        name=f"{category_str.upper()} Output {i}",
                        direction=PortDirection.OUTPUT,
                        signal=None,
                        category=category_str
                    )
                    db.add(port)
    else:
        # Legacy mode: use global input_count and output_count
        primary_category = equipment.categories[0]
        category_str = primary_category.value if isinstance(primary_category, CategoryEnum) else primary_category
        
        if is_it_equipment:
            # For IT equipment, create bidirectional ports
            port_count = equipment.input_count
            for i in range(1, port_count + 1):
                port = Port(
                    equipment_id=equipment.id,
                    name=f"Port {i}",
                    direction=PortDirection.BIDIRECTIONAL,
                    signal="Network",
                    category=category_str
                )
                db.add(port)
        else:
            # For audio, video, and DMX: create separate input and output ports
            for i in range(1, equipment.input_count + 1):
                port = Port(
                    equipment_id=equipment.id,
                    name=f"Input {i}",
                    direction=PortDirection.INPUT,
                    signal=None,
                    category=category_str
                )
                db.add(port)
            
            for i in range(1, equipment.output_count + 1):
                port = Port(
                    equipment_id=equipment.id,
                    name=f"Output {i}",
                    direction=PortDirection.OUTPUT,
                    signal=None,
                    category=category_str
                )
                db.add(port)



@router.get("", response_model=list[EquipmentRead])
def list_equipment(db: Session = Depends(get_db)) -> list[Equipment]:
    return list(db.scalars(select(Equipment).order_by(Equipment.id)).all())


@router.post("", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
def create_equipment(
    payload: EquipmentCreate, db: Session = Depends(get_db)
) -> Equipment:
    data = payload.model_dump()
    categories = data.pop("categories")
    equipment = Equipment(**data)
    equipment.categories = categories
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    
    # Generate ports based on input/output counts
    _generate_ports_for_equipment(equipment, db)
    db.commit()
    db.refresh(equipment)
    
    return equipment


@router.get("/{equipment_id}", response_model=EquipmentRead)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentRead)
def update_equipment(
    equipment_id: int,
    payload: EquipmentUpdate,
    db: Session = Depends(get_db),
) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    data = payload.model_dump(exclude_unset=True)
    categories = data.pop("categories", None)
    
    # Track if port counts have changed
    port_config_changed = "category_port_config" in data
    port_count_changed = (
        "input_count" in data or "output_count" in data
    ) or categories is not None
    
    for field, value in data.items():
        setattr(equipment, field, value)
    
    if categories is not None:
        equipment.categories = categories
    
    db.commit()
    db.refresh(equipment)
    
    # Regenerate ports if counts or configuration changed
    if port_count_changed or port_config_changed:
        _generate_ports_for_equipment(equipment, db)
        db.commit()
        db.refresh(equipment)
    
    return equipment



@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)) -> Response:
    equipment = db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    db.delete(equipment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{equipment_id}/regenerate-ports", response_model=EquipmentRead)
def regenerate_ports(equipment_id: int, db: Session = Depends(get_db)) -> Equipment:
    """Regenerate ports for equipment based on current input/output counts."""
    equipment = db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    _generate_ports_for_equipment(equipment, db)
    db.commit()
    db.refresh(equipment)
    
    return equipment
