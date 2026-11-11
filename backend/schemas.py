from pydantic import BaseModel, ConfigDict, Field

from backend.models import CategoryEnum, PortDirection


class PortBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    direction: PortDirection
    signal: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=50)


class PortCreate(PortBase):
    equipment_id: int


class PortUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    direction: PortDirection | None = None
    signal: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=50)


class PortRead(PortBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    equipment_id: int


class CategoryPortCountsBase(BaseModel):
    """Port counts for a specific category"""
    input: int = Field(default=0, ge=0)
    output: int = Field(default=0, ge=0)
    bidirectional: int = Field(default=0, ge=0)


class EquipmentBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    categories: list[CategoryEnum] = Field(min_length=1)
    manufacturer: str | None = Field(default=None, max_length=120)
    model: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=2000)
    input_count: int = Field(default=0, ge=0)
    output_count: int = Field(default=0, ge=0)
    category_port_config: dict = Field(default_factory=dict)
    x: float = 0
    y: float = 0


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    categories: list[CategoryEnum] | None = Field(default=None, min_length=1)
    manufacturer: str | None = Field(default=None, max_length=120)
    model: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=2000)
    input_count: int | None = Field(default=None, ge=0)
    output_count: int | None = Field(default=None, ge=0)
    category_port_config: dict | None = None
    x: float | None = None
    y: float | None = None


class EquipmentRead(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ports: list[PortRead] = Field(default_factory=list)


class ConnectionBase(BaseModel):
    source_port_id: int
    destination_port_id: int
    label: str = Field(default="Signal", min_length=1, max_length=120)
    cable_type: str | None = Field(default=None, max_length=120)


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionUpdate(BaseModel):
    source_port_id: int | None = None
    destination_port_id: int | None = None
    label: str | None = Field(default=None, min_length=1, max_length=120)
    cable_type: str | None = Field(default=None, max_length=120)


class ConnectionRead(ConnectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

