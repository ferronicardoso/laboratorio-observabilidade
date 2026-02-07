import { NextResponse } from 'next/server'
import { tasksCreatedCounter, tasksCompletedCounter, activeTasksGauge, apiRequestCounter } from '@/lib/metrics'

// Simular banco de dados em memória
let tasks: any[] = []
let taskIdCounter = 0

export async function GET() {
  apiRequestCounter.inc({ method: 'GET', endpoint: '/api/tasks', status: '200' })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newTask = {
      id: ++taskIdCounter,
      title: body.title,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    tasks.push(newTask)
    tasksCreatedCounter.inc()
    activeTasksGauge.set(tasks.filter(t => !t.completed).length)
    apiRequestCounter.inc({ method: 'POST', endpoint: '/api/tasks', status: '201' })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    apiRequestCounter.inc({ method: 'POST', endpoint: '/api/tasks', status: '400' })
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
