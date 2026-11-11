from enum import Enum
import json

from sqlalchemy import (
    CheckConstraint,
    Column,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator, Text

from backend.database import Base


class CategoryEnum(str, Enum):
    AUDIO = "audio"
    VIDEO = "video"
    DMX = "dmx"
    IT = "it"


class PortDirection(str, Enum):
    INPUT = "input"
    OUTPUT = "output"
    BIDIRECTIONAL = "bidirectional"


class CategoryList(TypeDecorator):
    """Custom type for storing list of categories as JSON"""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps([cat.value if isinstance(cat, CategoryEnum) else cat for cat in value])

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return [CategoryEnum(cat) for cat in json.loads(value)]


class CategoryPortConfig(TypeDecorator):
    """Custom type for storing category-specific port configurations as JSON
    
    Example structure:
    {
        "audio": {"input": 4, "output": 2},
        "video": {"input": 1, "output": 1},
        "dmx": {"input": 0, "output": 8},
        "it": {"bidirectional": 4}
    }
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            return value
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return {}
        return json.loads(value)


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    manufacturer: Mapped[str | None] = mapped_column(String(120))
    model: Mapped[str | None] = mapped_column(String(120))
    notes: Mapped[str | None] = mapped_column(String(2000))
    input_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    output_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    x: Mapped[float] = mapped_column(default=0)
    y: Mapped[float] = mapped_column(default=0)
    categories: Mapped[list[CategoryEnum]] = mapped_column(CategoryList, default=[CategoryEnum.AUDIO])
    category_port_config: Mapped[dict] = mapped_column(
        CategoryPortConfig, 
        default={},
        nullable=False
    )

    ports: Mapped[list["Port"]] = relationship(
        back_populates="equipment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Port(Base):
    __tablename__ = "ports"
    __table_args__ = (
        UniqueConstraint("equipment_id", "name", name="uq_port_equipment_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    equipment_id: Mapped[int] = mapped_column(
        ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    direction: Mapped[PortDirection] = mapped_column(
        SqlEnum(
            PortDirection,
            native_enum=False,
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        nullable=False,
    )
    signal: Mapped[str | None] = mapped_column(String(120))
    category: Mapped[str | None] = mapped_column(String(50), default=None)

    equipment: Mapped[Equipment] = relationship(back_populates="ports")


class Connection(Base):
    __tablename__ = "connections"
    __table_args__ = (
        CheckConstraint(
            "source_port_id != destination_port_id",
            name="ck_connection_distinct_ports",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_port_id: Mapped[int] = mapped_column(
        ForeignKey("ports.id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_port_id: Mapped[int] = mapped_column(
        ForeignKey("ports.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(120), default="Signal", nullable=False)
    cable_type: Mapped[str | None] = mapped_column(String(120))

    source_port: Mapped[Port] = relationship(foreign_keys=[source_port_id])
    destination_port: Mapped[Port] = relationship(foreign_keys=[destination_port_id])
