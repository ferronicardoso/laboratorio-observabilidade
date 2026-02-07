import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { faro } from '@grafana/faro-web-sdk';

interface ApiStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'loading';
  data?: any;
  error?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🔬 Lab de Observabilidade</h1>
        <p>Angular + Grafana Faro (Real User Monitoring)</p>
      </div>

      <div class="card">
        <h2>Dashboard de APIs</h2>
        <p>Esta aplicação Angular consome as 4 APIs do laboratório e envia métricas para o Grafana via Faro.</p>
        <button (click)="testAllApis()">🔄 Testar Todas as APIs</button>
        <button (click)="simulateError()">❌ Simular Erro (teste Faro)</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ apisOnline }}</div>
          <div class="stat-label">APIs Online</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalRequests }}</div>
          <div class="stat-label">Total de Requisições</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">Taxa de Sucesso</div>
        </div>
      </div>

      <div class="api-grid">
        <div class="api-card" *ngFor="let api of apis">
          <h3>{{ api.name }}</h3>
          <span class="api-status" [class.online]="api.status === 'online'" [class.offline]="api.status === 'offline'">
            {{ api.status }}
          </span>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">{{ api.url }}</p>
          <button (click)="testApi(api)" style="margin-top: 1rem;">Testar</button>
          <div *ngIf="api.data" style="margin-top: 1rem;">
            <strong>Resposta:</strong>
            <pre>{{ api.data | json }}</pre>
          </div>
          <div *ngIf="api.error" class="error">{{ api.error }}</div>
        </div>
      </div>

      <div class="card" style="margin-top: 2rem;">
        <h3>📊 Métricas Sendo Coletadas pelo Faro</h3>
        <ul style="line-height: 1.8;">
          <li>✅ Core Web Vitals (LCP, FID, CLS)</li>
          <li>✅ Tempo de carregamento da página</li>
          <li>✅ Erros JavaScript</li>
          <li>✅ Chamadas HTTP (latência, status)</li>
          <li>✅ Console logs</li>
          <li>✅ Navegação e interações do usuário</li>
        </ul>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  apis: ApiStatus[] = [
    { name: '.NET API', url: 'http://localhost:5000/weatherforecast', status: 'loading' },
    { name: 'Python API', url: 'http://localhost:8001/health', status: 'loading' },
    { name: 'Java API', url: 'http://localhost:8002/health', status: 'loading' },
    { name: 'Next.js API', url: 'http://localhost:3001/api/health', status: 'loading' }
  ];

  apisOnline = 0;
  totalRequests = 0;
  successRate = 100;

  ngOnInit() {
    console.log('🚀 Angular App Started');
    faro.api?.pushEvent('app_loaded', { timestamp: new Date().toISOString() });
    this.testAllApis();
  }

  testAllApis() {
    this.apis.forEach(api => this.testApi(api));
  }

  testApi(api: ApiStatus) {
    const startTime = performance.now();
    api.status = 'loading';
    api.error = undefined;
    this.totalRequests++;

    this.http.get(api.url).subscribe({
      next: (data) => {
        const duration = performance.now() - startTime;
        api.status = 'online';
        api.data = data;

        // Enviar métrica customizada para o Faro
        faro.api?.pushMeasurement({
          type: 'api_call_duration',
          values: { duration },
          context: { api: api.name, url: api.url, status: 'success' }
        });

        this.updateStats();
      },
      error: (error) => {
        const duration = performance.now() - startTime;
        api.status = 'offline';
        api.error = error.message;

        // Enviar erro para o Faro
        faro.api?.pushError(new Error(`API ${api.name} failed: ${error.message}`));
        faro.api?.pushMeasurement({
          type: 'api_call_duration',
          values: { duration },
          context: { api: api.name, url: api.url, status: 'error' }
        });

        this.updateStats();
      }
    });
  }

  updateStats() {
    this.apisOnline = this.apis.filter(a => a.status === 'online').length;
    const completed = this.apis.filter(a => a.status !== 'loading').length;
    if (completed > 0) {
      this.successRate = Math.round((this.apisOnline / completed) * 100);
    }
  }

  simulateError() {
    console.error('🔴 Erro simulado para teste do Faro!');
    faro.api?.pushError(new Error('Erro simulado pelo usuário para teste'));
    alert('Erro enviado para o Faro! Verifique no Grafana.');
  }
}
