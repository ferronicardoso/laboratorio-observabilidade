---
id: task-020
title: Criar dashboard Database Performance
status: Done
assignee:
  - '@claude'
created_date: '2026-02-09 00:56'
updated_date: '2026-02-10 17:12'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dashboard deep dive em performance de SQL:
- SQL queries mais lentas (dos traces EF Core)
- Query frequency e patterns
- Connection pool metrics
- Database size e crescimento
- Queries por endpoint
- Slow query alerts
- Query execution plan visualization
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Dashboard criado focado em database
- [x] #2 Top slow queries visível
- [x] #3 Métricas de connection pool
- [x] #4 Correlação query → endpoint
<!-- AC:END -->
