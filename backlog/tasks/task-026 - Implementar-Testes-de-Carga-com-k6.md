---
id: task-026
title: Implementar Testes de Carga com k6
status: Done
assignee: []
created_date: '2026-02-10 02:12'
updated_date: '2026-02-10 02:12'
labels:
  - testing
  - observability
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Criar testes de carga automatizados para validar a observabilidade das APIs sob estresse. Implementar spike tests (picos súbitos de carga) e chaos tests (carga extrema) para todas as APIs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Spike tests criados para .NET, Java e Python APIs
- [x] #2 Chaos tests criados para .NET, Java e Python APIs
- [x] #3 Scripts validam métricas do Prometheus automaticamente
- [x] #4 Scripts shell wrapper para facilitar execução
- [x] #5 Documentação completa dos testes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementados spike tests (500 VUs) e chaos tests (5000 VUs) para .NET, Java e Python APIs. Scripts validam métricas do Prometheus (taxa de erros, latência, conexões DB). Scripts shell wrapper criados (spike-test-*.sh, chaos-test-*.sh). README.md completo com documentação, thresholds e troubleshooting.
<!-- SECTION:NOTES:END -->
