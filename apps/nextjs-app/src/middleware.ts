import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()

  // Pegar resposta
  const response = NextResponse.next()

  // Logar requisição após processamento
  const duration = Date.now() - start
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} - ${response.status} (${duration}ms)`)

  return response
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: [
    // Aplicar em todas as rotas exceto arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
