import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '5s', target: 500 },     // Warm-up rápido
    { duration: '5s', target: 5000 },    // CAOS: 5000 VUs!
    { duration: '20s', target: 5000 },   // Mantém caos
    { duration: '5s', target: 0 },       // Crash rápido
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000'],
    'http_req_failed': ['rate<0.8'], // Até 80% de falha
  },
};

const BASE_URL = 'http://localhost:8001';

export default function () {
  // Requisições SEM think time - máxima agressividade
  const endpoints = [
    `${BASE_URL}/items`,
    `${BASE_URL}/items/${Math.floor(Math.random() * 10) + 1}`,
    `${BASE_URL}/users`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.get(endpoint, {
    timeout: '30s',
  });

  check(res, {
    'status ok': (r) => r.status < 500,
  }) || errorRate.add(1);

  // Think time ZERO - martela sem parar!
  // sleep(0);
}

export function handleSummary(data) {
  let summary = '\n';
  summary += '💥 CHAOS TEST - Python API - Resultados\n';
  summary += '========================================\n\n';

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
  }

  if (data.metrics.http_req_failed) {
    const failRate = data.metrics.http_req_failed.values.rate * 100;
    summary += `\n  Taxa de Falha HTTP: ${failRate.toFixed(2)}%\n`;

    if (failRate > 50) {
      summary += '\n🔴 SUCESSO: Sistema entrou em colapso!\n';
      summary += '   Taxa de erros > 50% - Objetivo atingido!\n';
    } else if (failRate > 20) {
      summary += '\n⚠️  Sistema sob estresse extremo\n';
      summary += '   Taxa de erros > 20%\n';
    } else if (failRate > 5) {
      summary += '\n✓ Sistema mostrando sinais de sobrecarga\n';
      summary += '   Taxa de erros > 5%\n';
    } else {
      summary += '\n💪 Sistema MUITO resiliente!\n';
      summary += '   Aguentou 5000 VUs com < 5% de erros\n';
    }
  }

  summary += '\n📊 Verifique no Grafana:\n';
  summary += '   http://localhost:3000/d/python-api-overview\n\n';

  return {
    'stdout': summary,
  };
}
