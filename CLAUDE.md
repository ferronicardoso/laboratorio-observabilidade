# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🔬 Sobre o Projeto

Este é um **laboratório educacional de observabilidade** que demonstra conceitos modernos de monitoramento, logging e métricas usando a Stack Grafana (Prometheus, Loki, Alloy, Grafana) com aplicações em múltiplas linguagens (.NET, Python, Java, TypeScript).

**Stack:**
- **Observabilidade**: Grafana, Prometheus, Loki, Grafana Tempo, Grafana Alloy, Node Exporter, Windows Exporter
- **Aplicações**: .NET API, Python FastAPI, Java Spring Boot, Next.js, Angular, Nginx
- **Banco de Dados**: PostgreSQL 18-alpine (1000 produtos para traces realistas)
- **Infraestrutura**: Docker + Docker Compose

---

## 🚀 Comandos Essenciais

### Executar o Projeto

```bash
# Subir toda a stack
docker compose up -d

# Verificar status dos containers
docker compose ps

# Ver logs de um serviço específico
docker logs <container-name>

# Parar a stack
docker compose down

# Rebuild de um serviço específico
docker compose up -d --build <service-name>

# Rebuild completo
docker compose down && docker compose up -d --build
```

### Acessar Interfaces

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Tempo**: http://localhost:3200 (API)
- **pgAdmin**: http://localhost:5050 (gerenciamento PostgreSQL)
- **Next.js**: http://localhost:3001
- **Angular**: http://localhost:4200
- **.NET API**: http://localhost:5000
- **Python API**: http://localhost:8001
- **Java API**: http://localhost:8002
- **Nginx**: http://localhost:8080
- **PostgreSQL**: localhost:5432 (banco de dados)

### Testar Métricas

```bash
# Verificar targets no Prometheus
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# Ver métricas de uma aplicação
curl http://localhost:5000/metrics  # .NET
curl http://localhost:8001/metrics  # Python
curl http://localhost:8002/actuator/prometheus  # Java

# Gerar tráfego para testes
for i in {1..50}; do curl -s http://localhost:5000/weatherforecast > /dev/null; done
```

### Queries Úteis

**PromQL (Prometheus):**
```promql
# Requisições por segundo
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[1m])

# Uso de CPU do Windows
100 - (avg(rate(windows_cpu_time_total{mode="idle",job="node-exporter-windows"}[2m])) * 100)

# Uso de CPU do Linux
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="node-exporter-linux"}[5m])) * 100)
```

**LogQL (Loki):**
```logql
# Logs do Nginx
{job="nginx"}

# Logs de uma aplicação específica
{container="dotnet-api"}

# Taxa de logs
rate({container="python-api"}[1m])
```

**TraceQL (Tempo):**
```traceql
# Todos os traces de um serviço
{ resource.service.name="dotnet-api" }

# Traces com queries SQL
{ resource.service.name="dotnet-api" && span.db.statement != nil }

# Traces com duração > 100ms
{ resource.service.name="dotnet-api" && duration > 100ms }

# Traces com erro
{ resource.service.name="dotnet-api" && status = error }
```

---

## 🔍 Distributed Tracing (Fase 2)

### Grafana Tempo v2.9.1

**⚠️ IMPORTANTE - Bug na versão 2.10.0:**
A versão 2.10.0 do Tempo tem um bug conhecido onde o módulo `ingester` não é inicializado em modo monolithic (single-binary), causando o erro "InstancesCount <= 0". Use a versão **2.9.1** ou anteriores (2.6.0, 2.7.x, 2.8.x, 2.9.x) até que o bug seja corrigido.

**Versões testadas e funcionais:**
- ✅ v2.6.0 - funciona
- ✅ v2.8.2 - funciona
- ✅ v2.9.1 - funciona (recomendada)
- ❌ v2.10.0 - ingester não inicializa

### Componentes de Tracing

**Stack de Tracing:**
- **Tempo 2.9.1**: Backend para armazenamento de traces
- **OpenTelemetry**: Instrumentação da API .NET
- **Grafana Alloy**: Coletor de traces (OTLP receiver)
- **PostgreSQL 18-alpine**: Banco de dados com 1000 produtos para queries realistas

**Fluxo de Dados:**
1. API .NET gera traces com OpenTelemetry SDK
2. Traces incluem spans HTTP, Entity Framework Core (SQL queries)
3. Alloy recebe traces via OTLP (portas 4317 gRPC / 4318 HTTP)
4. Alloy encaminha para Tempo
5. Tempo armazena traces e gera métricas (service graphs, span metrics)
6. Métricas são enviadas ao Prometheus via remote_write
7. Grafana consulta traces no Tempo e visualiza Service Graph

