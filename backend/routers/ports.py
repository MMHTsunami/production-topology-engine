from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Equipment, Port
from backend.schemas import PortCreate, PortRead, PortUpdate

router = APIRouter(prefix="/api/ports", tags=["ports"])


@router.get("", response_model=list[PortRead])
def list_ports(db: Session = Depends(get_db)) -> list[Port]:
    return list(db.scalars(select(Port).order_by(Port.id)).all())


@router.post("", response_model=PortRead, status_code=status.HTTP_201_CREATED)
def create_port(payload: PortCreate, db: Session = Depends(get_db)) -> Port:
    if db.get(Equipment, payload.equipment_id) is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    port = Port(**payload.model_dump())
    db.add(port)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="A port with this name already exists on the equipment"
        ) from error
    db.refresh(port)
    return port


@router.get("/{port_id}", response_model=PortRead)
def get_port(port_id: int, db: Session = Depends(get_db)) -> Port:
    port = db.get(Port, port_id)
    if port is None:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.patch("/{port_id}", response_model=PortRead)
def update_port(
    port_id: int, payload: PortUpdate, db: Session = Depends(get_db)
) -> Port:
    port = db.get(Port, port_id)
    if port is None:
        raise HTTPException(status_code=404, detail="Port not found")
    updates = payload.model_dump(exclude_unset=True)
    if any(
        field in updates and updates[field] is None
        for field in ("name", "direction")
    ):
        raise HTTPException(status_code=422, detail="Port name and direction cannot be null")
    for field, value in updates.items():
        setattr(port, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="A port with this name already exists on the equipment"
        ) from error
    db.refresh(port)
    return port


@router.delete("/{port_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_port(port_id: int, db: Session = Depends(get_db)) -> Response:
    port = db.get(Port, port_id)
    if port is None:
        raise HTTPException(status_code=404, detail="Port not found")
    db.delete(port)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
