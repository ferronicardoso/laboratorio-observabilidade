#!/bin/bash

# Script para executar Stress Test EXTREMO na API .NET
# ⚠️  ATENÇÃO: Este teste VAI SOBRECARREGAR a API propositalmente!

set -e

echo "🔥 Stress Test EXTREMO - .NET API"
echo "===================================="
echo ""
echo "⚠️  ATENÇÃO: Este teste é MUITO AGRESSIVO!"
echo ""
echo "📊 Perfil do teste:"
echo "  - 0-10s:   Warm-up para 100 VUs"
echo "  - 10-20s:  Ramp-up para 1000 VUs"
echo "  - 20-50s:  EXTREMO: 2000 VUs simultâneos"
echo "  - 50-60s:  Ramp-down para 500 VUs"
echo "  - 60-70s:  Cooldown para 0 VUs"
echo ""
echo "🎯 Objetivo: SOBRECARREGAR a API para gerar erros 5xx"
echo ""
echo "📈 Expectativa:"
echo "  - Taxa de Erros deve subir para 10-50%"
echo "  - Latência P95 deve ultrapassar 2-5 segundos"
echo "  - CPU e Memória vão ao máximo"
echo "  - Connection pool do banco será esgotado"
echo "  - Thread pool será esgotado"
echo ""

# Verificar se k6 está instalado
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 não encontrado. Instale com:"
    echo "   brew install k6  (macOS)"
    echo "   choco install k6 (Windows)"
    echo "   https://k6.io/docs/get-started/installation/"
    exit 1
fi

# Verificar se API está rodando
echo "🔍 Verificando se API .NET está rodando..."
if ! curl -s http://localhost:5000/api/products/count > /dev/null 2>&1; then
    echo "❌ API .NET não está respondendo em http://localhost:5000"
    echo "   Execute: docker compose up -d dotnet-api"
    exit 1
fi
echo "✅ API .NET está online"
echo ""

# Verificar se SQL Server está rodando
echo "🔍 Verificando se SQL Server está rodando..."
if ! docker ps | grep -q mssqlserver; then
    echo "❌ SQL Server não está rodando"
    echo "   Execute: docker compose up -d mssqlserver"
    exit 1
fi
echo "✅ SQL Server está online"
echo ""

# Aviso final
echo "⚠️  ÚLTIMO AVISO:"
echo "   - Este teste VAI causar erros propositalmente"
echo "   - A API ficará muito lenta"
echo "   - Pode haver timeouts e falhas"
echo "   - Isso é ESPERADO e desejado para o teste"
echo ""
echo "💡 Abra o Grafana AGORA para acompanhar:"
echo "   http://localhost:3000/d/dotnet-api-overview"
echo ""
read -p "Pressione ENTER para iniciar o teste de estresse extremo..."

# Executar teste
echo ""
echo "🔥 Iniciando Stress Test EXTREMO..."
echo "   (Duração: ~90 segundos)"
echo ""
k6 run tests/k6/stress-extreme-dotnet.js

echo ""
echo "✅ Stress Test concluído!"
echo ""
echo "📊 Agora verifique no Grafana:"
echo ""
echo "   Row 1 - Health:"
echo "   ✓ Taxa de Erros (5xx) - Deve mostrar 10-50%"
echo "   ✓ RPS - Pico de 1000-2000 req/s"
echo "   ✓ Latência P95 - Deve ter subido para 2-5s"
echo ""
echo "   Row 2 - Performance:"
echo "   ✓ CPU - Deve ter atingido 80-100%"
echo "   ✓ Memória - Deve ter aumentado bastante"
echo "   ✓ Exceptions/min - Deve ter aumentado"
echo ""
echo "   Row 3 - Logs:"
echo "   ✓ Logs por nível - Pico de logs Error"
echo "   ✓ Top Erros - Vários erros de timeout/connection"
echo ""
echo "   Row 5 - SQL Server:"
echo "   ✓ Lock Waits - Pode ter aumentado"
echo "   ✓ Deadlocks - Pode ter alguns"
echo ""
echo "🎓 Se a Taxa de Erros não subiu muito (< 5%):"
echo "   - A API aguentou bem a carga! 💪"
echo "   - Tente aumentar para 3000-5000 VUs no script"
echo "   - Ou reduza recursos do container (CPU/RAM limit)"
echo ""
