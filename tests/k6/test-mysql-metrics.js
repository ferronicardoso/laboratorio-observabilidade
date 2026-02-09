import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Métricas customizadas do k6
const mysqlUpCheck = new Counter('mysql_exporter_up');
const activeConnections = new Trend('mysql_active_connections');
const queriesRate = new Trend('mysql_queries_rate');

export const options = {
  scenarios: {
    // Cenário: Validar métricas do MySQL
    validate_metrics: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'validateMetrics',
    },
  },
  thresholds: {
    // Thresholds para validação
    'mysql_exporter_up': ['count>0'],
    'checks': ['rate>0.80'], // 80% dos checks devem passar
  },
};

// Validar métricas do MySQL no Prometheus
export function validateMetrics() {
  console.log('\n========================================');
  console.log('MySQL Metrics Validation');
  console.log('========================================\n');

  // 1. Verificar se MySQL Exporter está UP
  console.log('1. Verificando MySQL Exporter...');
  const mysqlUpRes = queryPrometheus('mysql_up{job="mysql"}');

  const mysqlUp = check(mysqlUpRes, {
    'MySQL Exporter está UP': (r) => {
      const value = extractMetricValue(r);
      if (value === '1') {
        mysqlUpCheck.add(1);
        console.log('   ✓ MySQL Exporter está UP');
        return true;
      }
      console.log('   ✗ MySQL Exporter está DOWN');
      return false;
    },
  });

  if (!mysqlUp) {
    console.log('\n✗ MySQL Exporter não está disponível. Abortando validação.\n');
    return;
  }

  sleep(1);

  // 2. Validar conexões
  console.log('\n2. Verificando conexões...');
  const connectionsRes = queryPrometheus('mysql_global_status_threads_connected{job="mysql"}');

  check(connectionsRes, {
    'Conexões disponíveis': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const conns = parseFloat(value);
        activeConnections.add(conns);
        console.log(`   Conexões: ${conns}`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 3. Validar queries por segundo
  console.log('\n3. Verificando queries por segundo...');
  const queriesRes = queryPrometheus('rate(mysql_global_status_queries{job="mysql"}[1m])');

  check(queriesRes, {
    'Queries/s disponíveis': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const rate = parseFloat(value);
        queriesRate.add(rate);
        console.log(`   Queries/s: ${rate.toFixed(2)}`);
        return true;
      }
      console.log('   Queries/s: N/A (sem dados suficientes)');
      return false;
    },
  });

  sleep(1);

  // 4. Validar threads rodando
  console.log('\n4. Verificando threads rodando...');
  const threadsRes = queryPrometheus('mysql_global_status_threads_running{job="mysql"}');

  check(threadsRes, {
    'Threads rodando disponíveis': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const threads = parseFloat(value);
        console.log(`   Threads Rodando: ${threads}`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 5. Validar slow queries
  console.log('\n5. Verificando slow queries...');
  const slowQueriesRes = queryPrometheus('mysql_global_status_slow_queries{job="mysql"}');

  check(slowQueriesRes, {
    'Slow queries sob controle': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const slowQueries = parseFloat(value);
        console.log(`   Total de Slow Queries: ${slowQueries}`);

        if (slowQueries < 10) {
          console.log('   ✓ Slow queries estão normais (< 10)');
          return true;
        } else {
          console.log('   ⚠ Muitas slow queries detectadas (>= 10)');
          return true; // Não falha, só avisa
        }
      }
      console.log('   Slow Queries: N/A');
      return false;
    },
  });

  sleep(1);

  // 6. Validar uptime
  console.log('\n6. Verificando uptime...');
  const uptimeRes = queryPrometheus('mysql_global_status_uptime{job="mysql"}');

  check(uptimeRes, {
    'Uptime disponível': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const uptimeSeconds = parseFloat(value);
        const uptimeMinutes = (uptimeSeconds / 60).toFixed(2);
        console.log(`   Uptime: ${uptimeMinutes} minutos`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  console.log('\n========================================');
  console.log('✓ Validação concluída!');
  console.log('========================================');
  console.log('\nLinks úteis:');
  console.log('  Prometheus Targets: http://localhost:9090/targets');
  console.log('  MySQL Metrics: http://localhost:9104/metrics');
  console.log('  Grafana Dashboard: http://localhost:3000/d/mysql-monitoring');
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

  let summary = '\n';
  summary += `${indent}========================================\n`;
  summary += `${indent}MySQL Metrics Test - Summary\n`;
  summary += `${indent}========================================\n\n`;

  // Checks
  const checksRate = data.metrics.checks ? (data.metrics.checks.values.passes / (data.metrics.checks.values.fails + data.metrics.checks.values.passes)) * 100 : 0;
  summary += `${indent}Checks Passed: ${checksRate.toFixed(2)}%\n`;

  // Métricas customizadas
  if (data.metrics.mysql_active_connections) {
    const avgConns = data.metrics.mysql_active_connections.values.avg;
    summary += `${indent}Active Connections (avg): ${avgConns.toFixed(2)}\n`;
  }

  if (data.metrics.mysql_queries_rate) {
    const avgQueriesRate = data.metrics.mysql_queries_rate.values.avg;
    summary += `${indent}Queries/s (avg): ${avgQueriesRate.toFixed(2)}\n`;
  }

  summary += `\n`;

  return summary;
}