### Configuração do Tempo

**Config mínima para modo monolithic (`tempo-config.yml`):**
```yaml
stream_over_http_enabled: true

server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317  # IMPORTANTE: 0.0.0.0, não 127.0.0.1
        http:
          endpoint: 0.0.0.0:4318

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  max_block_duration: 5m

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: lab-observabilidade
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://prometheus:9090/api/v1/write
        send_exemplars: true

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/blocks
    wal:
      path: /var/tempo/wal

overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics]
```

**Configuração do Prometheus:**
- Adicionar flag `--web.enable-remote-write-receiver` para aceitar métricas do Tempo
- Tempo envia métricas de service graphs e span metrics automaticamente

### Visualizar Traces no Grafana

**1. Grafana Explore:**
- URL: http://localhost:3000/explore
- Selecionar datasource "Tempo"

**2. Search (interface visual):**
- Service Name: `dotnet-api`
- Span Name: filtros opcionais
- Tags: `http.method`, `http.status_code`, etc.

**3. TraceQL (queries avançadas):**
```traceql
# ⚠️ IMPORTANTE: usar resource.service.name, NÃO service.name
{ resource.service.name="dotnet-api" }
{ resource.service.name="dotnet-api" && span.db.statement != nil }
{ resource.service.name="dotnet-api" && duration > 100ms }
```

**4. Service Graph:**
- Visualização do fluxo de requisições entre serviços
- Mostra taxa de requisições, latência e erros
- Requer métricas do metrics_generator no Prometheus

**5. Correlação com Logs:**
- Clicar em um span no trace
- Grafana busca logs correlacionados automaticamente via tags

### Instrumentação da API .NET

**Pacotes necessários:**
```xml
<PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.10.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.10.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.10.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.EntityFrameworkCore" Version="1.0.0-beta.14" />
```

**Configuração (`Program.cs`):**
```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .SetResourceBuilder(ResourceBuilder.CreateDefault()
                .AddService("dotnet-api", serviceVersion: "1.0.0"))
            .AddAspNetCoreInstrumentation(options =>
            {
                options.RecordException = true;
                options.EnrichWithHttpRequest = (activity, request) =>
                {
                    activity.SetTag("http.request.method", request.Method);
                    activity.SetTag("http.request.path", request.Path);
                };
            })
            .AddHttpClientInstrumentation()
            .AddEntityFrameworkCoreInstrumentation(options =>
            {
                options.SetDbStatementForText = true;
                options.EnrichWithIDbCommand = (activity, command) =>
                {
                    activity.SetTag("db.query", command.CommandText);
                };
            })
            .AddOtlpExporter(options =>
            {
                options.Endpoint = new Uri("http://alloy:4317");
                options.Protocol = OtlpExportProtocol.Grpc;
            });
    });
```

**Spans gerados automaticamente:**
- ✅ HTTP requests (ASP.NET Core)
- ✅ SQL queries (Entity Framework Core)
- ✅ HTTP client calls
- ✅ Exceções (quando configurado)

**Atributos úteis nos traces:**
- `http.method`, `http.route`, `http.status_code`
- `db.statement` - SQL query completa
- `db.system`, `db.name` - informações do banco
- Duração de cada span em microssegundos

### Gerar Tráfego para Traces

```bash
# GET produtos (paginação + SQL queries)
for i in {1..10}; do
  curl -s "http://localhost:5000/api/products?page=$((RANDOM % 10 + 1))&pageSize=5" > /dev/null
  sleep 0.2
done

# GET por ID (queries SQL específicas)
for i in {1..10}; do
  curl -s "http://localhost:5000/api/products/$((RANDOM % 1000 + 1))" > /dev/null
  sleep 0.2
done

# Count
for i in {1..5}; do
  curl -s "http://localhost:5000/api/products/count" > /dev/null
  sleep 0.2
done
```

### Troubleshooting Traces

**Traces não aparecem no Grafana:**
1. Verificar se Tempo está rodando: `docker logs tempo | grep "starting module=ingester"`
2. Verificar se Alloy está encaminhando: `docker logs alloy | grep tempo`
3. Verificar endpoints OTLP: devem ser `0.0.0.0:4317` e não `127.0.0.1`
4. Gerar tráfego na API para criar traces

