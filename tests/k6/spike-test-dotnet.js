import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métrica customizada para taxa de erros
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 50 },    // Ramp-up rápido para carga normal
    { duration: '5s', target: 500 },    // Spike: aumenta drasticamente em 5s
    { duration: '30s', target: 500 },   // Mantém o pico por 30s
    { duration: '5s', target: 50 },     // Ramp-down rápido para normal
    { duration: '10s', target: 0 },     // Retorna a zero
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% das requisições < 2s durante spike
    'http_req_failed': ['rate<0.1'],     // Taxa de falha HTTP < 10%
    'checks': ['rate>0.9'],              // Taxa de sucesso dos checks > 90%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Simula diferentes padrões de uso durante o spike
  const scenarios = [
    // Scenario 1: Listar produtos com paginação (60%)
    () => {
      const page = Math.floor(Math.random() * 20) + 1;
      const pageSize = Math.floor(Math.random() * 20) + 5;
      const res = http.get(`${BASE_URL}/api/products?page=${page}&pageSize=${pageSize}`);

      check(res, {
        'list products status 200': (r) => r.status === 200,
        'list products has data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body) && body.length >= 0;
          } catch {
            return false;
          }
        },
      }) || errorRate.add(1);
    },

    // Scenario 2: Buscar produto específico (30%)
    () => {
      const productId = Math.floor(Math.random() * 1000) + 1;
      const res = http.get(`${BASE_URL}/api/products/${productId}`);

      check(res, {
        'get product status 200 or 404': (r) => r.status === 200 || r.status === 404,
      }) || errorRate.add(1);
    },

    // Scenario 3: Count total (10%)
    () => {
      const res = http.get(`${BASE_URL}/api/products/count`);

      const isValid = check(res, {
        'count status 200': (r) => r.status === 200,
        'count is valid': (r) => {
          // Pode retornar número direto ou JSON
          if (!isNaN(parseInt(r.body))) return true;
          try {
            const body = JSON.parse(r.body);
            return typeof body === 'number' || typeof body.count === 'number';
          } catch {
            return false;
          }
        },
      });

      if (!isValid) errorRate.add(1);
    },
  ];

  // Escolhe cenário baseado em probabilidade
  const rand = Math.random();
  if (rand < 0.6) {
    scenarios[0](); // 60% - list
  } else if (rand < 0.9) {
    scenarios[1](); // 30% - get by id
  } else {
    scenarios[2](); // 10% - count
  }

  // Think time variável (menor durante spike)
  sleep(Math.random() * 0.5 + 0.1); // 0.1s a 0.6s
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';

  let summary = '\n';
  summary += `${indent}✓ Spike Test Completo\n\n`;

  summary += `${indent}Métricas:\n`;

  if (data.metrics.vus_max) {
    summary += `${indent}  - VUs max: ${data.metrics.vus_max.values.max}\n`;
  }

  if (data.metrics.http_reqs) {
    summary += `${indent}  - Requisições: ${data.metrics.http_reqs.values.count}\n`;
  }

  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `${indent}  - Duração média: ${duration.avg?.toFixed(2) || 'N/A'}ms\n`;
    if (duration['p(95)']) {
      summary += `${indent}  - P95: ${duration['p(95)'].toFixed(2)}ms\n`;
    }
    if (duration['p(99)']) {
      summary += `${indent}  - P99: ${duration['p(99)'].toFixed(2)}ms\n`;
    }
  }

  if (data.metrics.http_req_failed) {
    summary += `${indent}  - Taxa de erro: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  }

  return summary;
}
