"""
Configuração do PostgreSQL com SQLAlchemy
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import os
import logging

logger = logging.getLogger(__name__)

# Database URL do PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://labuser:labpass@postgres:5432/observability_lab"
)

# Criar engine com connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,           # Aumentado de 5 para 20
    max_overflow=30,        # Aumentado de 10 para 30
    pool_pre_ping=True,     # Verifica conexão antes de usar
    pool_recycle=3600,      # Recicla conexões a cada hora
    echo=False              # Log de queries SQL (False em produção)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """
    Dependency para obter sessão do banco.
    Usa yield para garantir que a sessão seja fechada.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Inicializar banco de dados (criar tabelas)"""
    from models import Base
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas do PostgreSQL criadas/verificadas")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise


def seed_data():
    """Popular banco com dados iniciais"""
    from models import Item, User

    db = SessionLocal()
    try:
        # Verificar se já tem dados
        if db.query(Item).count() > 0:
            logger.info("ℹ️  Banco já tem dados, pulando seed")
            return

        # Criar items iniciais
        items = [
            Item(name="Laptop", description="High-performance laptop", price=1299.99),
            Item(name="Mouse", description="Wireless mouse", price=29.99),
            Item(name="Keyboard", description="Mechanical keyboard", price=89.99),
            Item(name="Monitor", description="4K monitor 27 inch", price=399.99),
            Item(name="Headphones", description="Noise-canceling headphones", price=199.99),
            Item(name="Webcam", description="HD webcam", price=79.99),
            Item(name="USB Cable", description="USB-C cable 2m", price=14.99),
            Item(name="Desk Lamp", description="LED desk lamp", price=39.99),
            Item(name="Chair", description="Ergonomic office chair", price=299.99),
            Item(name="Desk", description="Standing desk", price=499.99),
        ]
        db.add_all(items)

        # Criar users iniciais
        users = [
            User(username="alice", email="alice@example.com", active=True),
            User(username="bob", email="bob@example.com", active=True),
            User(username="charlie", email="charlie@example.com", active=True),
            User(username="diana", email="diana@example.com", active=False),
            User(username="eve", email="eve@example.com", active=True),
        ]
        db.add_all(users)

        db.commit()
        logger.info("✅ Dados iniciais inseridos (10 items, 5 users)")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao popular dados: {e}")
    finally:
        db.close()
