#!/bin/bash

# Script para executar Spike Test na API .NET
# Simula pico súbito de tráfego para testar comportamento sob estresse

set -e

echo "🚀 Spike Test - .NET API"
echo "========================"
echo ""
echo "📊 Perfil do teste:"
echo "  - 0-10s:  Ramp-up para 50 VUs (carga normal)"
echo "  - 10-15s: SPIKE para 500 VUs (aumento de 10x em 5s)"
echo "  - 15-45s: Mantém 500 VUs (30s no pico)"
echo "  - 45-50s: Ramp-down para 50 VUs (5s)"
echo "  - 50-60s: Cooldown para 0 VUs (10s)"
echo ""
echo "🎯 Objetivo: Testar comportamento da API sob pico súbito de tráfego"
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

# Abrir Grafana no navegador (opcional)
echo "💡 Dica: Abra o Grafana para acompanhar o teste em tempo real:"
echo "   http://localhost:3000/d/dotnet-api-overview"
echo ""
echo "⏱️  Aguardando 5 segundos para você abrir o Grafana..."
sleep 5

# Executar teste
echo ""
echo "🔥 Iniciando Spike Test..."
echo ""
k6 run tests/k6/spike-test-dotnet.js

echo ""
echo "✅ Spike Test concluído!"
echo ""
echo "📈 Verifique no Grafana:"
echo "   - Pico de RPS durante o spike"
echo "   - Latência P95 durante o pico"
echo "   - Taxa de erros (deve ficar < 10%)"
echo "   - CPU e Memória da aplicação"
echo "   - GC Heap durante estresse"
echo "   - Traces das requisições mais lentas"
echo ""
