import { NextResponse } from 'next/server'
import { apiRequestCounter } from '@/lib/metrics'

// Simular estatísticas
let tasks: any[] = []

export async function GET() {
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    activeTasks: tasks.filter(t => !t.completed).length,
    timestamp: new Date().toISOString(),
  }

  apiRequestCounter.inc({ method: 'GET', endpoint: '/api/stats', status: '200' })
  return NextResponse.json(stats)
}
