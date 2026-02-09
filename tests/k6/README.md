# 🚀 Testes de Carga com k6

Este diretório contém scripts k6 para testar a stack de observabilidade do lab e aprender conceitos de performance testing.

---

## 📦 Instalação do k6

### Windows (via Chocolatey)
```bash
choco install k6
```

### Linux/WSL (via apt)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### macOS (via Homebrew)
```bash
brew install k6
```

### Via Docker (alternativa sem instalação)
```bash
docker run --rm -i --network=host grafana/k6 run - <script.js
```

### Verificar instalação
```bash
k6 version
```

---

## 🎯 Quick Start - Seu Primeiro Teste (3 minutos)

### 1. Subir a stack
```bash
cd /mnt/c/repositories/lab-observabilidade
docker compose up -d
```

### 2. Abrir o Grafana
- http://localhost:3000 (admin/admin)
- Abra um dos dashboards de overview
- Configure refresh: **10s**

### 3. Executar teste
```bash
cd tests/k6
k6 run test-dotnet-api.js
```

### 4. Observar no Grafana
Você verá em tempo real:
- 📈 Request rate aumentando
- ⏱️ Latência (P50, P95, P99)
- 🔥 CPU e memória subindo
- 📝 Logs sendo gerados

**Pronto!** Você executou seu primeiro teste de carga. 🎉

---

## 📜 Scripts Disponíveis

### Testes Básicos por API

#### 1. `test-dotnet-api.js` - API .NET
Testa endpoints da API .NET com diferentes cargas.

```bash
# Teste padrão (10 VUs por 30s)
k6 run test-dotnet-api.js

# Teste de stress (50 VUs por 2min)
k6 run --vus 50 --duration 2m test-dotnet-api.js
```

#### 2. `test-python-api.js` - API Python
Testa FastAPI com simulação de workload realista.

```bash
k6 run test-python-api.js
```

#### 3. `test-java-api.js` - API Java Spring Boot
Testa endpoints de produtos e pedidos.

```bash
k6 run test-java-api.js
```

#### 4. `test-nextjs-app.js` - Next.js App
Testa API routes do Next.js.

```bash
k6 run test-nextjs-app.js
```

#### 5. `test-all-services.js` - Teste Completo
Testa todos os serviços simultaneamente (cenário mais realista).

```bash
k6 run test-all-services.js
```

#### 6. `load-test-scenarios.js` - Cenários Avançados
Múltiplos cenários de carga com diferentes perfis (carga constante, rampa, spike).

```bash
k6 run load-test-scenarios.js
```

---

## ⚡ Spike Tests - Testes de Picos de Carga

### O que é um Spike Test?

Um **spike test** simula um **aumento súbito e extremo** de tráfego para avaliar como o sistema se comporta sob picos inesperados de carga.

#### Diferenças entre tipos de teste:

| Tipo | Objetivo | Perfil de Carga |
|------|----------|-----------------|
| **Load Test** | Testar comportamento sob carga esperada | Aumento gradual e constante |
| **Stress Test** | Encontrar limite máximo do sistema | Aumento gradual até quebrar |
| **Spike Test** | Testar resiliência a picos súbitos | Aumento drástico instantâneo |
| **Soak Test** | Testar estabilidade prolongada | Carga constante por horas |

### Perfil do Spike Test

```
VUs
500 │                  ┌─────────────┐
    │                 ╱               ╲
    │                ╱                 ╲
 50 │──────────────╱                   ╲──────────
    │             ╱                     ╲
  0 └────────────┴───────────────────────┴────────
     0s   10s  15s        45s         50s      60s

     Fase 1: Ramp-up (10s) - 0 → 50 VUs
     Fase 2: SPIKE (5s) - 50 → 500 VUs  ⚡
     Fase 3: Sustentação (30s) - 500 VUs
     Fase 4: Ramp-down (5s) - 500 → 50 VUs
     Fase 5: Cooldown (10s) - 50 → 0 VUs
```

### Scripts de Spike Test Disponíveis:

#### .NET API
```bash
# Via script automático (recomendado)
./tests/spike-test-dotnet.sh

# Via k6 direto
k6 run tests/k6/spike-test-dotnet.js
```

#### Java API
```bash
# Via script automático
./tests/spike-test-java.sh

# Via k6 direto
k6 run tests/k6/spike-test-java.js
```

#### Python API
```bash
# Via script automático
./tests/spike-test-python.sh

# Via k6 direto
k6 run tests/k6/spike-test-python.js
```

### Critérios de Sucesso

O sistema passa no spike test se:

