from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from opentelemetry import trace
from sqlalchemy.orm import Session
import uvicorn
import logging
import time

# Configurar observabilidade
from observability import setup_metrics, setup_tracing, instrument_app, get_meter, setup_json_logging
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Database
from database import get_db, init_db, seed_data
import models

# Configurar logging estruturado JSON
setup_json_logging()
logger = logging.getLogger(__name__)

# Setup OpenTelemetry - Métricas e Tracing
setup_metrics()
setup_tracing()

# Criar aplicação FastAPI
app = FastAPI(
    title="Python API - Lab Observabilidade",
    description="API Python com FastAPI, OpenTelemetry e PostgreSQL",
    version="1.0.0"
)

# Instrumentar FastAPI com OpenTelemetry
instrument_app(app)

# Middleware para adicionar trace context nos logs
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Adiciona trace_id e span_id aos logs"""
    start_time = time.time()

    # Obter span atual
    span = trace.get_current_span()
    context = span.get_span_context()

    # Adicionar ao logger (via extra)
    trace_id = format(context.trace_id, "032x") if context.trace_id != 0 else None
    span_id = format(context.span_id, "016x") if context.span_id != 0 else None

    # Processar requisição
    response = await call_next(request)

    # Calcular duração
    duration_ms = (time.time() - start_time) * 1000

    # Log estruturado da requisição (flatten HTTP fields)
    logger.info(
        f"{request.method} {request.url.path}",
        extra={
            "service": "python-api",
            "trace_id": trace_id,
            "span_id": span_id,
            "http_method": request.method,
            "http_path": str(request.url.path),
            "http_status_code": response.status_code,
            "http_duration_ms": round(duration_ms, 2)
        }
    )

    return response

# Modelos Pydantic (para validação/serialização)
class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    active: bool = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Métricas customizadas
meter = get_meter("python.api", "1.0.0")
items_created_counter = meter.create_counter(
    "items_created_total",
    description="Total de items criados"
)
users_created_counter = meter.create_counter(
    "users_created_total",
    description="Total de usuários criados"
)
items_deleted_counter = meter.create_counter(
    "items_deleted_total",
    description="Total de items deletados"
)

# Inicializar banco de dados ao startup
@app.on_event("startup")
async def startup_event():
    """Executado ao iniciar a aplicação"""
    logger.info("🚀 Iniciando Python API...")
    init_db()
    seed_data()
    logger.info("✅ Python API pronta!")

# Endpoints

@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    """Endpoint de métricas para Prometheus"""
    return generate_latest()

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "API Python com FastAPI e PostgreSQL",
        "version": "1.0.0",
        "database": "PostgreSQL",
        "endpoints": {
            "health": "/health",
            "items": "/items",
            "users": "/users",
            "metrics": "/metrics"
        }
    }

@app.get("/health")
async def health(db: Session = Depends(get_db)):
    """Health check com contagem do banco"""
    try:
        items_count = db.query(models.Item).count()
        users_count = db.query(models.User).count()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "PostgreSQL",
            "items_count": items_count,
            "users_count": users_count
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")

# Items endpoints
@app.get("/items", response_model=List[ItemResponse])
async def get_items(db: Session = Depends(get_db)):
    """Listar todos os items"""
    items = db.query(models.Item).all()
    return items

@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Obter item por ID"""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item

@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Criar novo item"""
    db_item = models.Item(
        name=item.name,
        description=item.description,
        price=item.price
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Incrementar métrica customizada
    items_created_counter.add(1)

    return db_item

@app.delete("/items/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Deletar item"""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    db.delete(item)
    db.commit()

    # Incrementar métrica customizada
    items_deleted_counter.add(1)

    return {"message": "Item deletado com sucesso"}

# Users endpoints
@app.get("/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """Listar todos os usuários"""
    users = db.query(models.User).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Obter usuário por ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Criar novo usuário"""
    # Verificar se username já existe
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username já existe")

    db_user = models.User(
        username=user.username,
        email=user.email,
        active=user.active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Incrementar métrica customizada
    users_created_counter.add(1)

    return db_user

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
