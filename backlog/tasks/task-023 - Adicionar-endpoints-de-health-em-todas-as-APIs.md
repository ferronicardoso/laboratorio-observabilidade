---
id: task-023
title: Adicionar endpoints de health em todas as APIs
status: To Do
assignee: []
created_date: '2026-02-09 00:57'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Padronizar endpoint /health em todas as aplicações:
- .NET API: criar endpoint /health (atualmente só tem /weatherforecast)
- Python API: já tem /health ✅
- Java API: já tem /health ✅
- Next.js: padronizar /health (atualmente /api/health)
- Angular: adicionar /health para consistency
- Nginx: adicionar health check

Todos devem retornar JSON: {"status": "UP", "timestamp": "..."}
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Endpoint /health em todas as APIs
- [ ] #2 Formato JSON padronizado
- [ ] #3 Scripts k6 atualizados para usar /health
- [ ] #4 Testes passando sem erros
<!-- AC:END -->
