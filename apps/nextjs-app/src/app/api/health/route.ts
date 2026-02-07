import { NextResponse } from 'next/server'
import { httpRequestsTotal, httpRequestDurationSeconds } from '@/lib/http-metrics'

export async function GET() {
  const start = Date.now()

  const response = NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'nextjs-app',
    version: '1.0.0',
  })

  const duration = (Date.now() - start) / 1000
  const status = response.status.toString()

  httpRequestsTotal.inc({ method: 'GET', route: '/api/health', status_code: status })
  httpRequestDurationSeconds.observe({ method: 'GET', route: '/api/health', status_code: status }, duration)

  return response
}
