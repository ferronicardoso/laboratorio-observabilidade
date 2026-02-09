#!/bin/bash

set -e

echo "💥 CHAOS TEST - .NET API"
echo "========================"
echo ""
echo "🚨 ESTE É O TESTE MAIS AGRESSIVO!"
echo ""
echo "📊 Perfil:"
echo "  - 5s:  0 → 500 VUs"
echo "  - 10s: 500 → 5000 VUs (CAOS TOTAL!)"
echo "  - 30s: Mantém 5000 VUs"
echo "  - 35s: Crash para 0"
echo ""
echo "⚡ Características:"
echo "  - 5000 VUs simultâneos"
echo "  - SEM think time (martelada contínua)"
echo "  - Timeout de 30s"
echo ""
echo "🎯 Objetivo: FORÇAR erros 5xx no sistema"
echo ""

if ! command -v k6 &> /dev/null; then
    echo "❌ k6 não encontrado"
    exit 1
fi

echo "🔍 Verificando API..."
if ! curl -s http://localhost:5000/api/products/count > /dev/null 2>&1; then
    echo "❌ API não está respondendo"
    exit 1
fi
echo "✅ API online"
echo ""

echo "⚠️  AVISO FINAL:"
echo "   - Este teste pode TRAVAR a API"
echo "   - Pode precisar reiniciar containers"
echo "   - CPU vai a 100%"
echo "   - Memória pode esgotar"
echo "   - Sistema operacional pode ficar lento"
echo ""
echo "💡 Grafana: http://localhost:3000/d/dotnet-api-overview"
echo ""
read -p "TEM CERTEZA? Pressione ENTER para iniciar..."

echo ""
echo "💥 Iniciando CHAOS TEST..."
echo ""
k6 run tests/k6/chaos-test-dotnet.js

echo ""
echo "✅ Chaos Test concluído!"
echo ""
echo "📊 Verifique no Grafana:"
echo "   - Taxa de Erros (5xx) deve estar > 10%"
echo "   - Se ainda estiver 0%, sua API é INCRIVELMENTE resiliente!"
echo ""
echo "💡 Alternativas para forçar erros:"
echo "   1. Limitar CPU: docker update dotnet-api --cpus=\"1\""
echo "   2. Limitar RAM: docker update dotnet-api --memory=\"512m\""
echo "   3. Derrubar SQL Server durante teste"
echo ""