1. ✅ **Disponibilidade**: Permanece UP durante todo o teste
2. ✅ **Taxa de Erro**: < 10% durante o spike
3. ✅ **Latência P95**: < 2000ms durante o spike
4. ✅ **Recuperação**: Sistema volta ao normal após o spike
5. ✅ **Sem Crashes**: Nenhum container reinicia

---

## 💥 Chaos Tests - Testes Extremos

### O que é um Chaos Test?

Um **chaos test** leva o sistema ao **limite absoluto** com carga extrema (5000 VUs) para **forçar erros** e encontrar pontos de falha.

### Perfil do Chaos Test

```
VUs
5000│         ┌───────────────────┐
    │        ╱                     ╲
    │       ╱                       ╲
 500│──────╱                         ╲────
    │     ╱                           ╲
   0└────┴─────────────────────────────┴──
     0s  5s  10s                  30s  35s

     Fase 1: Warm-up (5s) - 0 → 500 VUs
     Fase 2: CAOS (5s) - 500 → 5000 VUs  💥
     Fase 3: Mantém CAOS (20s) - 5000 VUs
     Fase 4: Crash (5s) - 5000 → 0 VUs
```

### Scripts de Chaos Test Disponíveis:

#### .NET API
```bash
# ⚠️ ATENÇÃO: Teste extremamente agressivo!
./tests/chaos-test-dotnet.sh
```

#### Java API
```bash
./tests/chaos-test-java.sh
```

#### Python API
```bash
./tests/chaos-test-python.sh
```

### ⚠️ Avisos Importantes

O Chaos Test:
- Pode **TRAVAR a API** temporariamente
- CPU vai a **100%** em múltiplos cores
- Memória pode **esgotar**
- Sistema operacional pode ficar **lento**
- Pode precisar **reiniciar containers** após o teste

### Objetivo

O objetivo é **FORÇAR erros** para:
- Validar tratamento de erros sob carga extrema
- Testar circuit breakers e rate limiting
- Encontrar memory leaks
- Verificar limites de recursos
- Testar recuperação do sistema

---

## 🗄️ Testes de Database Monitoring

Scripts k6 para validar métricas de bancos de dados via Prometheus.

### 7. `test-postgres-metrics.js` - PostgreSQL

Valida métricas do PostgreSQL Exporter + gera tráfego na API.

```bash
k6 run test-postgres-metrics.js
```

**Métricas validadas:**
- ✅ Status do PostgreSQL Exporter (pg_up)
- ✅ Conexões ativas
- ✅ Cache Hit Ratio (threshold > 90%)
- ✅ Tamanho do banco de dados
- ✅ Taxa de commits
- ✅ Locks

### 8. `test-mssql-metrics.js` - SQL Server

Valida métricas do SQL Server Exporter.

```bash
k6 run test-mssql-metrics.js
```

**Métricas validadas:**
- ✅ Status do SQL Server Exporter (mssql_up)
- ✅ Conexões
- ✅ Buffer Cache Hit Ratio (threshold > 80%)
- ✅ Batch Requests/s
- ✅ Uso de Memória
- ✅ Deadlocks

### 9. `test-mysql-metrics.js` - MySQL

Valida métricas do MySQL Exporter.

```bash
k6 run test-mysql-metrics.js
```

**Métricas validadas:**
- ✅ Status do MySQL Exporter (mysql_up)
- ✅ Conexões e threads
- ✅ Queries por segundo
- ✅ Slow queries
- ✅ Uptime

### Arquitetura Multi-Banco

O lab demonstra observabilidade em 3 bancos diferentes:

| Aplicação | Banco de Dados | Porta | Exporter | Dashboard |
|-----------|---------------|-------|----------|-----------|
| **.NET API** | SQL Server 2019 | 1433 | 4000 | overview-dotnet |
| **Python API** | PostgreSQL 18 | 5432 | 9187 | overview-python |
| **Java API** | MySQL | 3306 | 9104 | overview-java |

---

## 🎓 Exercícios Práticos

### 🟢 Nível 1: Baseline (5 minutos)
**Objetivo**: Entender a performance "normal" de cada API.

```bash
# Rodar teste em cada API
k6 run test-dotnet-api.js
k6 run test-python-api.js
k6 run test-java-api.js
```

**Anote para cada API:**
- ⏱️ Latência P95
- 📈 Taxa de requisições (req/s)
- 💻 Uso de CPU/memória no Grafana

**Perguntas:**
- Qual API tem menor latência?
- Qual tem maior throughput?
- Qual consome mais recursos?

---

