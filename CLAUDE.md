# CLAUDE.md

Este arquivo fornece orientações ao Claude Code ao trabalhar com código neste repositório.

---

## 🔬 Sobre o Projeto

Laboratório educacional de observabilidade com Stack Grafana (Prometheus, Loki, Alloy, Grafana, Tempo) instrumentando aplicações em 4 linguagens (.NET, Python, Java, TypeScript/Node.js).

**Stack:**
- **Observabilidade**: Grafana, Prometheus, Loki, Tempo 2.9.1, Alloy, Node/Windows/DB Exporters
- **Aplicações**: .NET API, Python FastAPI, Java Spring Boot, Next.js, Angular, Nginx
- **Bancos**: PostgreSQL (Python), SQL Server (.\NET), MySQL (Java)
- **Infraestrutura**: Docker Compose

---

## 🚀 Comandos Essenciais

### Docker & Desenvolvimento

```bash
# Subir/parar stack
docker compose up -d
docker compose down

# Rebuild específico
docker compose up -d --build <service-name>

# Ver logs
docker logs <container-name>
docker logs -f <container-name>  # follow

# Status
docker compose ps
```

### URLs Principais

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Tempo**: http://localhost:3200
- **.NET API**: http://localhost:5000
- **Python API**: http://localhost:8001
- **Java API**: http://localhost:8002
- **Next.js**: http://localhost:3001
- **Angular**: http://localhost:4200
- **Nginx**: http://localhost:8080
- **PostgreSQL**: localhost:5432 (labuser/labpass)
- **SQL Server**: localhost:1433 (sa/YourStrong!Passw0rd)
- **MySQL**: localhost:3306 (labuser/labpass)

### Gerar Tráfego para Testes