**Service Graph vazio:**
1. Verificar se Prometheus aceita remote write: flag `--web.enable-remote-write-receiver`
2. Verificar se metrics_generator tem `remote_write` configurado
3. Aguardar 1-2 minutos após gerar tráfego
4. Verificar métricas no Prometheus: `curl http://localhost:9090/api/v1/label/__name__/values | grep traces_service_graph`

**Erro "InstancesCount <= 0":**
- Versão 2.10.0 do Tempo está com bug
- Usar versão 2.9.1 ou anterior

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
lab-observabilidade/
├── apps/                                    # Aplicações monitoradas
│   ├── dotnet-api/                         # API .NET com OpenTelemetry
│   ├── python-api/                         # API Python com OpenTelemetry
│   ├── java-api/                           # API Java com Micrometer
│   ├── nextjs-app/                         # App Next.js com prom-client
│   ├── angular-app/                        # App Angular com Grafana Faro
│   └── nginx/                              # Nginx como reverse proxy
│
├── observability/                          # Stack de observabilidade
│   ├── prometheus/
│   │   └── prometheus.yml                  # Config de scrape targets
│   ├── loki/
│   │   └── loki-config.yml                # Config de armazenamento de logs
│   ├── alloy/
│   │   └── config.alloy                   # Config de coleta (logs + RUM)
│   └── grafana/
│       └── provisioning/                   # Configuração automática
│           ├── datasources/               # Prometheus + Loki
│           └── dashboards/                # Dashboards em JSON
│               └── json/
│                   ├── apis-logs.json     # Logs consolidados
│                   ├── linux.json         # Host Linux/WSL
│                   ├── windows.json       # Host Windows + IIS
│                   └── [app]-*.json       # Dashboards por app
│
└── docker-compose.yml                      # Orquestração completa
```

### Fluxo de Dados

**Métricas (Pull):**
1. Aplicações expõem `/metrics` em formato Prometheus
2. Prometheus faz scrape a cada 15s (configurado em `prometheus.yml`)
3. Grafana consulta Prometheus via PromQL

**Logs (Push):**
1. Aplicações geram logs no stdout/stderr
2. Alloy coleta via Docker logs API
3. Alloy adiciona labels (`container`, `job`) e envia para Loki
4. Grafana consulta Loki via LogQL

**RUM (Push):**
1. Angular app usa Grafana Faro SDK
2. SDK captura Core Web Vitals, erros, interações
3. Envia para Alloy via HTTP (porta 12347)
4. Alloy processa e envia para Loki

**Host Monitoring:**
- **Linux/WSL**: Node Exporter (porta 9100) → Prometheus
- **Windows**: Windows Exporter (porta 9182) → Prometheus

---

## 🔧 Componentes e Tecnologias

### Instrumentação por Linguagem

**API .NET (OpenTelemetry):**
- SDK: `OpenTelemetry.Extensions.Hosting`
- Exporters: `OpenTelemetry.Exporter.Prometheus.AspNetCore`
- Métricas automáticas: HTTP, ASP.NET Core, Runtime (.NET GC)
- Métricas customizadas: `Meter` + `Counter`
- Endpoint: `/metrics`

**API Python (OpenTelemetry):**
- SDK: `opentelemetry-sdk`
- Instrumentação: `opentelemetry-instrumentation-fastapi`
- Exporter: `opentelemetry-exporter-prometheus`
- Endpoint: `/metrics`

**API Java (Micrometer):**
- SDK: `micrometer-registry-prometheus` (Spring Boot Actuator)
- Métricas automáticas: HTTP, JVM, sistema
- Endpoint: `/actuator/prometheus`

**Next.js (prom-client):**
- Biblioteca: `prom-client`
- Métricas automáticas: HTTP, Node.js runtime
- Endpoint: `/api/metrics`

**Angular (Grafana Faro):**
- SDK: `@grafana/faro-web-sdk`
- Captura: Core Web Vitals (LCP, FID, CLS), erros JS, navegação
- Push para Alloy (porta 12347)

### Labels Importantes

**Loki:**
- `container`: nome do container Docker (ex: `dotnet-api`, `nginx`)
- `job`: identificador do serviço (ex: `nginx`, `node-exporter-linux`)
- `type`: tipo de log (ex: `access`, `error`) - usado no Nginx

**Prometheus:**
- `job`: nome do job configurado em `prometheus.yml`
- `instance`: endereço do target (ex: `dotnet-api:5000`)
- Métricas Windows: `job="node-exporter-windows"`
- Métricas Linux: `job="node-exporter-linux"`

---

## ⚠️ Problemas Conhecidos e Limitações

### WSL2 e Filesystem 9p

O **Node Exporter Linux** não consegue coletar métricas de disco no WSL2 devido ao filesystem tipo 9p (Plan 9 Protocol).

**Solução aplicada:**
- Dashboard Linux (`linux.json`) tem painel "Disk Usage" substituído por mensagem informativa
- Métricas de disco do Windows devem ser consultadas no dashboard Windows

**Configuração:**
```yaml
# docker-compose.yml - node-exporter-linux
command:
  - '--collector.filesystem.fs-types-exclude=^(autofs|...|9p)$$'
