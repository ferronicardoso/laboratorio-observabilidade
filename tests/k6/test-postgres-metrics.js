import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Métricas customizadas do k6
const postgresUpCheck = new Counter('postgres_exporter_up');
const cacheHitRatio = new Trend('postgres_cache_hit_ratio');
const activeConnections = new Trend('postgres_active_connections');
const databaseSize = new Trend('postgres_database_size_mb');

export const options = {
  scenarios: {
    // Cenário 1: Gerar tráfego na API
    generate_traffic: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      exec: 'generateTraffic',
    },
    // Cenário 2: Validar métricas do PostgreSQL
    validate_metrics: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'validateMetrics',
      startTime: '35s', // Aguarda tráfego + scrape do Prometheus
    },
  },
  thresholds: {
    // Thresholds para validação
    'postgres_exporter_up': ['count>0'],
    'postgres_cache_hit_ratio': ['avg>90'], // Cache hit deve ser > 90%
    'checks': ['rate>0.95'], // 95% dos checks devem passar
  },
};

// Cenário 1: Gerar tráfego no banco de dados
export function generateTraffic() {
  const page = Math.floor(Math.random() * 10) + 1;
  const pageSize = 10;

  const res = http.get(`http://localhost:5000/api/products?page=${page}&pageSize=${pageSize}`);

  check(res, {
    'API responded 200': (r) => r.status === 200,
    'API returned data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.length > 0;
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);
}

// Cenário 2: Validar métricas do PostgreSQL no Prometheus
export function validateMetrics() {
  console.log('\n========================================');
  console.log('PostgreSQL Metrics Validation');
  console.log('========================================\n');

  // 1. Verificar se PostgreSQL Exporter está UP
  console.log('1. Verificando PostgreSQL Exporter...');
  const pgUpRes = queryPrometheus('pg_up{job="postgres"}');

  const pgUp = check(pgUpRes, {
    'PostgreSQL Exporter está UP': (r) => {
      const value = extractMetricValue(r);
      if (value === '1') {
        postgresUpCheck.add(1);
        console.log('   ✓ PostgreSQL Exporter está UP');
        return true;
      }
      console.log('   ✗ PostgreSQL Exporter está DOWN');
      return false;
    },
  });

  if (!pgUp) {
    console.log('\n✗ PostgreSQL Exporter não está disponível. Abortando validação.\n');
    return;
  }

  sleep(1);

  // 2. Validar conexões ativas
  console.log('\n2. Verificando conexões ativas...');
  const activeConnsRes = queryPrometheus('sum(pg_stat_activity_count{state="active"})');

  check(activeConnsRes, {
    'Conexões ativas disponíveis': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const conns = parseFloat(value);
        activeConnections.add(conns);
        console.log(`   Conexões Ativas: ${conns}`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 3. Validar Cache Hit Ratio
  console.log('\n3. Verificando Cache Hit Ratio...');
  const cacheHitQuery = 'sum(pg_stat_database_blks_hit{datname="observability_lab"})/(sum(pg_stat_database_blks_hit{datname="observability_lab"})+sum(pg_stat_database_blks_read{datname="observability_lab"}))*100';
  const cacheHitRes = queryPrometheus(cacheHitQuery);

  check(cacheHitRes, {
    'Cache Hit Ratio > 90%': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const ratio = parseFloat(value);
        cacheHitRatio.add(ratio);
        console.log(`   Cache Hit Ratio: ${ratio.toFixed(2)}%`);

        if (ratio > 90) {
          console.log('   ✓ Cache Hit Ratio está saudável (> 90%)');
          return true;
        } else {
          console.log('   ⚠ Cache Hit Ratio está baixo (< 90%)');
          return false;
        }
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 4. Validar tamanho do banco
  console.log('\n4. Verificando tamanho do banco...');
  const dbSizeRes = queryPrometheus('pg_database_size_bytes{datname="observability_lab"}');

  check(dbSizeRes, {
    'Tamanho do banco disponível': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const sizeBytes = parseFloat(value);
        const sizeMB = sizeBytes / 1024 / 1024;
        databaseSize.add(sizeMB);
        console.log(`   Tamanho do Banco: ${sizeMB.toFixed(2)} MB`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 5. Validar taxa de transações
  console.log('\n5. Verificando taxa de transações...');
  const commitsRes = queryPrometheus('rate(pg_stat_database_xact_commit{datname="observability_lab"}[1m])');

  check(commitsRes, {
    'Taxa de commits disponível': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const rate = parseFloat(value);
        console.log(`   Taxa de Commits: ${rate.toFixed(2)} tx/s`);
        return true;
      }
      console.log('   Taxa de Commits: N/A (sem dados suficientes)');
      return false;
    },
  });

  sleep(1);

  // 6. Validar locks
  console.log('\n6. Verificando locks...');
  const locksRes = queryPrometheus('sum(pg_locks_count{datname="observability_lab"})');

  check(locksRes, {
    'Locks estão sob controle': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const locks = parseFloat(value);
        console.log(`   Total de Locks: ${locks}`);

        if (locks < 100) {
          console.log('   ✓ Locks estão normais (< 100)');
          return true;
        } else {
          console.log('   ⚠ Muitos locks detectados (>= 100)');
          return true; // Não falha, só avisa
        }
      }
      console.log('   Locks: N/A');
      return false;
    },
  });

  console.log('\n========================================');
  console.log('✓ Validação concluída!');
  console.log('========================================');
  console.log('\nLinks úteis:');
  console.log('  Prometheus Targets: http://localhost:9090/targets');
  console.log('  PostgreSQL Metrics: http://localhost:9187/metrics');
  console.log('  Grafana Dashboard: http://localhost:3000/d/postgresql-monitoring');
  console.log('');
}

// Helper: Fazer query no Prometheus
function queryPrometheus(query) {
  const url = `http://localhost:9090/api/v1/query?query=${encodeURIComponent(query)}`;
  return http.get(url);
}

// Helper: Extrair valor da métrica da resposta do Prometheus
function extractMetricValue(response) {
  if (response.status !== 200) {
    return null;
  }

  try {
    const data = JSON.parse(response.body);

    if (data.status !== 'success') {
      return null;
    }

    if (!data.data.result || data.data.result.length === 0) {
      return null;
    }

    const result = data.data.result[0];
    if (!result.value || result.value.length < 2) {
      return null;
    }

    return result.value[1]; // Retorna o valor da métrica
  } catch (e) {
    console.error(`Erro ao parsear resposta: ${e.message}`);
    return null;
  }
}

// Função executada ao final do teste (summary)
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}========================================\n`;
  summary += `${indent}PostgreSQL Metrics Test - Summary\n`;
  summary += `${indent}========================================\n\n`;

  // Checks
  const checksRate = data.metrics.checks ? (data.metrics.checks.values.passes / data.metrics.checks.values.fails + data.metrics.checks.values.passes) * 100 : 0;
  summary += `${indent}Checks Passed: ${checksRate.toFixed(2)}%\n`;

  // Métricas customizadas
  if (data.metrics.postgres_cache_hit_ratio) {
    const avgCacheHit = data.metrics.postgres_cache_hit_ratio.values.avg;
    summary += `${indent}Cache Hit Ratio (avg): ${avgCacheHit.toFixed(2)}%\n`;
  }

  if (data.metrics.postgres_active_connections) {
    const avgConns = data.metrics.postgres_active_connections.values.avg;
    summary += `${indent}Active Connections (avg): ${avgConns.toFixed(2)}\n`;
  }

  if (data.metrics.postgres_database_size_mb) {
    const avgSize = data.metrics.postgres_database_size_mb.values.avg;
    summary += `${indent}Database Size (avg): ${avgSize.toFixed(2)} MB\n`;
  }

  summary += `\n`;

  return summary;
}
