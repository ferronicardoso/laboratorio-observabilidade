import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 50 },    // Warm-up
    { duration: '5s', target: 500 },    // Spike!
    { duration: '20s', target: 500 },   // Mantém spike
    { duration: '10s', target: 50 },    // Ramp-down
    { duration: '5s', target: 0 },      // Cooldown
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:8002';

export default function () {
  // Mix de endpoints para simular carga realista
  const endpoints = [
    `${BASE_URL}/api/products`,
    `${BASE_URL}/api/products/${Math.floor(Math.random() * 100) + 1}`,
    `${BASE_URL}/api/orders`,
    `${BASE_URL}/health`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.get(endpoint, {
    timeout: '10s',
  });

  check(res, {
    'status ok': (r) => r.status < 500,
    'latency ok': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(Math.random() * 0.5); // 0-500ms think time
}

export function handleSummary(data) {
  let summary = '\n';
  summary += '⚡ SPIKE TEST - Java API - Resultados\n';
  summary += '======================================\n\n';

  if (data.metrics.vus_max) {
    summary += `  VUs Máximo: ${data.metrics.vus_max.values.max}\n`;
  }

  if (data.metrics.http_reqs) {
    summary += `  Total Requisições: ${data.metrics.http_reqs.values.count}\n`;
  }

  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    if (duration.avg) {
      summary += `  Duração Média: ${duration.avg.toFixed(2)}ms\n`;
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
    summary += `\n  Taxa de Falha HTTP: ${failRate.toFixed(2)}%\n`;

    if (failRate < 1) {
      summary += '\n✅ API aguentou bem o spike de carga!\n';
    } else if (failRate < 5) {
      summary += '\n⚠️  Alguns erros detectados durante o spike\n';
    } else {
      summary += '\n🔴 Taxa de erros elevada - verificar logs\n';
    }
  }

  summary += '\n📊 Verifique o dashboard:\n';
  summary += '   http://localhost:3000/d/java-api-overview\n\n';

  return {
    'stdout': summary,
  };
}
