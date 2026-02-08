---
id: task-008
title: Adicionar RabbitMQ com Exporter ao Lab
status: To Do
assignee: []
created_date: '2026-02-08 02:01'
labels:
  - observability
  - messaging
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expandir o laboratório adicionando message broker RabbitMQ com rabbitmq_exporter para demonstrar observabilidade de mensageria.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 RabbitMQ rodando no docker-compose
- [ ] #2 rabbitmq_exporter instalado e coletando métricas
- [ ] #3 API(s) usando RabbitMQ para mensageria assíncrona
- [ ] #4 Dashboard criado com métricas do RabbitMQ (mensagens/s, filas, consumers, throughput)
<!-- AC:END -->
