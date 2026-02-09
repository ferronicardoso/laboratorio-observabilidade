---
id: task-024
title: Corrigir threshold de errors no test-java-api.js
status: To Do
assignee: []
created_date: '2026-02-09 00:58'
updated_date: '2026-02-09 01:08'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
O teste está falhando mesmo com 0% de falhas HTTP e apenas 11% de checks falhando (abaixo do threshold de 15%).

Investigar:
- Por que threshold 'errors' está sendo cruzado
- Se a métrica errorRate está sendo calculada corretamente
- Ajustar threshold ou remover se não for necessário
- Verificar se todos os checks estão corretos

Resultado atual: 88.89% checks aprovados, mas threshold cruza.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Script executando sem erro de threshold
- [ ] #2 Todos os checks passando ou threshold ajustado
- [ ] #3 Documentação atualizada
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
IMPORTANTE: API Java (Spring Boot) usa /actuator/health (não /health).

Endpoints corretos por serviço:
- .NET API: /weatherforecast (não tem /health ainda)
- Python API: /health
- Java API: /actuator/health ← Spring Boot Actuator
- Next.js: /api/health

O script já foi corrigido pelo usuário para usar /actuator/health.
<!-- SECTION:NOTES:END -->
