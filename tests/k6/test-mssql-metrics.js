import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Métricas customizadas do k6
const mssqlUpCheck = new Counter('mssql_exporter_up');
const bufferCacheHitRatio = new Trend('mssql_buffer_cache_hit_ratio');
const activeConnections = new Trend('mssql_active_connections');
const batchRequestsRate = new Trend('mssql_batch_requests_rate');

export const options = {
  scenarios: {
    // Cenário 1: Validar métricas do SQL Server
    validate_metrics: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'validateMetrics',
    },
  },
  thresholds: {
    // Thresholds para validação
    'mssql_exporter_up': ['count>0'],
    'mssql_buffer_cache_hit_ratio': ['avg>80'], // Buffer cache hit deve ser > 80%
    'checks': ['rate>0.80'], // 80% dos checks devem passar
  },
};

// Validar métricas do SQL Server no Prometheus
export function validateMetrics() {
  console.log('\n========================================');
  console.log('SQL Server Metrics Validation');
  console.log('========================================\n');

  // 1. Verificar se MSSQL Exporter está UP
  console.log('1. Verificando SQL Server Exporter...');
  const mssqlUpRes = queryPrometheus('mssql_up{job="mssql"}');

  const mssqlUp = check(mssqlUpRes, {
    'SQL Server Exporter está UP': (r) => {
      const value = extractMetricValue(r);
      if (value === '1') {
        mssqlUpCheck.add(1);
        console.log('   ✓ SQL Server Exporter está UP');
        return true;
      }
      console.log('   ✗ SQL Server Exporter está DOWN');
      return false;
    },
  });

  if (!mssqlUp) {
    console.log('\n✗ SQL Server Exporter não está disponível. Abortando validação.\n');
    return;
  }

  sleep(1);

  // 2. Validar conexões
  console.log('\n2. Verificando conexões...');
  const connectionsRes = queryPrometheus('mssql_connections{job="mssql"}');

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

  // 3. Validar Buffer Cache Hit Ratio
  console.log('\n3. Verificando Buffer Cache Hit Ratio...');
  const bufferCacheRes = queryPrometheus('mssql_buffer_cache_hit_ratio{job="mssql"}');

  check(bufferCacheRes, {
    'Buffer Cache Hit Ratio > 80%': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const ratio = parseFloat(value);
        bufferCacheHitRatio.add(ratio);
        console.log(`   Buffer Cache Hit Ratio: ${ratio.toFixed(2)}%`);

        if (ratio > 80) {
          console.log('   ✓ Buffer Cache Hit Ratio está saudável (> 80%)');
          return true;
        } else {
          console.log('   ⚠ Buffer Cache Hit Ratio está baixo (< 80%)');
          return false;
        }
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 4. Validar Batch Requests
  console.log('\n4. Verificando Batch Requests...');
  const batchReqRes = queryPrometheus('rate(mssql_batch_requests{job="mssql"}[1m])');

  check(batchReqRes, {
    'Batch Requests disponíveis': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const rate = parseFloat(value);
        batchRequestsRate.add(rate);
        console.log(`   Batch Requests/s: ${rate.toFixed(2)}`);
        return true;
      }
      console.log('   Batch Requests/s: N/A (sem dados suficientes)');
      return false;
    },
  });

  sleep(1);

  // 5. Validar Memória
  console.log('\n5. Verificando uso de memória...');
  const memoryRes = queryPrometheus('mssql_server_total_server_memory_bytes{job="mssql"}');

  check(memoryRes, {
    'Memória disponível': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const memBytes = parseFloat(value);
        const memMB = memBytes / 1024 / 1024;
        console.log(`   Memória Total do Servidor: ${memMB.toFixed(2)} MB`);
        return true;
      }
      console.log('   ✗ Métrica não disponível');
      return false;
    },
  });

  sleep(1);

  // 6. Validar Deadlocks
  console.log('\n6. Verificando deadlocks...');
  const deadlocksRes = queryPrometheus('mssql_deadlocks{job="mssql"}');

  check(deadlocksRes, {
    'Deadlocks sob controle': (r) => {
      const value = extractMetricValue(r);
      if (value !== null) {
        const deadlocks = parseFloat(value);
        console.log(`   Total de Deadlocks: ${deadlocks}`);

        if (deadlocks < 10) {
          console.log('   ✓ Deadlocks estão normais (< 10)');
          return true;
        } else {
          console.log('   ⚠ Muitos deadlocks detectados (>= 10)');
          return true; // Não falha, só avisa
        }
      }
      console.log('   Deadlocks: N/A');
      return false;
    },
  });

  console.log('\n========================================');
  console.log('✓ Validação concluída!');
  console.log('========================================');
  console.log('\nLinks úteis:');
  console.log('  Prometheus Targets: http://localhost:9090/targets');
  console.log('  SQL Server Metrics: http://localhost:4000/metrics');
  console.log('  Grafana Dashboard: http://localhost:3000/d/mssql-monitoring');
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
  summary += `${indent}SQL Server Metrics Test - Summary\n`;
  summary += `${indent}========================================\n\n`;

  // Checks
  const checksRate = data.metrics.checks ? (data.metrics.checks.values.passes / (data.metrics.checks.values.fails + data.metrics.checks.values.passes)) * 100 : 0;
  summary += `${indent}Checks Passed: ${checksRate.toFixed(2)}%\n`;

  // Métricas customizadas
  if (data.metrics.mssql_buffer_cache_hit_ratio) {
    const avgBufferCache = data.metrics.mssql_buffer_cache_hit_ratio.values.avg;
    summary += `${indent}Buffer Cache Hit Ratio (avg): ${avgBufferCache.toFixed(2)}%\n`;
  }

  if (data.metrics.mssql_active_connections) {
    const avgConns = data.metrics.mssql_active_connections.values.avg;
    summary += `${indent}Active Connections (avg): ${avgConns.toFixed(2)}\n`;
  }

  if (data.metrics.mssql_batch_requests_rate) {
    const avgBatchReq = data.metrics.mssql_batch_requests_rate.values.avg;
    summary += `${indent}Batch Requests/s (avg): ${avgBatchReq.toFixed(2)}\n`;
  }

  summary += `\n`;

  return summary;
}
