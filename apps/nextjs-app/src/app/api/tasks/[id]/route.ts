import { NextResponse } from 'next/server'
import { tasksCompletedCounter, activeTasksGauge, apiRequestCounter } from '@/lib/metrics'

// Simular banco de dados
let tasks: any[] = []

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) {
      apiRequestCounter.inc({ method: 'PATCH', endpoint: '/api/tasks/:id', status: '404' })
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...body }

    if (body.completed) {
      tasksCompletedCounter.inc()
      activeTasksGauge.set(tasks.filter(t => !t.completed).length)
    }

    apiRequestCounter.inc({ method: 'PATCH', endpoint: '/api/tasks/:id', status: '200' })
    return NextResponse.json(tasks[taskIndex])
  } catch (error) {
    apiRequestCounter.inc({ method: 'PATCH', endpoint: '/api/tasks/:id', status: '400' })
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