```bash
# .NET API
for i in {1..50}; do curl -s http://localhost:5000/api/products > /dev/null; done

# Python API
curl -X POST http://localhost:8001/items -H "Content-Type: application/json" -d '{"name":"Test","description":"Item","price":100}'

# Java API
curl -X POST http://localhost:8002/api/products -H "Content-Type: application/json" -d '{"name":"Mouse","price":250,"stock":10}'

# Traces (produtos com DB)
for i in {1..10}; do
  curl -s "http://localhost:5000/api/products?page=$((RANDOM % 10 + 1))&pageSize=5" > /dev/null
  sleep 0.2
done
```

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
lab-observabilidade/
├── apps/                          # Aplicações
│   ├── dotnet-api/               # .NET + OpenTelemetry
│   ├── python-api/               # Python + OpenTelemetry
│   ├── java-api/                 # Java + Micrometer
│   ├── nextjs-app/               # Next.js + prom-client
│   ├── angular-app/              # Angular + Faro SDK
│   └── nginx/
├── observability/
│   ├── prometheus/prometheus.yml
│   ├── loki/loki-config.yml
│   ├── alloy/config.alloy
│   ├── tempo/tempo-config.yml
│   ├── grafana/provisioning/
│   │   ├── datasources/
│   │   └── dashboards/json/      # Dashboards provisionados
│   ├── mysql-exporter/.my.cnf
│   └── alertmanager/alertmanager.yml
├── docker-compose.yml
└── docs/                          # Documentação adicional
```

### Fluxo de Dados

**Métricas (Pull):**
1. Apps expõem `/metrics` → Prometheus scrape (15s) → Grafana query

**Logs (Push):**
1. Apps geram logs → Alloy coleta → Loki armazena → Grafana query

**Traces (Push):**
1. Apps geram spans → Alloy OTLP → Tempo armazena → Grafana visualiza
2. Tempo gera service graph metrics → Prometheus (remote_write)

---

## 🔧 Instrumentação por Linguagem

### .NET API (OpenTelemetry)
- SDK: `OpenTelemetry.Extensions.Hosting`, `OpenTelemetry.Exporter.Prometheus.AspNetCore`
- Spans automáticos: HTTP, Entity Framework Core (SQL queries)
- Endpoint: `/metrics`
- Traces: OTLP para Alloy (porta 4317 gRPC)

### Python API (OpenTelemetry)
- SDK: `opentelemetry-sdk`, `opentelemetry-instrumentation-fastapi`
- Endpoint: `/metrics`

### Java API (Micrometer)
- SDK: `micrometer-registry-prometheus` (Spring Boot Actuator)
- Endpoint: `/actuator/prometheus`

### Next.js (prom-client)
- Biblioteca: `prom-client`
- Endpoint: `/api/metrics`

### Angular (Grafana Faro)
- SDK: `@grafana/faro-web-sdk`
- Push para Alloy (porta 12347)
- Captura: Core Web Vitals, erros JS, navegação

---

## 🔍 Distributed Tracing

### Grafana Tempo v2.9.1

**⚠️ CRÍTICO - Bug na v2.10.0:**
- Versão 2.10.0 tem bug onde `ingester` não inicializa em modo monolithic
- Erro: "InstancesCount <= 0"
- **Usar v2.9.1** (recomendada) ou 2.6.0, 2.7.x, 2.8.x

**Config Importante:**
- OTLP endpoints devem ser `0.0.0.0:4317` (não `127.0.0.1`)
- Prometheus precisa de `--web.enable-remote-write-receiver`
- Service graph requer `metrics_generator` com `remote_write` configurado

**Visualizar Traces:**
```traceql
# ⚠️ USAR resource.service.name (NÃO service.name)
{ resource.service.name="dotnet-api" }
{ resource.service.name="dotnet-api" && span.db.statement != nil }
{ resource.service.name="dotnet-api" && duration > 100ms }
```

### PostgreSQL com 1000 Produtos
- .NET API conecta ao PostgreSQL com dados pré-carregados
- Traces incluem SQL queries completas (Entity Framework Core)
- Endpoints: GET/POST/PUT/DELETE /api/products

---

## 🎯 Service Level Objectives (SLOs)

Todos os SLOs medidos em janela de **30 dias**:

| API | SLI | Target |
|-----|-----|--------|
| .NET/Python/Java | Availability | ≥ 99.9% (requisições 2xx) |
| .NET/Python/Java | Latency P95 | < 200ms |
| .NET/Python/Java | Error Rate | < 0.1% (requisições 5xx) |

**Dashboard:** `slo-dashboard.json`
- Current SLI values (stat panels com cores)
- Error Budget Remaining (gauge 0-100%)
- Burn Rate (1h) - velocidade de consumo do budget

**Interpretação Burn Rate:**
- 1.0 = OK (taxa esperada)
- 5.0 = ⚠️ Alerta (5x mais rápido)
- 10.0 = 🚨 Crítico (10x mais rápido)

**Doc completa:** `docs/slo.md`

---

## 🗄️ Database Monitoring (Resumo)

### PostgreSQL (porta 9187)
- Exporter: `quay.io/prometheuscommunity/postgres-exporter`
- Métricas principais: `pg_up`, `pg_stat_database_*`, `pg_stat_activity_count`
- Dashboard: `postgresql.json`

### SQL Server (porta 4000)
- Exporter: `awaragi/prometheus-mssql-exporter`
- Métricas principais: `mssql_up`, `mssql_buffer_cache_hit_ratio`, `mssql_connections`
- Dashboard: `mssql.json`

### MySQL (porta 9104)
- Exporter: `prom/mysqld-exporter`
- Config: `observability/mysql-exporter/.my.cnf`
- Métricas principais: `mysql_up`, `mysql_global_status_*`
- Dashboard: `mysql.json`

**Ver métricas:**
```bash
curl http://localhost:9187/metrics  # PostgreSQL
curl http://localhost:4000/metrics  # SQL Server
curl http://localhost:9104/metrics  # MySQL
```

---

## ⚠️ Problemas Conhecidos CRÍTICOS

### 1. WSL2 + Filesystem 9p
**Problema:** Node Exporter não coleta métricas de disco no WSL2 (filesystem 9p incompatível)

**Solução:**
- Métricas `node_filesystem_*` NÃO disponíveis no dashboard WSL
- Usar dashboard "HOST Windows + IIS" para métricas de disco
- Outras métricas (CPU, memória, rede) funcionam normalmente

**Config aplicada:**
```yaml
command:
  - '--collector.filesystem.fs-types-exclude=^(autofs|...|9p)$$'
