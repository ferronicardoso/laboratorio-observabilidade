---
id: task-018
title: Criar dashboard Unified Logging
status: Done
assignee:
  - '@claude'
created_date: '2026-02-09 00:55'
updated_date: '2026-02-10 23:54'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dashboard profissional de logs estruturados com:
- Logs em tempo real com filtros (service, level, trace ID)
- Log patterns e frequency analysis
- Error rate por serviço
- Drill-down: Click em log → Ver trace completo
- Search com regex e JSON fields
- Correlação automática logs ↔ traces
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Dashboard criado em observability/grafana/provisioning/dashboards/json/
- [x] #2 Visualizações profissionais e informativas
- [x] #3 Filtros funcionais por service, level, trace_id
- [x] #4 Link para traces funcionando
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analisar estrutura de logs no Loki (labels disponíveis: container, job, level, trace_id)
2. Criar arquivo unified-logging.json em observability/grafana/provisioning/dashboards/json/
3. Implementar variáveis de filtro:
   - Service selector (container/job)
   - Log level (info, warn, error)
   - Trace ID search
   - Time range
4. Criar painéis principais:
   - Logs Stream (tabela em tempo real com highlight de errors)
   - Log Volume por Service (time series)
   - Error Rate por Service (stat + time series)
   - Log Patterns/Frequency (bar chart com top patterns)
   - Error Distribution (pie chart)
5. Configurar data links para correlação logs → traces:
   - Extrair trace_id dos logs
   - Link para Tempo com query TraceQL
6. Adicionar LogQL queries otimizadas:
   - Use de filtros e parsers
   - Aggregations para metrics
7. Testar dashboard:
   - Gerar logs de teste nas aplicações
   - Verificar filtros funcionando
   - Testar drill-down para traces
8. Adicionar ao provisioning e recarregar Grafana (down + up)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Dashboard Unified Logging implementado com sucesso!

**Arquivo criado:**
- observability/grafana/provisioning/dashboards/json/unified-logging.json

**Painéis implementados:**
1. **Overview (stats):**
   - Total Logs: Contador total de logs no período
   - Error Logs: Contador de erros
   - Logs by Level: Bar chart mostrando distribuição por nível
   - Logs by Service: Pie chart mostrando distribuição por serviço

2. **Log Volume & Error Rate:**
   - Log Volume by Service: Time series com taxa de logs/s por serviço (stacked)
   - Error Rate by Service: Time series com taxa de erros/s por serviço

3. **Log Patterns:**
   - Top Log Patterns: Bar chart horizontal com os 15 padrões mais comuns (usando Loki pattern ingester)
   - Top Error Messages: Bar chart horizontal com as 15 mensagens de erro mais comuns

4. **Log Stream:**
   - Live Logs: Painel de logs em tempo real com prettify JSON
   - Data link configurado para drill-down logs → traces no Tempo

**Variáveis de filtro:**
- Service: Multi-select dinâmico (query label_values)
- Level: Multi-select customizado (info, warn, error, debug)
- Trace ID: Textbox para busca de trace ID específico (aceita regex)

**Queries LogQL:**
- Usa filtros com regex case-insensitive: |~ "(?i)$level"
- Extração de campos JSON com | json
- Detecção automática de level em diferentes formatos (@l para .NET, level para outros)
- Suporte a busca por trace_id (@tr, TraceId, trace_id)
- Pattern analysis usando | pattern

**Data Link para Traces:**
- Configurado no painel Live Logs
- Extrai trace_id dos logs JSON
- Link direto para Tempo com query TraceQL
- Abre em nova aba

**Configurações:**
- Refresh: 10s
- Time range: now-30m to now
- Tags: logs, observability
- UID: unified-logging

**Testes realizados:**
- Gerado tráfego nas APIs (.NET, Python, Java)
- Verificado logs chegando no Loki (5 containers ativos)
- Dashboard provisionado automaticamente pelo Grafana
- Filtros funcionando corretamente

**Acesso:**
http://localhost:3000 → Dashboards → Unified Logging
<!-- SECTION:NOTES:END -->