### 🟡 Nível 2: Spike Test (10 minutos)
**Objetivo**: Ver como cada API reage a picos repentinos de carga.

```bash
# Testar cada API com spike
./tests/spike-test-dotnet.sh
./tests/spike-test-java.sh
./tests/spike-test-python.sh
```

**Observe:**
- ⚡ Latência durante o spike (primeiros 15s)
- ⏳ Tempo de recuperação após spike
- ❌ Taxa de erros durante o pico
- 📊 Comportamento do CPU/memória

**Compare:**
- Qual API aguenta melhor o spike?
- Qual tem recuperação mais rápida?
- Alguma API teve > 10% de erros?

---

### 🔴 Nível 3: Chaos Test (15 minutos)
**Objetivo**: Forçar erros e encontrar limites absolutos.

```bash
# ⚠️ CUIDADO: Teste extremamente agressivo!
./tests/chaos-test-dotnet.sh
./tests/chaos-test-java.sh
./tests/chaos-test-python.sh
```

**Observe no Grafana:**
- 🔴 Taxa de Erros (deve subir significativamente)
- 🔥 CPU (vai saturar)
- 💾 Memória (pode esgotar)
- 🗄️ Database (conexões, locks, deadlocks)
- 📝 Logs (explosão de erros)

**Análise:**
- Qual API colapsou primeiro?
- Qual banco teve mais problemas?
- O sistema recuperou após o teste?

---

### ⚫ Nível 4: Stress Test / Soak Test (15 minutos)

**Opção A - Stress Test (Encontrar limite):**

```bash
# Aumentar progressivamente a carga
k6 run --vus 10 --duration 1m test-dotnet-api.js
k6 run --vus 25 --duration 1m test-dotnet-api.js
k6 run --vus 50 --duration 1m test-dotnet-api.js
k6 run --vus 100 --duration 1m test-dotnet-api.js
```

**Observe quando:**
- 🔴 Latência começa a degradar (P95 > 500ms)
- ❌ Taxa de erros aumenta
- 🔥 CPU/memória satura

**Opção B - Soak Test (Longa duração):**

```bash
# 10 minutos com carga constante
k6 run --vus 20 --duration 10m test-all-services.js
```

**Verifique:**
- 📈 Uso de memória crescente (possível leak)
- ⏱️ Degradação de latência ao longo do tempo
- 🔄 Estabilidade dos containers

---

## 📊 Interpretando Resultados

### Saída do k6

```
✓ status is 200
✓ response time < 500ms

checks.........................: 100.00% ✓ 5000      ✗ 0
http_req_duration..............: avg=45ms     min=10ms     med=40ms     max=200ms    p(95)=85ms
http_req_failed................: 0.00%   ✓ 0         ✗ 5000
http_reqs......................: 5000    166.666667/s
```

### Métricas Importantes

| Métrica | O que significa | Bom | Atenção | Crítico |
|---------|-----------------|-----|---------|---------|
| **http_req_duration** P95 | 95% das requisições são mais rápidas que este valor | < 200ms | 200-500ms | > 500ms |
| **http_req_duration** P99 | 99% das requisições são mais rápidas que este valor | < 500ms | 500ms-1s | > 1s |
| **http_req_failed** | % de requisições que falharam (erros HTTP) | < 0.1% | 0.1-1% | > 1% |
| **http_reqs** | Taxa de requisições por segundo (throughput) | - | - | - |
| **checks** | % de validações que passaram | 100% | > 95% | < 95% |

### Correlacionando com Grafana

**No k6:**
```
http_req_duration..............: avg=120ms p(95)=250ms
```

**No Prometheus (Grafana Explore):**
```promql
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{job="dotnet-api"}[1m]))
```

**Os valores devem bater!** Se não:
- ✅ Verifique time range no Grafana (deve cobrir o período do teste)
- ✅ Confirme que o teste está rodando
- ✅ Check se o job label está correto

---

## 📊 Monitorando os Testes no Grafana

### Antes de executar:
1. Acesse o Grafana: http://localhost:3000
2. Abra o dashboard da API que será testada:
   - **overview-dotnet** - .NET API + SQL Server
   - **overview-java** - Java API + MySQL
   - **overview-python** - Python API + PostgreSQL
3. Ajuste o time range para "Last 5 minutes" com auto-refresh de **10s**

### Métricas para observar:

**Durante o teste:**
- **Request Rate**: Taxa de requisições por segundo
- **Response Time**: P50, P95, P99
- **Error Rate**: % de erros HTTP (4xx, 5xx)
- **CPU/Memory**: Uso de recursos do container
- **Database**: Conexões, cache hit ratio, operações

