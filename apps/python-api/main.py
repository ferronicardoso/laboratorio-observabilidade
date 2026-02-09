from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
import logging

# Configurar observabilidade
from observability import setup_metrics, setup_tracing, instrument_app, get_meter
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup OpenTelemetry - Métricas e Tracing
setup_metrics()
setup_tracing()

# Criar aplicação FastAPI
app = FastAPI(
    title="Python API - Lab Observabilidade",
    description="API Python com FastAPI e OpenTelemetry",
    version="1.0.0"
)

# Instrumentar FastAPI com OpenTelemetry
instrument_app(app)

# Modelos de dados
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    created_at: Optional[datetime] = None

class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    active: bool = True

# Banco de dados em memória (apenas para demo)
items_db: List[Item] = []
users_db: List[User] = []
item_counter = 0
user_counter = 0

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

# Endpoints

@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    """Endpoint de métricas para Prometheus"""
    return generate_latest()

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "API Python com FastAPI",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "items": "/items",
            "users": "/users",
            "metrics": "/metrics"
        }
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "items_count": len(items_db),
        "users_count": len(users_db)
    }

# Items endpoints
@app.get("/items", response_model=List[Item])
async def get_items():
    """Listar todos os items"""
    return items_db

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Obter item por ID"""
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item não encontrado")

@app.post("/items", response_model=Item, status_code=201)
async def create_item(item: Item):
    """Criar novo item"""
    global item_counter
    item_counter += 1
    item.id = item_counter
    item.created_at = datetime.now()
    items_db.append(item)

    # Incrementar métrica customizada
    items_created_counter.add(1)

    return item

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Deletar item"""
    global items_db
    for i, item in enumerate(items_db):
        if item.id == item_id:
            items_db.pop(i)

            # Incrementar métrica customizada
            items_deleted_counter.add(1)

            return {"message": "Item deletado com sucesso"}
    raise HTTPException(status_code=404, detail="Item não encontrado")

# Users endpoints
@app.get("/users", response_model=List[User])
async def get_users():
    """Listar todos os usuários"""
    return users_db

@app.post("/users", response_model=User, status_code=201)
async def create_user(user: User):
    """Criar novo usuário"""
    global user_counter
    user_counter += 1
    user.id = user_counter
    users_db.append(user)

    # Incrementar métrica customizada
    users_created_counter.add(1)

    return user

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
