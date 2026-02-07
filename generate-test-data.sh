#!/bin/bash

# Script para gerar dados de teste em todas as APIs
# Autor: Raphael Augusto Ferroni Cardoso

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Gerador de Dados de Teste - Lab Observabilidade${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Função para fazer requisições com tratamento de erro
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local api_name=$4

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} $api_name - Status: $http_code"
    else
        echo -e "${RED}✗${NC} $api_name - Status: $http_code"
    fi
}

# Aguardar APIs estarem prontas
echo -e "${YELLOW}Aguardando APIs iniciarem...${NC}"
sleep 2
echo ""

# ==========================================
# NGINX
# ==========================================
echo -e "${BLUE}>>> NGINX (porta 8080)${NC}"
make_request "GET" "http://localhost:8080" "" "NGINX - Página Inicial"
make_request "GET" "http://localhost:8080/not-found" "" "NGINX - Not Found"
echo ""

# ==========================================
# ANGULAR
# ==========================================
echo -e "${BLUE}>>> ANGULAR (porta 4200)${NC}"
make_request "GET" "http://localhost:4200" "" "ANGULAR - Página Inicial"
echo ""

# ==========================================
# .NET API
# ==========================================
echo -e "${BLUE}>>> .NET API (porta 5000)${NC}"
make_request "GET" "http://localhost:5000/weatherforecast" "" ".NET - Weather Forecast"
echo ""

# ==========================================
# Python API
# ==========================================
echo -e "${BLUE}>>> Python API (porta 8001)${NC}"
make_request "GET" "http://localhost:8001/health" "" "Python - Health Check"
make_request "POST" "http://localhost:8001/items" '{"name":"Notebook Dell XPS 15","description":"Laptop de alta performance"}' "Python - Criar Item 1"
make_request "POST" "http://localhost:8001/items" '{"name":"Mouse Logitech MX Master","description":"Mouse ergonômico"}' "Python - Criar Item 2"
make_request "POST" "http://localhost:8001/items" '{"name":"Teclado Mecânico","description":"Teclado mecânico RGB"}' "Python - Criar Item 3"
make_request "POST" "http://localhost:8001/users" '{"name":"João Silva","email":"joao.silva@email.com"}' "Python - Criar Usuário 1"
make_request "POST" "http://localhost:8001/users" '{"name":"Maria Santos","email":"maria.santos@email.com"}' "Python - Criar Usuário 2"
make_request "GET" "http://localhost:8001/items" "" "Python - Listar Items"
make_request "GET" "http://localhost:8001/users" "" "Python - Listar Usuários"
make_request "DELETE" "http://localhost:8001/items/1" "" "Python - Deletar Item"
echo ""

# ==========================================
# Java API
# ==========================================
echo -e "${BLUE}>>> Java API (porta 8002)${NC}"
make_request "GET" "http://localhost:8002/health" "" "Java - Health Check"
make_request "POST" "http://localhost:8002/api/products" '{"name":"Notebook","price":2500.00}' "Java - Criar Produto 1"
make_request "POST" "http://localhost:8002/api/products" '{"name":"Mouse","price":150.00}' "Java - Criar Produto 2"
make_request "POST" "http://localhost:8002/api/products" '{"name":"Teclado","price":350.00}' "Java - Criar Produto 3"
make_request "POST" "http://localhost:8002/api/orders" '{"productName":"Notebook","quantity":2}' "Java - Criar Pedido 1"
make_request "POST" "http://localhost:8002/api/orders" '{"productName":"Mouse","quantity":5}' "Java - Criar Pedido 2"
make_request "GET" "http://localhost:8002/api/products" "" "Java - Listar Produtos"
make_request "GET" "http://localhost:8002/api/orders" "" "Java - Listar Pedidos"
make_request "DELETE" "http://localhost:8002/api/orders/1" "" "Java - Completar Pedido"
echo ""

# ==========================================
# Next.js API
# ==========================================
echo -e "${BLUE}>>> Next.js API (porta 3001)${NC}"
make_request "GET" "http://localhost:3001" "" "Next.js - Página Inicial"
make_request "GET" "http://localhost:3001/api/health" "" "Next.js - Health Check"
make_request "POST" "http://localhost:3001/api/tasks" '{"title":"Implementar observabilidade","completed":false}' "Next.js - Criar Tarefa 1"
make_request "POST" "http://localhost:3001/api/tasks" '{"title":"Criar dashboards no Grafana","completed":false}' "Next.js - Criar Tarefa 2"
make_request "POST" "http://localhost:3001/api/tasks" '{"title":"Configurar alertas","completed":false}' "Next.js - Criar Tarefa 3"
make_request "GET" "http://localhost:3001/api/tasks" "" "Next.js - Listar Tarefas"
make_request "PATCH" "http://localhost:3001/api/tasks/1" '{"completed":true}' "Next.js - Completar Tarefa"
make_request "DELETE" "http://localhost:3001/api/tasks/2" "" "Next.js - Deletar Tarefa"
echo ""

# ==========================================
# Loop contínuo (opcional)
# ==========================================
if [ "$1" = "--loop" ]; then
    echo -e "${YELLOW}Modo loop ativado. Gerando dados continuamente...${NC}"
    echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"
    echo ""

    while true; do
        sleep 10
        echo -e "${BLUE}[$(date '+%H:%M:%S')] Gerando nova rodada de dados...${NC}"

        # Requisições aleatórias
        make_request "GET" "http://localhost:8080" "" "NGINX - Página Inicial"
        make_request "GET" "http://localhost:5000/weatherforecast" "" ".NET"
        make_request "GET" "http://localhost:8001/items" "" "Python"
        make_request "GET" "http://localhost:8002/api/products" "" "Java"
        make_request "GET" "http://localhost:3001/api/tasks" "" "Next.js"
        make_request "GET" "http://localhost:3001" "" "Next.js - Página Inicial"
        make_request "GET" "http://localhost:4200" "" "ANGULAR - Página Inicial"
        echo ""
    done
fi

# ==========================================
# Resumo
# ==========================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Dados de teste gerados com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Acesse o Grafana para visualizar as métricas e logs:"
echo -e "  ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "Para gerar dados continuamente, execute:"
echo -e "  ${YELLOW}./generate-test-data.sh --loop${NC}"
echo ""