**Queries úteis no Grafana Explore (PromQL):**

```promql
# Taxa de requisições (.NET)
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[1m])

# Taxa de requisições (Java)
rate(http_server_requests_seconds_count{job="java-api"}[1m])

# Latência P95 (.NET)
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{job="dotnet-api"}[1m]))

# Taxa de erros (5xx)
rate(http_server_request_duration_seconds_count{job="dotnet-api",http_response_status_code=~"5.."}[1m])
```

**Logs no Loki (LogQL):**

```logql
# Logs da API durante teste
{container="dotnet-api"}
{container="java-api"}
{container="python-api"}

# Apenas logs de erro
{container="dotnet-api"} |= "error"

# Taxa de logs
rate({container="dotnet-api"}[1m])
```

---

## 💡 Dicas Avançadas

### 1. Rodar em modo silencioso
```bash
k6 run --quiet test-dotnet-api.js
```

### 2. Salvar resultados
```bash
k6 run test-dotnet-api.js > results.txt
```

### 3. Exportar para JSON
```bash
k6 run --out json=results.json test-dotnet-api.js
```

### 4. Usar variáveis de ambiente
```bash
export BASE_URL=http://production.com
k6 run test-dotnet-api.js
```

### 5. Debug mode
```bash
k6 run --http-debug test-dotnet-api.js
```

### 6. Customizar thresholds
```bash
k6 run --threshold http_req_duration=avg<200 test-dotnet-api.js
```

---

## 🎯 Checklist de Aprendizado

Após completar os exercícios, você deve ser capaz de:

- ✅ Instalar e executar k6
- ✅ Interpretar métricas de latência (P50, P95, P99)
- ✅ Diferenciar tipos de teste (load, stress, spike, soak, chaos)
- ✅ Executar spike tests e chaos tests
- ✅ Identificar gargalos de performance
- ✅ Correlacionar dados k6 com métricas do Prometheus
- ✅ Usar logs do Loki para debug de erros durante testes
- ✅ Estabelecer baselines de performance
- ✅ Validar métricas de bancos de dados
- ✅ Definir quando um sistema está degradando

---

## 🐛 Troubleshooting

### Erro: "connection refused"
```bash
# Verificar se serviços estão rodando
docker compose ps

# Testar conectividade manualmente
curl http://localhost:5000/health    # .NET API
curl http://localhost:8001/health    # Python API
curl http://localhost:8002/health    # Java API
```

### Resultados inconsistentes
- Rodar teste múltiplas vezes (mínimo 3x)
- Usar `--quiet` para reduzir overhead de logging
- Verificar outros processos consumindo CPU (fechar navegadores, IDEs)
- Aumentar duração do teste para estabilizar

### Performance muito baixa
```bash
# Verificar recursos do Docker
docker stats

# Verificar logs dos containers
docker logs dotnet-api
docker logs python-api
docker logs java-api
```

### Timeouts
Aumentar timeout no script (editar o arquivo `.js`):

```javascript
export let options = {
  timeout: '30s',  // default é 10s
};
```

### Sistema não recupera após chaos test
```bash
# Reiniciar containers afetados
docker compose restart dotnet-api
docker compose restart java-api
docker compose restart python-api

# Verificar logs
docker logs dotnet-api --tail 50
```

---

## 📚 Próximos Passos

Depois de dominar k6 e completar os exercícios:

1. ✅ **Definir SLIs/SLOs** baseados nos resultados dos testes
   - Ex: P95 < 200ms, error rate < 0.1%

2. ✅ **Criar alertas no Grafana** quando métricas ultrapassam baseline
   - Ex: alerta quando P95 > 500ms

3. ✅ **Implementar Circuit Breakers** para proteger contra overload
   - Rate limiting nas APIs
   - Fallback responses

4. ✅ **Otimizar performance** baseado nos gargalos encontrados
   - Database indexing
   - Caching
   - Connection pooling

5. ✅ **Integrar k6 no CI/CD**
   - Executar testes automaticamente em cada deploy
   - Bloquear deploy se performance degradar

### Recursos Adicionais

- **Documentação k6**: https://k6.io/docs/
- **k6 Examples**: https://k6.io/docs/examples/
- **Test Types Guide**: https://k6.io/docs/test-types/
- **k6 Extensions**: https://k6.io/docs/extensions/
- **Grafana k6 Cloud** (opcional): https://grafana.com/products/cloud/k6/

---

**Parabéns! Você agora sabe usar k6 para testes de carga completos!** 🎉