```

### 2. Queries de CPU no WSL2
**Problema:** `rate()` retorna valores > 100% no WSL2

**Solução:** Usar `irate()` ao invés de `rate()`:
```promql
# ✅ Correto
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="node-exporter-linux"}[5m])) * 100)

# ❌ Pode retornar > 100%
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### 3. Grafana Tempo v2.10.0
**Problema:** Ingester não inicializa em modo monolithic

**Solução:** Usar v2.9.1 (recomendada) ou anteriores

### 4. Labels Diferentes (Loki vs Prometheus)
**Loki:** `{container="dotnet-api"}` ou `{job="nginx"}`
**Prometheus:** `{job="dotnet-api"}` ou `{instance="dotnet-api:5000"}`

---

## 📊 Dashboards Provisionados

Todos em `observability/grafana/provisioning/dashboards/json/`:

| Dashboard | Arquivo | Descrição |
|-----------|---------|-----------|
| Multi-Language Overview | `multi-language-overview.json` | Todas as APIs |
| APIs - Logs Consolidados | `apis-logs.json` | Logs centralizados |
| .NET/Python/Java/Next.js API | `{nome}-api.json` | Por aplicação |
| Angular RUM | `angular-app.json` | Real User Monitoring |
| PostgreSQL/MySQL/SQL Server | `performance-{db}.json` | Database monitoring |
| SLO Dashboard | `slo-dashboard.json` | Service Level Objectives |
| WSL/Windows | `linux.json`, `windows.json` | Host monitoring |
| Alertas | `alerts.json` | Dashboard de alertas |

**Modificar dashboards:**
1. Editar `.json` em `observability/grafana/provisioning/dashboards/json/`
2. Reiniciar Grafana: `docker compose restart grafana`
3. ⚠️ Mudanças na UI do Grafana são PERDIDAS ao reiniciar

---

## 🔍 Convenções

### Commits (Conventional Commits)
```
feat(api): adicionar endpoint de estatísticas
fix(docker): corrigir erro ao buildar Next.js
docs(readme): adicionar troubleshooting
refactor(metrics): extrair lógica para service
```

### Dashboards
**Naming:**
- Arquivos: `<nome>-<tipo>.json`
- Títulos: `[APP/SERVIÇO] - [Descrição]`
- UIDs: `<nome>-<tipo>-monitoring`

**Estrutura:**
1. Primeira linha: Status, gauges, stats (altura 7-8)
2. Linhas seguintes: Time series (altura 8)
3. Refresh: `10s` para APIs
4. Time range: `now-30m` to `now`

### Docker
- Usar Alpine quando possível
- Multi-stage builds
- `.dockerignore` em todos os projetos
- Health checks quando aplicável
- Restart policy: `unless-stopped` para serviços críticos

---

## 📚 Conceitos Importantes

### Queries Essenciais

**PromQL:**
```promql
# Requisições/s
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[1m])

# CPU Linux (usar irate no WSL2)
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="node-exporter-linux"}[5m])) * 100)
```

**LogQL:**
```logql
# Logs do container
{container="dotnet-api"}

# Busca texto
{container="dotnet-api"} |= "error"

# Taxa de logs
rate({container="python-api"}[5m])
```

**TraceQL:**
```traceql
# Service (usar resource.service.name)
{ resource.service.name="dotnet-api" }

# Com SQL queries
{ resource.service.name="dotnet-api" && span.db.statement != nil }

# Lentos ou com erro
{ resource.service.name="dotnet-api" && duration > 100ms }
{ resource.service.name="dotnet-api" && status = error }
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
