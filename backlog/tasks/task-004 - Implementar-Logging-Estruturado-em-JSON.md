---
id: task-004
title: Implementar Logging Estruturado em JSON
status: Done
assignee: []
created_date: '2026-02-08 02:01'
updated_date: '2026-02-10 13:44'
labels:
  - observability
  - logging
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Converter logs para formato estruturado (JSON) para facilitar parsing, busca e correlação. Logs estruturados permitem queries mais eficientes no Loki e melhor análise.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 APIs .NET, Python e Java gerando logs em formato JSON
- [ ] #2 Trace IDs adicionados aos logs para correlação com traces
- [ ] #3 Campos padronizados em todos os logs (timestamp, level, message, service, trace_id)
- [ ] #4 Queries LogQL atualizadas para aproveitar campos estruturados
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Fase 1: Análise e Preparação (30 min)
1. Verificar bibliotecas disponíveis para cada linguagem
2. Definir schema JSON padronizado para logs
3. Identificar dashboards que precisam atualização

## Fase 2: Python API (1h)
1. Instalar biblioteca python-json-logger
2. Configurar uvicorn para logs estruturados
3. Adicionar middleware para capturar trace_id
4. Configurar logging em main.py e observability.py
5. Testar logs estruturados

## Fase 3: Java API (1h)
1. Adicionar dependência Logback com logstash-encoder
2. Criar logback.xml com configuração JSON
3. Configurar Spring Boot para usar Logback
4. Adicionar MDC para trace_id
5. Testar logs estruturados

## Fase 4: Atualizar Dashboards (30 min)
1. Atualizar queries Python para usar | json
2. Atualizar queries Java para usar | json
3. Criar painéis 'Logs por Nível' corretos
4. Criar painéis 'Top 10 Erros' usando campos JSON
5. Testar visualizações no Grafana

## Fase 5: Validação e Documentação (30 min)
1. Gerar tráfego em todas APIs
2. Validar logs no Loki
3. Validar correlação traces ↔ logs
4. Atualizar CLAUDE.md
5. Atualizar README.md
<!-- SECTION:PLAN:END -->
