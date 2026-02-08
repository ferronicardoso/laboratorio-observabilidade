---
id: task-016
title: Migrar Laboratório para Kubernetes
status: To Do
assignee: []
created_date: '2026-02-08 02:02'
labels:
  - kubernetes
  - observability
  - cloud-native
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Migrar toda a stack de observabilidade e aplicações para Kubernetes usando Helm charts e operators. Demonstra observabilidade em ambientes cloud-native.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Cluster Kubernetes configurado (local com kind/minikube ou cloud)
- [ ] #2 Aplicações deployadas via Helm charts ou Kustomize
- [ ] #3 Prometheus Operator instalado para gerenciar Prometheus
- [ ] #4 Service Mesh opcional configurado (Istio ou Linkerd) com métricas
- [ ] #5 Dashboards atualizados para métricas do Kubernetes (pods, nodes, namespaces)
<!-- AC:END -->
