---
id: task-001
title: Implementar Distributed Tracing com Grafana Tempo
status: To Do
assignee: []
created_date: '2026-02-08 02:00'
labels:
  - observability
  - tracing
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Adicionar rastreamento distribuído (traces) para completar os 3 pilares da observabilidade (métricas, logs, traces). Grafana Tempo permite visualizar o caminho completo de requisições entre serviços.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Grafana Tempo instalado e configurado no docker-compose
- [ ] #2 OpenTelemetry configurado para exportar traces nas APIs .NET, Python e Java
- [ ] #3 Spans visíveis no Grafana mostrando latência entre serviços
- [ ] #4 Dashboard criado para visualização de traces
<!-- AC:END -->
