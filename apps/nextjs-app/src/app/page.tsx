import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>🔬 Lab de Observabilidade</h1>
        <p>Aplicação Next.js com OpenTelemetry</p>
      </div>

      <div className="card">
        <h2>Bem-vindo!</h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          Esta é uma aplicação Next.js de demonstração para o laboratório de observabilidade.
          Ela expõe métricas para o Prometheus e pode ser monitorada no Grafana.
        </p>

        <div className="links">
          <Link href="/dashboard" className="link-button">
            📊 Dashboard
          </Link>
          <a href="/api/metrics" className="link-button" target="_blank">
            📈 Métricas (/api/metrics)
          </a>
          <a href="/api/health" className="link-button" target="_blank">
            💚 Health Check
          </a>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">4</div>
          <div className="stat-label">APIs Backend</div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#999' }}>
            .NET, Python, Java, Node.js
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">6</div>
          <div className="stat-label">Ferramentas Obs.</div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#999' }}>
            Prometheus, Loki, Alloy, Grafana
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">10+</div>
          <div className="stat-label">Containers</div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#999' }}>
            Docker Compose
          </p>
        </div>
      </div>

      <div className="card">
        <h3>🔗 Links Úteis</h3>
        <div className="links" style={{ marginTop: '1rem' }}>
          <a href="http://localhost:3000" className="link-button" target="_blank">
            Grafana
          </a>
          <a href="http://localhost:9090" className="link-button" target="_blank">
            Prometheus
          </a>
          <a href="http://localhost:3100" className="link-button" target="_blank">
            Loki
          </a>
        </div>
      </div>
    </div>
  )
}
