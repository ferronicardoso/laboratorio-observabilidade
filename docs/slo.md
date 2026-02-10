# Service Level Objectives (SLOs)

Este documento define os **Service Level Indicators (SLIs)** e **Service Level Objectives (SLOs)** para as APIs do laboratório de observabilidade.

## 📊 Conceitos

### SLI (Service Level Indicator)
Métrica quantitativa que mede um aspecto do nível de serviço fornecido. É **O QUE** estamos medindo.

### SLO (Service Level Objective)
Target ou objetivo para um SLI. Define o nível de serviço esperado. É **QUANTO** queremos atingir.

### Error Budget
A quantidade de "erro" permitida dentro do SLO. Se o SLO é 99.9%, o error budget é 0.1% (ou ~43 minutos de downtime por mês).

### Burn Rate
Velocidade com que o error budget está sendo consumido. Um burn rate de 1.0 significa que estamos consumindo o budget na taxa esperada.

---

## 🎯 SLIs e SLOs Definidos

### .NET API (`dotnet-api`)

| SLI | Métrica | SLO Target | Janela de Tempo |
|-----|---------|------------|-----------------|
| **Availability** | % de requisições 2xx | ≥ 99.9% | 30 dias |
| **Latency P95** | Tempo de resposta P95 | < 200ms | 30 dias |
| **Error Rate** | % de requisições 5xx | < 0.1% | 30 dias |

**Queries PromQL:**
```promql
# Availability (% de sucesso)
sum(rate(http_server_request_duration_seconds_count{job="dotnet-api",http_response_status_code=~"2.."}[5m]))
/
sum(rate(http_server_request_duration_seconds_count{job="dotnet-api"}[5m])) * 100

# Latency P95
histogram_quantile(0.95,
  sum(rate(http_server_request_duration_seconds_bucket{job="dotnet-api"}[5m])) by (le)
) * 1000

# Error Rate (% de erro)
sum(rate(http_server_request_duration_seconds_count{job="dotnet-api",http_response_status_code=~"5.."}[5m]))
/
sum(rate(http_server_request_duration_seconds_count{job="dotnet-api"}[5m])) * 100
```

---

### Python API (`python-api`)

| SLI | Métrica | SLO Target | Janela de Tempo |
|-----|---------|------------|-----------------|
| **Availability** | % de requisições 2xx | ≥ 99.9% | 30 dias |
| **Latency P95** | Tempo de resposta P95 | < 200ms | 30 dias |
| **Error Rate** | % de requisições 5xx | < 0.1% | 30 dias |

**Queries PromQL:**
```promql
# Availability
sum(rate(http_server_duration_milliseconds_count{job="python-api",http_status_code=~"2.."}[5m]))
/
sum(rate(http_server_duration_milliseconds_count{job="python-api"}[5m])) * 100

# Latency P95
histogram_quantile(0.95,
  sum(rate(http_server_duration_milliseconds_bucket{job="python-api"}[5m])) by (le)
)

# Error Rate
sum(rate(http_server_duration_milliseconds_count{job="python-api",http_status_code=~"5.."}[5m]))
/
sum(rate(http_server_duration_milliseconds_count{job="python-api"}[5m])) * 100
```

---

### Java API (`java-api`)

| SLI | Métrica | SLO Target | Janela de Tempo |
|-----|---------|------------|-----------------|
| **Availability** | % de requisições 2xx | ≥ 99.9% | 30 dias |
| **Latency P95** | Tempo de resposta P95 | < 200ms | 30 dias |
| **Error Rate** | % de requisições 5xx | < 0.1% | 30 dias |

**Queries PromQL:**
```promql
# Availability
sum(rate(http_server_requests_seconds_count{job="java-api",status=~"2.."}[5m]))
/
sum(rate(http_server_requests_seconds_count{job="java-api"}[5m])) * 100

# Latency P95
histogram_quantile(0.95,
  sum(rate(http_server_requests_seconds_bucket{job="java-api"}[5m])) by (le)
) * 1000

# Error Rate
sum(rate(http_server_requests_seconds_count{job="java-api",status=~"5.."}[5m]))
/
sum(rate(http_server_requests_seconds_count{job="java-api"}[5m])) * 100
```

---

## 💰 Error Budget

O **Error Budget** representa a quantidade de "falha" permitida dentro do período do SLO.

### Cálculo do Error Budget

Para um SLO de **99.9% de disponibilidade em 30 dias**:

- **Uptime esperado**: 99.9% = 43.156 minutos de downtime permitido
- **Error budget**: 0.1% das requisições podem falhar

**Exemplo:**
- Se recebemos 1.000.000 de requisições em 30 dias
- Error budget = 1.000 requisições com erro (0.1%)
- Se já tivemos 500 erros, restam 500 no budget (50% consumido)

### Burn Rate

O **Burn Rate** indica a velocidade de consumo do error budget:

- **Burn Rate = 1.0**: Consumindo budget na taxa esperada (tudo OK)
- **Burn Rate > 1.0**: Consumindo budget mais rápido que o esperado (ALERTA!)
- **Burn Rate < 1.0**: Consumindo budget mais devagar (muito bom!)

**Cálculo:**
```
Burn Rate = (Error Rate Atual / Error Budget Permitido)
```

**Exemplo:**
- SLO: 99.9% (error budget = 0.1%)
- Se error rate atual = 0.5%
- Burn Rate = 0.5% / 0.1% = **5.0x**
- Significa: estamos consumindo o budget **5x mais rápido** que o esperado!

---

## 🚨 Alertas Recomendados

### Alerta de Burn Rate Alto (Critical)

**Condição:** Burn rate > 10x por 1 hora
- Significa que estamos consumindo o error budget 10x mais rápido
- Em ~3 dias todo o budget mensal seria consumido

```promql
# Alerta se burn rate > 10 por 1 hora
(
  sum(rate(http_server_request_duration_seconds_count{http_response_status_code=~"5.."}[1h]))
  /
  sum(rate(http_server_request_duration_seconds_count[1h]))
) > (0.001 * 10)  # 0.1% * 10 = 1%
```

### Alerta de Error Budget Esgotado (Warning)

**Condição:** Error budget < 10% restante

Significa que já consumimos 90% do error budget permitido para o mês.

---

## 📈 Dashboard de SLO

O dashboard `SLO Dashboard` (`slo-dashboard.json`) mostra:

1. **Current SLI Values** - Valores atuais de disponibilidade, latência e error rate
2. **SLO Compliance** - Se estamos atendendo os targets (verde/vermelho)
3. **Error Budget Remaining** - Quanto budget ainda temos (gauge 0-100%)
4. **Burn Rate** - Velocidade de consumo do budget (último 1h, 6h, 24h)
5. **Historical Trends** - Tendências dos SLIs ao longo do tempo

---

## 🎓 Referências

- [Google SRE Book - SLOs](https://sre.google/sre-book/service-level-objectives/)
- [Google SRE Workbook - Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Sloth - SLO Generator](https://github.com/slok/sloth)
