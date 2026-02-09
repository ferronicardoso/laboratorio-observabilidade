import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métrica customizada para taxa de erros
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 100 },    // Warm-up
    { duration: '10s', target: 1000 },   // Ramp-up agressivo para 1000 VUs
    { duration: '20s', target: 2000 },   // EXTREMO: 2000 VUs
    { duration: '30s', target: 2000 },   // Mantém sobrecarga
    { duration: '10s', target: 500 },    // Ramp-down
    { duration: '10s', target: 0 },      // Cooldown
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // P95 < 5s (muito permissivo)
    'http_req_failed': ['rate<0.5'],     // Até 50% de falha é aceitável neste teste
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Durante estresse extremo, fazer requisições rápidas sem pensar muito
  const scenarios = [
    // Listagem (50%)
    () => {
      const page = Math.floor(Math.random() * 50) + 1;
      const pageSize = Math.floor(Math.random() * 50) + 10;
      const res = http.get(`${BASE_URL}/api/products?page=${page}&pageSize=${pageSize}`, {
        timeout: '10s', // Timeout maior para não falhar muito rápido
      });

      check(res, {
        'list status ok': (r) => r.status === 200,
      }) || errorRate.add(1);
    },

    // Get by ID (30%)
    () => {
      const productId = Math.floor(Math.random() * 1000) + 1;
      const res = http.get(`${BASE_URL}/api/products/${productId}`, {
        timeout: '10s',
      });

      check(res, {
        'get status ok': (r) => r.status === 200 || r.status === 404,
      }) || errorRate.add(1);
    },

    // Count (20%)
    () => {
      const res = http.get(`${BASE_URL}/api/products/count`, {
        timeout: '10s',
      });

      check(res, {
        'count status ok': (r) => r.status === 200,
      }) || errorRate.add(1);
    },
  ];

  // Escolhe cenário
  const rand = Math.random();
  if (rand < 0.5) {
    scenarios[0](); // 50% - list
  } else if (rand < 0.8) {
    scenarios[1](); // 30% - get by id
  } else {
    scenarios[2](); // 20% - count
  }

  // Think time muito curto para sobrecarregar
  sleep(Math.random() * 0.2); // 0-200ms apenas
}

export function handleSummary(data) {
  let summary = '\n';
  summary += '🔥 Stress Test EXTREMO - Resultados\n';
  summary += '====================================\n\n';

  if (data.metrics.vus_max) {
    summary += `  VUs Máximo: ${data.metrics.vus_max.values.max}\n`;
  }

  if (data.metrics.http_reqs) {
    summary += `  Total Requisições: ${data.metrics.http_reqs.values.count}\n`;
  }

  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `  Duração Média: ${duration.avg?.toFixed(2) || 'N/A'}ms\n`;
    if (duration['p(50)']) {
      summary += `  P50: ${duration['p(50)'].toFixed(2)}ms\n`;
    }
    if (duration['p(95)']) {
      summary += `  P95: ${duration['p(95)'].toFixed(2)}ms\n`;
    }
    if (duration['p(99)']) {
      summary += `  P99: ${duration['p(99)'].toFixed(2)}ms\n`;
    }
  }

  if (data.metrics.http_req_failed) {
    const failRate = data.metrics.http_req_failed.values.rate * 100;
    summary += `  Taxa de Falha HTTP: ${failRate.toFixed(2)}%\n`;

    if (failRate > 10) {
      summary += '\n⚠️  ALERTA: Taxa de falha > 10% - Sistema sobrecarregado!\n';
    }
    if (failRate > 30) {
      summary += '🔴 CRÍTICO: Taxa de falha > 30% - Sistema em colapso!\n';
    }
  }

  summary += '\n';

  return {
    'stdout': summary,
  };
}
