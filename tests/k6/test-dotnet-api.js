import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');

// Configuração do teste
export const options = {
  vus: 10,                    // 10 usuários virtuais
  duration: '30s',            // Por 30 segundos
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    errors: ['rate<0.1'],             // Taxa de erro < 10%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Teste do endpoint Health
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health status is UP': (r) => r.json('status') === 'UP',
  }) || errorRate.add(1);

  sleep(1);

  // Teste do endpoint WeatherForecast
  let weatherRes = http.get(`${BASE_URL}/weatherforecast`);
  check(weatherRes, {
    'weather status is 200': (r) => r.status === 200,
    'weather response time < 500ms': (r) => r.timings.duration < 500,
    'weather has content': (r) => r.body.length > 0,
  }) || errorRate.add(1);

  sleep(1);

  // Teste do endpoint de métricas (não deve impactar performance)
  let metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics content-type is text/plain': (r) => r.headers['Content-Type'].includes('text/plain'),
  }) || errorRate.add(1);

  sleep(2);
}

// Callback executado ao final do teste
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;

  let summary = `\n${indent}📊 Resumo do Teste - .NET API\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;

  const metrics = data.metrics;

  if (metrics.http_reqs && metrics.http_reqs.values) {
    summary += `${indent}📈 Requisições Totais: ${metrics.http_reqs.values.count || 0}\n`;
    summary += `${indent}⚡ Taxa: ${(metrics.http_reqs.values.rate || 0).toFixed(2)} req/s\n\n`;
  }

  if (metrics.http_req_duration && metrics.http_req_duration.values) {
    const duration = metrics.http_req_duration.values;
    summary += `${indent}⏱️  Latência:\n`;
    summary += `${indent}   • Média: ${(duration.avg || 0).toFixed(2)}ms\n`;
    summary += `${indent}   • Mínima: ${(duration.min || 0).toFixed(2)}ms\n`;
    summary += `${indent}   • Máxima: ${(duration.max || 0).toFixed(2)}ms\n`;
    summary += `${indent}   • P95: ${(duration['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `${indent}   • P99: ${(duration['p(99)'] || 0).toFixed(2)}ms\n\n`;
  }

  if (metrics.http_req_failed && metrics.http_req_failed.values) {
    const failRate = ((metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
    summary += `${indent}❌ Taxa de Falhas: ${failRate}%\n\n`;
  }

  if (metrics.checks && metrics.checks.values) {
    const passRate = ((metrics.checks.values.rate || 0) * 100).toFixed(2);
    summary += `${indent}✅ Checks Aprovados: ${passRate}%\n`;
    summary += `${indent}   • Passou: ${metrics.checks.values.passes || 0}\n`;
    summary += `${indent}   • Falhou: ${metrics.checks.values.fails || 0}\n\n`;
  }

  summary += `${indent}${'='.repeat(50)}\n`;

  return summary;
}
