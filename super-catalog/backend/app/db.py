"""The SQLite database. It's reloaded with the sample data every time the server starts."""

from collections.abc import Iterator

from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine, select

from .config import settings

engine = create_engine(
    f"sqlite:///{settings.database_path}",
    connect_args={"check_same_thread": False, "timeout": 30},
)


@event.listens_for(engine, "connect")
def _configure_sqlite(dbapi_connection, _connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def reset_database() -> None:
    """Create the tables and load the sample data. KEEP_DATA=true keeps an existing database."""
    from .models import Product
    from .seed import load_sample_data

    SQLModel.metadata.create_all(engine)
    if settings.keep_data:
        with Session(engine) as session:
            if session.exec(select(Product)).first() is not None:
                return
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        load_sample_data(session)
        session.commit()


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
