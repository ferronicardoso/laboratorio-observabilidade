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
- Abra o dashboard "Multi-Language Overview"
- Configure refresh: **5s**

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

### 1. `test-dotnet-api.js` - API .NET
Testa endpoints da API .NET com diferentes cargas.

```bash
# Teste padrão (10 VUs por 30s)
k6 run test-dotnet-api.js

# Teste de stress (50 VUs por 2min)
k6 run --vus 50 --duration 2m test-dotnet-api.js

# Teste de spike (0→100 VUs em 10s)
k6 run --stage 10s:100 --stage 20s:100 --stage 10s:0 test-dotnet-api.js
```

### 2. `test-python-api.js` - API Python
Testa FastAPI com simulação de workload realista.

```bash
k6 run test-python-api.js
```

### 3. `test-java-api.js` - API Java Spring Boot
Testa endpoints de produtos e pedidos.

```bash
k6 run test-java-api.js
```

### 4. `test-nextjs-app.js` - Next.js App
Testa API routes do Next.js.

```bash
k6 run test-nextjs-app.js
```

### 5. `test-all-services.js` - Teste Completo
Testa todos os serviços simultaneamente (cenário mais realista).

```bash
k6 run test-all-services.js
```

### 6. `load-test-scenarios.js` - Cenários Avançados
Múltiplos cenários de carga com diferentes perfis (carga constante, rampa, spike).

```bash
k6 run load-test-scenarios.js
```

---

## 🎓 Exercícios Práticos

### 🟢 Nível 1: Baseline (5 minutos)
**Objetivo**: Entender a performance "normal" de cada API.

```bash
# Rodar teste em cada API
k6 run test-dotnet-api.js
k6 run test-python-api.js
k6 run test-java-api.js
k6 run test-nextjs-app.js
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

### 🟡 Nível 2: Stress Test (10 minutos)
**Objetivo**: Encontrar o limite de cada API.

```bash
# Aumentar progressivamente a carga na API .NET
k6 run --vus 10 --duration 1m test-dotnet-api.js   # Anote o P95
k6 run --vus 25 --duration 1m test-dotnet-api.js   # Anote o P95
k6 run --vus 50 --duration 1m test-dotnet-api.js   # Anote o P95
k6 run --vus 100 --duration 1m test-dotnet-api.js  # Anote o P95
```

**Observe quando:**
- 🔴 Latência começa a degradar (P95 > 500ms)
- ❌ Taxa de erros aumenta
- 🔥 CPU/memória satura

**Perguntas:**
- Em que ponto (quantos VUs) a API satura?
- A degradação é gradual ou abrupta?
- Aparecem erros HTTP?

---

### 🔴 Nível 3: Spike Test (10 minutos)
**Objetivo**: Ver como o sistema reage a picos repentinos de carga.

```bash
k6 run --stage 5s:0 --stage 5s:100 --stage 30s:100 --stage 5s:0 test-all-services.js
```

**Observe:**
- ⚡ Latência durante o spike (primeiros 10s)
- ⏳ Tempo de recuperação após spike
- ❌ Erros durante o pico
- 📊 Comportamento do CPU/memória

**Queries úteis no Grafana Explore:**

```promql
# Taxa de requisições durante spike
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[30s])

