---
id: task-025
title: Adicionar SQL Server e MySQL com Exporters ao Lab
status: Done
assignee: []
created_date: '2026-02-10 02:12'
updated_date: '2026-02-10 02:12'
labels:
  - observability
  - database
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expandir laboratório adicionando SQL Server 2019 (.NET API) e MySQL (Java API) com seus respectivos exporters para demonstrar observabilidade de múltiplos bancos de dados.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 SQL Server 2019 rodando no docker-compose
- [x] #2 mssql-exporter instalado e coletando métricas
- [x] #3 MySQL rodando no docker-compose
- [x] #4 mysql-exporter instalado e coletando métricas
- [x] #5 APIs conectadas aos respectivos bancos
- [x] #6 Dashboards criados para SQL Server e MySQL
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
SQL Server 2019 com mssql-exporter conectado à .NET API. MySQL com mysql-exporter conectado à Java API. Dashboards completos criados com métricas de performance (buffer cache, connections, queries/s, etc.). Integração com JPA (Java) e Entity Framework Core (.NET).
<!-- SECTION:NOTES:END -->
