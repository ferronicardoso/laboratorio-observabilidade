#!/bin/bash

set -e

echo "⚡ SPIKE TEST - Python API"
echo "=========================="
echo ""
echo "📊 Perfil do teste:"
echo "  - 0-10s:  Warm-up para 50 VUs"
echo "  - 10-15s: SPIKE para 500 VUs"
echo "  - 15-35s: Mantém 500 VUs"
echo "  - 35-45s: Ramp-down para 50 VUs"
echo "  - 45-50s: Cooldown para 0 VUs"
echo ""

if ! command -v k6 &> /dev/null; then
    echo "❌ k6 não encontrado"
    exit 1
fi

echo "🔍 Verificando Python API..."
if ! curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "❌ Python API não está respondendo"
    exit 1
fi
echo "✅ Python API online"
echo ""

echo "🔍 Verificando PostgreSQL..."
if ! docker ps | grep -q postgres; then
    echo "❌ PostgreSQL não está rodando"
    exit 1
fi
echo "✅ PostgreSQL online"
echo ""

echo "💡 Abra o Grafana para acompanhar:"
echo "   http://localhost:3000/d/python-api-overview"
echo ""
read -p "Pressione ENTER para iniciar o teste..."

echo ""
echo "⚡ Iniciando Spike Test..."
echo ""
k6 run tests/k6/spike-test-python.js

echo ""
echo "✅ Spike Test concluído!"
echo ""
echo "📊 Verifique no Grafana:"
echo "   - Taxa de Erros (5xx)"
echo "   - Latência P95"
echo "   - CPU Usage"
echo "   - Memória RSS (Python)"
echo "   - Conexões PostgreSQL"
echo ""