```

### Queries de CPU no WSL2

A função `rate()` pode retornar valores incorretos no WSL2. Use `irate()` para queries de CPU:

```promql
# ✅ Correto para WSL2
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="node-exporter-linux"}[5m])) * 100)

# ❌ Pode retornar valores > 100%
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### IIS Metrics

As métricas do IIS no dashboard Windows só retornarão dados se o IIS estiver instalado e rodando no host Windows. Sem IIS, os painéis ficarão vazios (comportamento esperado).

### Logs vs Métricas

- **Loki** usa labels diferentes de Prometheus:
  - Loki: `{container="dotnet-api"}` ou `{job="nginx"}`
  - Prometheus: `{job="dotnet-api"}` ou `{instance="dotnet-api:5000"}`

---

## 📊 Dashboards do Grafana

Todos os dashboards são provisionados automaticamente em `observability/grafana/provisioning/dashboards/json/`:

| Dashboard | Arquivo | Descrição |
|-----------|---------|-----------|
| APIs - Logs Consolidados | `apis-logs.json` | Logs de todas as APIs + Nginx |
| Multi-Language Overview | `multi-language-overview.json` | Visão geral de todas as APIs |
| .NET API | `dotnet-api.json` | Métricas específicas da API .NET |
| Python API | `python-api.json` | Métricas específicas da API Python |
| Java API | `java-api.json` | Métricas específicas da API Java |
| Next.js App | `nextjs-app.json` | Métricas específicas do Next.js |
| Angular App | `angular-app.json` | RUM e Core Web Vitals |
| Nginx | `nginx.json` | Métricas do Nginx |
| WSL - Monitoramento do Sistema | `linux.json` | Monitoramento do WSL (Linux rodando no Windows) |
| HOST Windows + IIS | `windows.json` | Monitoramento do host Windows físico + IIS |

### Modificar Dashboards

**Opção 1 - Via Grafana UI (temporário):**
1. Editar dashboard no Grafana
2. Exportar JSON (Share → Export → Save to file)
3. Copiar JSON para `observability/grafana/provisioning/dashboards/json/`
4. Reiniciar Grafana: `docker compose restart grafana`

**Opção 2 - Editar JSON diretamente (permanente):**
1. Editar arquivo `.json` em `observability/grafana/provisioning/dashboards/json/`
2. Reiniciar Grafana: `docker compose restart grafana`

**IMPORTANTE:**
- Dashboards provisionados não podem ser editados diretamente no Grafana UI
- Mudanças feitas na UI são perdidas ao reiniciar
- Sempre edite o JSON de origem

---

## 🐛 Troubleshooting

### Container não sobe

```bash
# Ver logs do container
docker logs <container-name>

# Verificar conflito de portas
docker compose ps
netstat -ano | findstr :<porta>  # Windows
lsof -i :<porta>  # Linux/macOS

# Rebuild forçado
docker compose down
docker compose up -d --build
```

### Métricas não aparecem no Prometheus

```bash
# 1. Verificar se target está UP
curl http://localhost:9090/targets

# 2. Verificar se aplicação está expondo métricas
curl http://localhost:5000/metrics

# 3. Verificar configuração do Prometheus
cat observability/prometheus/prometheus.yml

# 4. Restart do Prometheus
docker compose restart prometheus
```

### Logs não aparecem no Loki

```bash
# 1. Verificar logs do Alloy
docker logs alloy

# 2. Testar query no Grafana Explore
{container="dotnet-api"}

# 3. Verificar se container está gerando logs
docker logs dotnet-api

# 4. Restart do Alloy
docker compose restart alloy
```

### Dashboard vazio no Grafana

