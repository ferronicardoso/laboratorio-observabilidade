import { Counter, Gauge, register } from 'prom-client'

// Métricas customizadas
export const tasksCreatedCounter = new Counter({
  name: 'tasks_created_total',
  help: 'Total de tarefas criadas',
  registers: [register],
})

export const tasksCompletedCounter = new Counter({
  name: 'tasks_completed_total',
  help: 'Total de tarefas concluídas',
  registers: [register],
})

export const activeTasksGauge = new Gauge({
  name: 'tasks_active',
  help: 'Número de tarefas ativas',
  registers: [register],
})

export const apiRequestCounter = new Counter({
  name: 'api_requests_total',
  help: 'Total de requisições à API',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
})
