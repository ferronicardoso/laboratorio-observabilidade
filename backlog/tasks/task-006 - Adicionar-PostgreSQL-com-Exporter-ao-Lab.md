---
id: task-006
title: Adicionar PostgreSQL com Exporter ao Lab
status: Done
assignee: []
created_date: '2026-02-08 02:01'
updated_date: '2026-02-10 02:11'
labels:
  - observability
  - database
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expandir o laboratório adicionando banco de dados PostgreSQL com postgres_exporter para demonstrar observabilidade de bancos de dados relacionais.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 PostgreSQL rodando no docker-compose
- [x] #2 postgres_exporter instalado e coletando métricas
- [x] #3 API(s) conectadas ao PostgreSQL para operações CRUD
- [x] #4 Dashboard criado com métricas do PostgreSQL (conexões, queries/s, cache hit rate, locks)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
PostgreSQL implementado com Python API, postgres_exporter coletando métricas, dashboard completo criado (cache hit ratio, conexões, transações, deadlocks). Também foram adicionados SQL Server + mssql-exporter (.NET API) e MySQL + mysql-exporter (Java API).
<!-- SECTION:NOTES:END -->
