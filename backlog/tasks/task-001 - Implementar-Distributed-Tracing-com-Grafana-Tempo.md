---
id: task-001
title: Implementar Distributed Tracing com Grafana Tempo
status: Done
assignee: []
created_date: '2026-02-08 02:00'
updated_date: '2026-02-10 02:11'
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
- [x] #1 Grafana Tempo instalado e configurado no docker-compose
- [x] #2 OpenTelemetry configurado para exportar traces nas APIs .NET, Python e Java
- [x] #3 Spans visíveis no Grafana mostrando latência entre serviços
- [x] #4 Dashboard criado para visualização de traces
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementado Grafana Tempo v2.9.1 com OpenTelemetry em todas as APIs (.NET manual, Java com Java Agent, Python já tinha). Service Graph funcionando, métricas de traces enviadas ao Prometheus via remote_write. Documentação completa no CLAUDE.md.
<!-- SECTION:NOTES:END -->
