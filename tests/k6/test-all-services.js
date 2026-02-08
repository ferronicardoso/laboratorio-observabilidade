import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');
const requestsPerService = new Counter('requests_per_service');

export const options = {
  vus: 20,                    // 20 usuários virtuais
  duration: '1m',             // Por 1 minuto
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições devem ser < 1s
    errors: ['rate<0.1'],               // Taxa de erro < 10%
  },
};

const SERVICES = {
  dotnet: 'http://localhost:5000',
  python: 'http://localhost:8001',
  java: 'http://localhost:8002',
  nextjs: 'http://localhost:3001',
  nginx: 'http://localhost:8080',
};

export default function () {
  // Simula tráfego distribuído entre todos os serviços

  group('.NET API', function () {
    let res = http.get(`${SERVICES.dotnet}/weatherforecast`);
    check(res, {
      '.NET status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    requestsPerService.add(1, { service: 'dotnet' });
  });

  sleep(0.5);

  group('Python API', function () {
    let res = http.get(`${SERVICES.python}/health`);
    check(res, {
      'Python status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    requestsPerService.add(1, { service: 'python' });
  });

  sleep(0.5);

  group('Java API', function () {
    let res = http.get(`${SERVICES.java}/api/products`);
    check(res, {
      'Java status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    requestsPerService.add(1, { service: 'java' });
  });

  sleep(0.5);

  group('Next.js App', function () {
    let res = http.get(`${SERVICES.nextjs}/api/tasks`);
    check(res, {
      'Next.js status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    requestsPerService.add(1, { service: 'nextjs' });
  });

  sleep(0.5);

  group('Nginx', function () {
    let res = http.get(`${SERVICES.nginx}/`);
    check(res, {
      'Nginx status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    requestsPerService.add(1, { service: 'nginx' });
  });

  sleep(1);
}

export function handleSummary(data) {
  let summary = `\n 📊 Resumo do Teste - Todos os Serviços\n`;
  summary += ` ${'='.repeat(60)}\n\n`;

  const metrics = data.metrics;

  summary += ` 🎯 Configuração:\n`;
  summary += `    • VUs: ${options.vus}\n`;
  summary += `    • Duração: ${options.duration}\n`;
  summary += `    • Serviços testados: 5 (.NET, Python, Java, Next.js, Nginx)\n\n`;

  if (metrics.http_reqs && metrics.http_reqs.values) {
    summary += ` 📈 Requisições:\n`;
    summary += `    • Total: ${metrics.http_reqs.values.count || 0}\n`;
    summary += `    • Taxa: ${(metrics.http_reqs.values.rate || 0).toFixed(2)} req/s\n`;
    summary += `    • Por serviço (aprox): ${((metrics.http_reqs.values.count || 0) / 5).toFixed(0)}\n\n`;
  }

  if (metrics.http_req_duration && metrics.http_req_duration.values) {
    const duration = metrics.http_req_duration.values;
    summary += ` ⏱️  Latência Geral:\n`;
    summary += `    • Média: ${(duration.avg || 0).toFixed(2)}ms\n`;
    summary += `    • Mínima: ${(duration.min || 0).toFixed(2)}ms\n`;
    summary += `    • Máxima: ${(duration.max || 0).toFixed(2)}ms\n`;
    summary += `    • P50: ${(duration['p(50)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P95: ${(duration['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `    • P99: ${(duration['p(99)'] || 0).toFixed(2)}ms\n\n`;
  }

  if (metrics.http_req_failed && metrics.http_req_failed.values) {
    const failRate = ((metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
    const status = failRate < 1 ? '✅' : failRate < 5 ? '⚠️' : '❌';
    summary += ` ${status} Taxa de Falhas: ${failRate}%\n\n`;
  }

  if (metrics.checks && metrics.checks.values) {
    const passRate = ((metrics.checks.values.rate || 0) * 100).toFixed(2);
    const status = passRate > 99 ? '✅' : passRate > 95 ? '⚠️' : '❌';
    summary += ` ${status} Checks:\n`;
    summary += `    • Taxa de sucesso: ${passRate}%\n`;
    summary += `    • Passou: ${metrics.checks.values.passes || 0}\n`;
    summary += `    • Falhou: ${metrics.checks.values.fails || 0}\n\n`;
  }

  summary += ` 💡 Dica: Abra o Grafana e compare as métricas!\n`;
  summary += `    • Multi-Language Overview dashboard\n`;
  summary += `    • APIs - Logs Consolidados\n`;
  summary += `    • Dashboards individuais de cada serviço\n\n`;

  summary += ` ${'='.repeat(60)}\n`;

  console.log(summary);
  return { 'stdout': summary };
}
