// Este arquivo é executado automaticamente pelo Next.js na inicialização
// quando experimentalInstrumentationHook está habilitado

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Importar e inicializar métricas
    await import('./lib/metrics')
    await import('./lib/http-metrics')
    console.log('✅ Métricas Prometheus inicializadas')
  }
}