# Latência máxima
max(http_server_request_duration_seconds{job="dotnet-api"})
```

**Abra múltiplos dashboards:**
- Multi-Language Overview
- .NET API
- Python API
- Java API
- APIs - Logs Consolidados

---

### ⚫ Nível 4: Soak Test / Cenários Avançados (15 minutos)

**Opção A - Soak Test (Teste de Longa Duração):**

```bash
# 10 minutos com carga constante
k6 run --vus 20 --duration 10m test-all-services.js
```

**Verifique:**
- 📈 Uso de memória crescente (possível leak)
- ⏱️ Degradação de latência ao longo do tempo
- 🔄 Estabilidade dos containers

**Opção B - Cenários Múltiplos:**

```bash
k6 run load-test-scenarios.js
```

Este teste dura ~7 minutos e executa:
1. **Carga constante** (baseline)
2. **Rampa de carga** (escalabilidade)
3. **Spike test** (resiliência)

**Análise:**
- Compare latências entre cenários
- Identifique qual serviço é mais afetado por spike
- Verifique se há memory leaks

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

### Passo a Passo para Comparar

1. **No k6**, anote o timestamp do teste e o P95
2. **No Grafana**, vá para o dashboard da API testada
3. **Ajuste o time range** para o período do teste
4. **Compare**:
   - Latência k6 vs Prometheus (devem ser similares)
   - Request rate k6 vs Prometheus
   - Erros k6 vs logs no Loki

---

## 📊 Monitorando os Testes no Grafana

### Antes de executar:
1. Acesse o Grafana: http://localhost:3000
2. Abra o dashboard da API que será testada
3. Ajuste o time range para "Last 5 minutes" com auto-refresh de **5s**

### Métricas para observar:

**Durante o teste:**
- **Request Rate**: Taxa de requisições por segundo
- **Response Time**: P50, P95, P99
- **Error Rate**: % de erros HTTP (4xx, 5xx)
- **CPU/Memory**: Uso de recursos do container

**Queries úteis no Grafana Explore (PromQL):**

```promql
# Taxa de requisições
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[1m])

# Latência P95
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{job="dotnet-api"}[1m]))

# Taxa de erros (5xx)
rate(http_server_request_duration_seconds_count{job="dotnet-api",http_response_status_code=~"5.."}[1m])
```

**Logs no Loki (LogQL):**

```logql
# Logs da API durante teste
{container="dotnet-api"}

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
- ✅ Criar testes de carga customizados
- ✅ Identificar gargalos de performance
- ✅ Correlacionar dados k6 com métricas do Prometheus
- ✅ Usar logs do Loki para debug de erros durante testes
- ✅ Executar diferentes tipos de teste (load, stress, spike, soak)
- ✅ Estabelecer baselines de performance
- ✅ Definir quando um sistema está degradando

---

## 🐛 Troubleshooting

### Erro: "connection refused"
```bash
# Verificar se serviços estão rodando
docker compose ps

# Testar conectividade manualmente
curl http://localhost:5000/health
curl http://localhost:8001/health
curl http://localhost:8002/api/health
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
```

### Timeouts
Aumentar timeout no script (editar o arquivo `.js`):

```javascript
export let options = {
  timeout: '30s',  // default é 10s
};
```

### k6 não instalado
```bash
# Verificar instalação
k6 version

# Se não instalado, use Docker:
alias k6='docker run --rm -i --network=host grafana/k6'
```

---

## 📚 Próximos Passos

Depois de dominar k6 e completar os exercícios:

1. ✅ **Definir SLIs/SLOs** baseados nos resultados dos testes
   - Ex: P95 < 200ms, error rate < 0.1%

2. ✅ **Criar alertas no Grafana** quando métricas ultrapassam baseline
   - Ex: alerta quando P95 > 500ms

3. ✅ **Implementar Distributed Tracing** (task-001 do backlog)
   - Rastrear requisições através dos serviços

4. ✅ **Adicionar Continuous Profiling** (task-004 do backlog)
   - Identificar hotspots de CPU/memória

5. ✅ **Integrar k6 no CI/CD** (task-006 do backlog)
   - Executar testes automaticamente em cada deploy

### Recursos Adicionais

- **Documentação k6**: https://k6.io/docs/
- **k6 Examples**: https://k6.io/docs/examples/
- **Grafana k6 Cloud** (opcional): https://grafana.com/products/cloud/k6/
- **k6 Extensions**: https://k6.io/docs/extensions/

---

**Parabéns! Você agora sabe usar k6 para testes de carga!** 🎉
