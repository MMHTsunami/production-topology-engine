from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Connection, Port
from backend.schemas import ConnectionCreate, ConnectionRead, ConnectionUpdate

router = APIRouter(prefix="/api/connections", tags=["connections"])


def require_port(db: Session, port_id: int) -> Port:
    port = db.get(Port, port_id)
    if port is None:
        raise HTTPException(status_code=404, detail=f"Port {port_id} not found")
    return port


def validate_endpoints(db: Session, source_id: int, destination_id: int) -> None:
    """Validate connection endpoints against signal path rules.
    
    Rules enforced:
    1. Both ports must be from the same category (audio, video, dmx, it)
    2. Bidirectional ports can only connect to other bidirectional ports
    3. For standard ports: output → input flow only
    
    See SIGNAL_PATHS.md for complete documentation.
    """
    if source_id == destination_id:
        raise HTTPException(status_code=422, detail="A connection must use two different ports")
    source = require_port(db, source_id)
    destination = require_port(db, destination_id)
    
    # Validate same category requirement first
    if source.category != destination.category:
        raise HTTPException(
            status_code=422, 
            detail=f"Ports must be in the same category. Source is '{source.category}', destination is '{destination.category}'"
        )
    
    # Check bidirectional compatibility before direction checking
    source_is_bidirectional = source.direction.value == "bidirectional"
    destination_is_bidirectional = destination.direction.value == "bidirectional"
    
    # Bidirectional ports can only connect to bidirectional ports
    if source_is_bidirectional != destination_is_bidirectional:
        raise HTTPException(
            status_code=422,
            detail="Bidirectional ports can only connect to other bidirectional ports"
        )
    
    # Validate port directions for non-bidirectional ports
    if not source_is_bidirectional:
        if source.direction.value != "output":
            raise HTTPException(status_code=422, detail="The source port must be an output")
        if destination.direction.value != "input":
            raise HTTPException(status_code=422, detail="The destination port must be an input")


@router.get("", response_model=list[ConnectionRead])
def list_connections(db: Session = Depends(get_db)) -> list[Connection]:
    return list(db.scalars(select(Connection).order_by(Connection.id)).all())


@router.post(
    "", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED
)
def create_connection(
    payload: ConnectionCreate, db: Session = Depends(get_db)
) -> Connection:
    validate_endpoints(db, payload.source_port_id, payload.destination_port_id)
    connection = Connection(**payload.model_dump())
    db.add(connection)
    db.commit()
    db.refresh(connection)
    return connection


@router.get("/{connection_id}", response_model=ConnectionRead)
def get_connection(
    connection_id: int, db: Session = Depends(get_db)
) -> Connection:
    connection = db.get(Connection, connection_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connection


@router.patch("/{connection_id}", response_model=ConnectionRead)
def update_connection(
    connection_id: int,
    payload: ConnectionUpdate,
    db: Session = Depends(get_db),
) -> Connection:
    connection = db.get(Connection, connection_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    updates = payload.model_dump(exclude_unset=True)
    source_id = updates.get("source_port_id", connection.source_port_id)
    destination_id = updates.get(
        "destination_port_id", connection.destination_port_id
    )
    if source_id is None or destination_id is None:
        raise HTTPException(status_code=422, detail="Connection endpoints cannot be null")
    if "label" in updates and updates["label"] is None:
        raise HTTPException(status_code=422, detail="Connection label cannot be null")
    validate_endpoints(db, source_id, destination_id)
    for field, value in updates.items():
        setattr(connection, field, value)
    db.commit()
    db.refresh(connection)
    return connection


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_connection(
    connection_id: int, db: Session = Depends(get_db)
) -> Response:
    connection = db.get(Connection, connection_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    db.delete(connection)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