1. Verificar se datasources estão configurados (Connections → Data sources)
2. Verificar se Prometheus/Loki estão UP
3. Verificar queries no painel (Edit panel → Query inspector)
4. Verificar se há dados no time range selecionado

---

## 🔍 Convenções de Código

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(api): adicionar endpoint de estatísticas`
- `fix(docker): corrigir erro ao buildar Next.js`
- `docs(readme): adicionar troubleshooting`
- `refactor(metrics): extrair lógica para service`

### Dashboards

**Naming convention:**
- Arquivos: `<nome>-<tipo>.json` (ex: `dotnet-api.json`, `apis-logs.json`)
- Títulos: `[APP/SERVIÇO] - [Descrição]` (ex: `.NET API - Dashboard`, `APIs - Logs Consolidados`)
- UIDs: `<nome>-<tipo>-monitoring` (ex: `dotnet-api-monitoring`, `host-monitoring`)

**Estrutura de painéis:**
1. Primeira linha: Status, gauges, stats (altura 7-8)
2. Linhas seguintes: Time series, gráficos (altura 8)
3. Usar refresh: `10s` para dashboards de APIs
4. Usar time range: `now-30m` to `now` por padrão

### Docker

- Usar imagens Alpine quando possível
- Multi-stage builds para otimização
- `.dockerignore` em todos os projetos
- Health checks quando aplicável
- Restart policy: `unless-stopped` para serviços críticos

---

## 📚 Conceitos Importantes

### Os 3 Pilares da Observabilidade

1. **Métricas** - Números agregados (requisições/s, latência, CPU)
2. **Logs** - Eventos textuais (erros, requisições HTTP, stack traces)
3. **Traces** - Caminho de requisições entre serviços (não implementado neste lab)

### Pull vs Push

- **Prometheus** = Pull-based (faz scrape das aplicações)
- **Loki** = Push-based (Alloy envia logs para Loki)
- **Grafana Faro** = Push-based (SDK envia RUM para Alloy)

### PromQL Básico

```promql
# Counter - taxa de mudança
rate(metric_total[1m])

# Gauge - valor atual
metric_value

# Histogram - percentis
histogram_quantile(0.95, rate(metric_bucket[1m]))

# Agregação
sum by(job) (metric)
avg(metric)
max(metric) by (instance)
```

### LogQL Básico

```logql
# Filtro simples
{container="nginx"}

# Múltiplos labels
{job="nginx", type="access"}

# Busca de texto
{container="dotnet-api"} |= "error"

