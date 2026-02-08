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
  // Teste 1: Contar produtos (query simples)
  let countRes = http.get(`${BASE_URL}/api/products/count`);
  check(countRes, {
    'count status is 200': (r) => r.status === 200,
    'count has result': (r) => r.json('count') !== undefined,
  }) || errorRate.add(1);

  sleep(0.5);

  // Teste 2: Listar produtos com paginação (query complexa)
  const page = Math.floor(Math.random() * 100) + 1; // Página aleatória de 1 a 100
  let listRes = http.get(`${BASE_URL}/api/products?page=${page}&pageSize=10`);
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list response time < 500ms': (r) => r.timings.duration < 500,
    'list is array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  sleep(0.5);

  // Teste 3: Buscar produto específico por ID (query com índice)
  const productId = Math.floor(Math.random() * 1000) + 1; // ID aleatório de 1 a 1000
  let getRes = http.get(`${BASE_URL}/api/products/${productId}`);
  check(getRes, {
    'get status is 200': (r) => r.status === 200,
    'get has id': (r) => r.json('id') === productId,
    'get response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(0.5);

  // Teste 4: Criar novo produto (INSERT no banco)
  const newProduct = {
    name: `Produto Teste ${Date.now()}`,
    description: 'Produto criado durante teste de carga',
    price: Math.random() * 1000,
    stock: Math.floor(Math.random() * 100),
  };

  let createRes = http.post(
    `${BASE_URL}/api/products`,
    JSON.stringify(newProduct),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'create response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Teste 5: Endpoint de métricas (não toca no banco)
  let metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}

// Callback executado ao final do teste
export function handleSummary(data) {
  let summary = `\n 📊 Resumo do Teste - .NET API + PostgreSQL\n`;
  summary += ` ${'='.repeat(60)}\n\n`;

  const metrics = data.metrics;

  if (metrics.http_reqs && metrics.http_reqs.values) {
    summary += ` 📈 Requisições Totais: ${metrics.http_reqs.values.count || 0}\n`;
    summary += ` ⚡ Taxa: ${(metrics.http_reqs.values.rate || 0).toFixed(2)} req/s\n\n`;
  }

  if (metrics.http_req_duration && metrics.http_req_duration.values) {
    const duration = metrics.http_req_duration.values;
    summary += ` ⏱️  Latência (inclui queries SQL):\n`;
    summary += `    • Média: ${(duration.avg || 0).toFixed(2)}ms\n`;
    summary += `    • Mínima: ${(duration.min || 0).toFixed(2)}ms\n`;
    summary += `    • Máxima: ${(duration.max || 0).toFixed(2)}ms\n`;
    summary += `    • P95: ${(duration['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P99: ${(duration['p(99)'] || 0).toFixed(2)}ms\n\n`;
  }

  if (metrics.http_req_failed && metrics.http_req_failed.values) {
    const failRate = ((metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
    summary += ` ❌ Taxa de Falhas: ${failRate}%\n\n`;
  }

  if (metrics.checks && metrics.checks.values) {
    const passRate = ((metrics.checks.values.rate || 0) * 100).toFixed(2);
    summary += ` ✅ Checks Aprovados: ${passRate}%\n`;
    summary += `    • Passou: ${metrics.checks.values.passes || 0}\n`;
    summary += `    • Falhou: ${metrics.checks.values.fails || 0}\n\n`;
  }

  summary += ` 🗄️  Operações no Banco de Dados:\n`;
  summary += `    • SELECT (count): ~${Math.floor((metrics.http_reqs?.values?.count || 0) / 5)}\n`;
  summary += `    • SELECT (list): ~${Math.floor((metrics.http_reqs?.values?.count || 0) / 5)}\n`;
  summary += `    • SELECT (get by ID): ~${Math.floor((metrics.http_reqs?.values?.count || 0) / 5)}\n`;
  summary += `    • INSERT: ~${Math.floor((metrics.http_reqs?.values?.count || 0) / 5)}\n\n`;

  summary += ` 💡 Dica: Veja os logs do PostgreSQL e as métricas no Grafana!\n\n`;
  summary += ` ${'='.repeat(60)}\n`;

  console.log(summary);
  return { 'stdout': summary };
}
