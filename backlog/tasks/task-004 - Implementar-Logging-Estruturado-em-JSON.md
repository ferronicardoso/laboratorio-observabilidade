---
id: task-004
title: Implementar Logging Estruturado em JSON
status: To Do
assignee: []
created_date: '2026-02-08 02:01'
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