# Taxa de logs
rate({container="python-api"}[5m])
```

---

<!-- BACKLOG.MD GUIDELINES START -->
# Instructions for the usage of Backlog.md CLI Tool

## Backlog.md: Comprehensive Project Management Tool via CLI

### Assistant Objective

Efficiently manage all project tasks, status, and documentation using the Backlog.md CLI, ensuring all project metadata
remains fully synchronized and up-to-date.

### Core Capabilities

- ✅ **Task Management**: Create, edit, assign, prioritize, and track tasks with full metadata
- ✅ **Search**: Fuzzy search across tasks, documents, and decisions with `backlog search`
- ✅ **Acceptance Criteria**: Granular control with add/remove/check/uncheck by index
- ✅ **Board Visualization**: Terminal-based Kanban board (`backlog board`) and web UI (`backlog browser`)
- ✅ **Git Integration**: Automatic tracking of task states across branches
- ✅ **Dependencies**: Task relationships and subtask hierarchies
- ✅ **Documentation & Decisions**: Structured docs and architectural decision records
- ✅ **Export & Reporting**: Generate markdown reports and board snapshots
- ✅ **AI-Optimized**: `--plain` flag provides clean text output for AI processing

### Why This Matters to You (AI Agent)

1. **Comprehensive system** - Full project management capabilities through CLI
2. **The CLI is the interface** - All operations go through `backlog` commands
3. **Unified interaction model** - You can use CLI for both reading (`backlog task 1 --plain`) and writing (
   `backlog task edit 1`)
4. **Metadata stays synchronized** - The CLI handles all the complex relationships

### Key Understanding

- **Tasks** live in `backlog/tasks/` as `task-<id> - <title>.md` files
- **You interact via CLI only**: `backlog task create`, `backlog task edit`, etc.
- **Use `--plain` flag** for AI-friendly output when viewing/listing
- **Never bypass the CLI** - It handles Git, metadata, file naming, and relationships

---

# ⚠️ CRITICAL: NEVER EDIT TASK FILES DIRECTLY. Edit Only via CLI

**ALL task operations MUST use the Backlog.md CLI commands**

- ✅ **DO**: Use `backlog task edit` and other CLI commands
- ✅ **DO**: Use `backlog task create` to create new tasks
- ✅ **DO**: Use `backlog task edit <id> --check-ac <index>` to mark acceptance criteria
- ❌ **DON'T**: Edit markdown files directly
- ❌ **DON'T**: Manually change checkboxes in files
- ❌ **DON'T**: Add or modify text in task files without using CLI

**Why?** Direct file editing breaks metadata synchronization, Git tracking, and task relationships.

---

## 1. Source of Truth & File Structure

### 📖 **UNDERSTANDING** (What you'll see when reading)

- Markdown task files live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**)
- Files are named: `task-<id> - <title>.md` (e.g., `task-42 - Add GraphQL resolver.md`)
- Project documentation is in **`backlog/docs/`**
- Project decisions are in **`backlog/decisions/`**

### 🔧 **ACTING** (How to change things)

- **All task operations MUST use the Backlog.md CLI tool**
- This ensures metadata is correctly updated and the project stays in sync
- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output

---

## 2. Common Mistakes to Avoid

### ❌ **WRONG: Direct File Editing**

```markdown
# DON'T DO THIS:
1. Open backlog/tasks/task-7 - Feature.md in editor
2. Change "- [ ]" to "- [x]" manually
3. Add notes directly to the file
4. Save the file
```

### ✅ **CORRECT: Using CLI Commands**

```bash
# DO THIS INSTEAD:
backlog task edit 7 --check-ac 1  # Mark AC #1 as complete
backlog task edit 7 --notes "Implementation complete"  # Add notes
backlog task edit 7 -s "In Progress" -a @agent-k  # Change status and assign
```

---

## 3. Understanding Task Format (Read-Only Reference)

⚠️ **FORMAT REFERENCE ONLY** - Never edit task files directly! Use CLI commands.

### How to Modify Each Section

| What You Want to Change | CLI Command to Use |
|-------------------------|-------------------|
| Title | `backlog task edit 42 -t "New Title"` |
| Status | `backlog task edit 42 -s "In Progress"` |
| Assignee | `backlog task edit 42 -a @sara` |
| Labels | `backlog task edit 42 -l backend,api` |
| Description | `backlog task edit 42 -d "New description"` |
| Add AC | `backlog task edit 42 --ac "New criterion"` |
| Check AC #1 | `backlog task edit 42 --check-ac 1` |
| Uncheck AC #2 | `backlog task edit 42 --uncheck-ac 2` |
| Remove AC #3 | `backlog task edit 42 --remove-ac 3` |
| Add Plan | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add Notes | `backlog task edit 42 --notes "What I did"` |
| Append Notes | `backlog task edit 42 --append-notes "Another note"` |

---

## 4. Implementing Tasks Workflow

### Step 1: Start Work
```bash
# Assign yourself and set to In Progress
backlog task edit 42 -s "In Progress" -a @myself
```

### Step 2: Create Implementation Plan
```bash
# Think about HOW to solve the task
backlog task edit 42 --plan "1. Research\n2. Implement\n3. Test"
```

### Step 3: Share Plan with User
Share the plan and wait for approval before coding.

### Step 4: Implement
Write code, test, and mark acceptance criteria as complete:
```bash
backlog task edit 42 --check-ac 1 --check-ac 2
```

### Step 5: Add Implementation Notes
```bash
backlog task edit 42 --notes "Implemented using pattern X, modified files Y and Z"
```

### Step 6: Mark as Done
```bash
backlog task edit 42 -s Done
```

---

## 5. Quick Reference: Common Commands

```bash
# List tasks
backlog task list --plain
backlog task list -s "To Do" --plain

# View task
backlog task 42 --plain

# Search
backlog search "auth" --plain

# Create task
backlog task create "Task title" -d "Description" --ac "Criterion 1"

# Edit task
backlog task edit 42 -s "In Progress" -a @myself
backlog task edit 42 --check-ac 1
backlog task edit 42 --notes "Implementation complete"
```

---

## Remember: The Golden Rule

**🎯 If you want to change ANYTHING in a task, use `backlog task edit`**
**📖 Use CLI to read tasks, exceptionally READ task files directly, never WRITE to them**

Full help: `backlog --help`

<!-- BACKLOG.MD GUIDELINES END -->
