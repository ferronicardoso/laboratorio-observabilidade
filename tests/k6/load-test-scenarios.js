import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Múltiplos cenários de teste
export const options = {
  scenarios: {
    // Cenário 1: Carga constante leve
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      gracefulStop: '10s',
      tags: { scenario: 'constant' },
    },

    // Cenário 2: Rampa de carga
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },  // Sobe para 20 VUs
        { duration: '1m', target: 20 },   // Mantém 20 VUs
        { duration: '30s', target: 0 },   // Volta para 0
      ],
      gracefulStop: '10s',
      startTime: '2m',  // Começa depois do constant_load
      tags: { scenario: 'ramp' },
    },

    // Cenário 3: Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 0 },    // Preparação
        { duration: '10s', target: 100 },  // Spike rápido!
        { duration: '30s', target: 100 },  // Mantém carga alta
        { duration: '10s', target: 0 },    // Volta ao normal
      ],
      gracefulStop: '10s',
      startTime: '4m',  // Começa depois do ramp_up
      tags: { scenario: 'spike' },
    },
  },

  thresholds: {
    'http_req_duration{scenario:constant}': ['p(95)<500'],
    'http_req_duration{scenario:ramp}': ['p(95)<800'],
    'http_req_duration{scenario:spike}': ['p(95)<1500'],
    'errors': ['rate<0.15'],
  },
};

const SERVICES = {
  dotnet: 'http://localhost:5000',
  python: 'http://localhost:8001',
  java: 'http://localhost:8002',
  nextjs: 'http://localhost:3001',
};

export default function () {
  // Escolhe um serviço aleatório
  const services = Object.values(SERVICES);
  const service = services[Math.floor(Math.random() * services.length)];

  // Faz requisição
  let res = http.get(`${service}/health`, {
    tags: { service: service.split(':')[2].split('/')[0] },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(Math.random() * 2 + 0.5);  // Sleep aleatório entre 0.5 e 2.5s
}

export function handleSummary(data) {
  let summary = `\n 📊 Resumo do Teste - Cenários de Carga\n`;
  summary += ` ${'='.repeat(70)}\n\n`;

  const metrics = data.metrics;

  summary += ` 🎭 Cenários Executados:\n`;
  summary += `    1️⃣  Constant Load: 10 VUs por 2min (carga base)\n`;
  summary += `    2️⃣  Ramp Up: 0→20 VUs em 30s (escalabilidade)\n`;
  summary += `    3️⃣  Spike Test: 0→100 VUs em 10s (pico repentino)\n\n`;

  if (metrics.http_reqs && metrics.http_reqs.values) {
    summary += ` 📈 Requisições Totais: ${metrics.http_reqs.values.count || 0}\n`;
    summary += ` ⚡ Taxa Média: ${(metrics.http_reqs.values.rate || 0).toFixed(2)} req/s\n\n`;
  }

  if (metrics.http_req_duration && metrics.http_req_duration.values) {
    const duration = metrics.http_req_duration.values;
    summary += ` ⏱️  Latência Agregada:\n`;
    summary += `    • P50: ${(duration['p(50)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P95: ${(duration['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P99: ${(duration['p(99)'] || 0).toFixed(2)}ms\n`;
    summary += `    • Máxima: ${(duration.max || 0).toFixed(2)}ms\n\n`;
  }

  // Latências por cenário
  const constantDuration = metrics['http_req_duration{scenario:constant}'];
  const rampDuration = metrics['http_req_duration{scenario:ramp}'];
  const spikeDuration = metrics['http_req_duration{scenario:spike}'];

  summary += ` 📊 Latência por Cenário:\n`;

  if (constantDuration && constantDuration.values) {
    summary += `    🔸 Constant Load:\n`;
    summary += `       P95: ${(constantDuration.values['p(95)'] || 0).toFixed(2)}ms `;
    summary += (constantDuration.values['p(95)'] || 0) < 500 ? '✅\n' : '⚠️\n';
  }

  if (rampDuration && rampDuration.values) {
    summary += `    🔸 Ramp Up:\n`;
    summary += `       P95: ${(rampDuration.values['p(95)'] || 0).toFixed(2)}ms `;
    summary += (rampDuration.values['p(95)'] || 0) < 800 ? '✅\n' : '⚠️\n';
  }

  if (spikeDuration && spikeDuration.values) {
    summary += `    🔸 Spike Test:\n`;
    summary += `       P95: ${(spikeDuration.values['p(95)'] || 0).toFixed(2)}ms `;
    summary += (spikeDuration.values['p(95)'] || 0) < 1500 ? '✅\n' : '⚠️\n';
  }

  summary += `\n`;

  if (metrics.http_req_failed && metrics.http_req_failed.values) {
    const failRate = ((metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
    const status = failRate < 1 ? '✅' : failRate < 5 ? '⚠️' : '❌';
    summary += ` ${status} Taxa de Falhas: ${failRate}%\n\n`;
  }

  if (metrics.checks && metrics.checks.values) {
    const passRate = ((metrics.checks.values.rate || 0) * 100).toFixed(2);
    summary += ` ✅ Checks Aprovados: ${passRate}%\n\n`;
  }

  summary += ` 💡 Análise:\n`;
  summary += `    • Compare as latências entre cenários no Grafana\n`;
  summary += `    • Verifique uso de CPU/memória durante o spike\n`;
  summary += `    • Analise logs de erro no Loki\n`;
  summary += `    • Observe tempo de recuperação após spike\n\n`;

  summary += ` ${'='.repeat(70)}\n`;

  console.log(summary);
  return { 'stdout': summary };
}
