import os
from collections.abc import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool


class Base(DeclarativeBase):
    pass


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'production_flow.db'))}",
)
engine_options: dict[str, object] = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
    if DATABASE_URL in {"sqlite://", "sqlite:///:memory:"}:
        engine_options["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


if DATABASE_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(connection: object, _record: object) -> None:
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def _add_column_if_missing(session: Session, table_name: str, column_name: str, column_def: str) -> None:
    """Add a column to a table if it doesn't already exist (SQLite compatible)"""
    if DATABASE_URL.startswith("sqlite"):
        result = session.execute(
            text(f"PRAGMA table_info({table_name})")
        ).fetchall()
        columns = [row[1] for row in result]
        if column_name not in columns:
            session.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}"))
            session.commit()


def init_db() -> None:
    import backend.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    
    # Apply schema migrations for SQLite
    with SessionLocal() as session:
        _add_column_if_missing(session, "ports", "category", "VARCHAR(50)")
