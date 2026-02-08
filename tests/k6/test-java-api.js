import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:8002';

export default function () {
  // Teste do endpoint health
  let healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health status is UP': (r) => r.json('status') === 'UP',
  }) || errorRate.add(1);

  sleep(1);

  // Teste do endpoint de produtos
  let productsRes = http.get(`${BASE_URL}/api/products`);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products is array': (r) => Array.isArray(r.json()),
    'products has items': (r) => r.json().length > 0,
  }) || errorRate.add(1);

  sleep(1);

  // Teste do endpoint de pedidos
  let ordersRes = http.get(`${BASE_URL}/api/orders`);
  check(ordersRes, {
    'orders status is 200': (r) => r.status === 200,
    'orders is array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  sleep(1);

  // Teste do endpoint de métricas (Spring Boot Actuator)
  let metricsRes = http.get(`${BASE_URL}/actuator/prometheus`);
  check(metricsRes, {
    'actuator metrics status is 200': (r) => r.status === 200,
    'actuator has prometheus metrics': (r) => r.body.includes('jvm_memory'),
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  let summary = `\n 📊 Resumo do Teste - Java API (Spring Boot)\n`;
  summary += ` ${'='.repeat(50)}\n\n`;

  const metrics = data.metrics;

  if (metrics.http_reqs && metrics.http_reqs.values) {
    summary += ` 📈 Requisições Totais: ${metrics.http_reqs.values.count || 0}\n`;
    summary += ` ⚡ Taxa: ${(metrics.http_reqs.values.rate || 0).toFixed(2)} req/s\n\n`;
  }

  if (metrics.http_req_duration && metrics.http_req_duration.values) {
    const duration = metrics.http_req_duration.values;
    summary += ` ⏱️  Latência:\n`;
    summary += `    • Média: ${(duration.avg || 0).toFixed(2)}ms\n`;
    summary += `    • P95: ${(duration['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P99: ${(duration['p(99)'] || 0).toFixed(2)}ms\n\n`;
  }

  if (metrics.http_req_failed && metrics.http_req_failed.values) {
    const failRate = ((metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
    summary += ` ❌ Taxa de Falhas: ${failRate}%\n\n`;
  }

  if (metrics.checks && metrics.checks.values) {
    const passRate = ((metrics.checks.values.rate || 0) * 100).toFixed(2);
    summary += ` ✅ Checks Aprovados: ${passRate}%\n\n`;
  }

  summary += ` ${'='.repeat(50)}\n`;

  console.log(summary);
  return { 'stdout': summary };
}
