# 🔬 Laboratório de Observabilidade

> **Projeto educacional completo** sobre observabilidade moderna com Grafana, Prometheus, Loki, Alloy e OpenTelemetry em múltiplas linguagens.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mermaid](https://img.shields.io/badge/Mermaid-FF3670?style=flat&logo=mermaid&logoColor=white)](https://mermaid.js.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=grafana&logoColor=white)](https://grafana.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![.NET](https://img.shields.io/badge/.NET-512BD4?style=flat&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-3F51B5?style=flat&logo=opentelemetry&logoColor=white)](https://opentelemetry.io/)

---

## 📚 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Objetivos](#-objetivos)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Como Foi Construído](#-como-foi-construído)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Como Testar](#-como-testar)
- [Dashboards](#-dashboards)
- [Aprendizados](#-aprendizados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Métricas Coletadas](#-métricas-coletadas)
- [Logs Coletados](#-logs-coletados)
- [Próximos Passos](#-próximos-passos)
- [Referências](#-referências)

---

## 🎯 Sobre o Projeto

Este é um **laboratório completo de observabilidade** criado com propósito educacional para aprender e demonstrar conceitos modernos de monitoramento, logging e tracing de aplicações distribuídas.

O projeto implementa uma stack completa de observabilidade usando ferramentas open-source líderes de mercado (Grafana Stack) e demonstra como instrumentar aplicações em **4 linguagens diferentes** (.NET, Python, Java, Node.js) com **OpenTelemetry** e **Micrometer**.

### 🌟 Destaques

- ✅ **4 APIs em diferentes linguagens** instrumentadas para observabilidade
- ✅ **Frontend Next.js** moderno com métricas backend
- ✅ **Frontend Angular** com Real User Monitoring (Grafana Faro)
- ✅ **Stack Grafana completa** (Prometheus, Loki, Tempo, Alloy, Grafana, Faro)
- ✅ **Distributed Tracing** com Grafana Tempo e OpenTelemetry
- ✅ **3 Bancos de Dados** (PostgreSQL, SQL Server, MySQL) com exporters de métricas
- ✅ **Database Monitoring** completo com dashboards dedicados
- ✅ **OpenTelemetry** para padronização
- ✅ **Dashboards customizados** no Grafana
- ✅ **Docker Compose** para fácil execução
- ✅ **Métricas customizadas** em todas as aplicações
- ✅ **Coleta de logs** centralizada com Loki
- ✅ **Monitoramento de experiência do usuário** com Core Web Vitals
- ✅ **Service Graph** e correlação traces ↔ logs ↔ métricas

---

## 🎓 Objetivos

### Objetivos de Aprendizado

Este laboratório foi criado para ensinar:

1. **Fundamentos de Observabilidade**
   - Diferença entre métricas, logs e traces (os 3 pilares)
   - Quando usar cada tipo de telemetria
   - Como correlacionar dados de diferentes fontes

2. **Ferramentas da Stack Grafana**
   - Prometheus: coleta e armazenamento de métricas
   - Loki: agregação e consulta de logs
   - Alloy: agente universal de coleta
   - Grafana: visualização e dashboards

3. **Instrumentação de Aplicações**
   - OpenTelemetry em .NET, Python e Node.js
   - Micrometer em Spring Boot (Java)
   - Métricas automáticas vs customizadas
   - Exporters para aplicações legadas

4. **Queries e Análise**
   - PromQL: linguagem de consulta do Prometheus
   - LogQL: linguagem de consulta do Loki
   - Criação de dashboards informativos
   - Interpretação de métricas

5. **DevOps e Infraestrutura**
   - Containerização com Docker
   - Orquestração com Docker Compose
   - Redes entre containers
   - Configuração declarativa

### Objetivos Práticos

- Criar uma stack de observabilidade funcional do zero
- Instrumentar aplicações reais em múltiplas linguagens
- Visualizar métricas e logs em tempo real
- Entender como isso funciona em produção
- Ter uma base para implementar em projetos reais

---

## 🏗️ Arquitetura

```mermaid
graph TB
   subgraph Databases["BANCO DE DADOS"]
      MySql["MySQL"]
      Postgres["PostgreSQL"]
      MsSqlServer["SQL Server"]
   end

   subgraph ReverseProxy["PROXY REVERSO"]
      Nginx["Nginx"]
   end

   subgraph Frontends["APLICAÇÕES FRONTEND"]
      NextJS["Next.js App"]
      Angular["Angular App"]
   end

   subgraph Backends["APLICAÇÕES BACKEND"]
      DotNet[".NET API"]
      Python["Python API"]
      Java["Java API"]
   end

   subgraph Exporters["EXPORTERS"]
      NginxExp["Nginx Exporter"]
      NodeExp["Linux Exporter"]
      WinExp["Windows Exporter"]
      MySqlExp["MySQL Exporter"]
      PostgresExp["PostgreSQL Exporter"]
      MsSqlServerExp["SQL Server Exporter"]
   end

   subgraph Observability["OBSERVABILIDADE"]
      Prometheus["Prometheus<br/>(Métricas)"]
      Loki["Loki<br/>(Logs)"]
      Tempo["Tempo<br/>(Traces)"]
      Alloy["Grafana Alloy<br/>(Logs & Traces)"]
   end

   subgraph Visualization["VISUALIZAÇÃO"]
      Grafana["Grafana<br/>(Dashboards)"]
   end

   Frontends -->|API calls| Backends
   Backends -->|connect| Databases

   Databases -.->|scrape| Exporters

   Exporters -->|metrics| Prometheus
   Backends -->|metrics| Prometheus
   Frontends -->|metrics| Prometheus

   ReverseProxy -->|logs| Alloy
   Backends -->|logs| Alloy
   Frontends -->|logs| Alloy

   Backends -->|traces| Alloy

   Alloy -->|traces| Tempo

   Alloy -->|push logs| Loki
   Tempo -->|span metrics| Prometheus

   Prometheus -->|query| Grafana
   Loki -->|query| Grafana
   Tempo -->|query| Grafana

   style ReverseProxy fill:#5ac5fa
   style Backends fill:#c8e6c9
   style Frontends fill:#ffe0b2
   style Exporters fill:#d1c4e9
   style Observability fill:#f8bbd0
   style Visualization fill:#e8f5e9
   style Databases fill:#ffccbc
```

### Fluxo de Dados

**Métricas:**
1. Aplicações expõem endpoint `/metrics` (formato Prometheus)
2. Prometheus faz "scrape" (coleta) a cada 15 segundos
3. Métricas armazenadas como time-series no Prometheus
4. Grafana consulta Prometheus e exibe em dashboards

**Logs:**
1. Aplicações geram logs em arquivos ou stdout
2. Alloy monitora e coleta esses logs
3. Alloy adiciona labels e envia para Loki (push)
4. Logs indexados por labels no Loki
5. Grafana consulta Loki e exibe logs filtrados

**Frontend (Real User Monitoring):**
1. Angular app instrumentada com Faro SDK
2. SDK captura Core Web Vitals, erros, interações do usuário
3. Dados enviados para Alloy via HTTP (push na porta 12347)
4. Alloy processa e envia logs para Loki
5. Grafana exibe métricas de experiência do usuário

---

## 🛠️ Stack Tecnológica

### Observabilidade

| Ferramenta | Versão | Função | Porta |
|------------|--------|--------|-------|
| **Grafana** | latest | Visualização e dashboards | 3000 |
| **Prometheus** | latest | Coleta e armazenamento de métricas (+ remote write) | 9090 |
| **Loki** | latest | Agregação e consulta de logs | 3100 |
| **Grafana Tempo** | 2.9.1 | Backend para distributed tracing | 3200 |
| **Grafana Alloy** | latest | Agente universal de coleta (logs + RUM + traces) | 12345, 12347, 4317/4318 |
| **nginx-exporter** | latest | Exporter de métricas do Nginx | 9113 |
| **Node Exporter** | latest | Métricas do host Linux/WSL | 9100 |
| **Windows Exporter** | latest | Métricas do host Windows + IIS | 9182 |

### Aplicações

| Aplicação | Tecnologia | Versão | Porta | Instrumentação |
|-----------|------------|--------|-------|----------------|
| **dotnet-api** | C# / .NET | 10.0 | 5000 | OpenTelemetry |
| **python-api** | Python / FastAPI | 3.12 | 8001 | OpenTelemetry |
| **java-api** | Java / Spring Boot | 21 | 8002 | Micrometer |
| **nextjs-app** | TypeScript / Next.js | 14 | 3001 | prom-client |
| **angular-app** | TypeScript / Angular | 18 | 4200 | Grafana Faro SDK |
| **nginx** | Nginx | latest | 8080 | stub_status |

### Banco de Dados

| Serviço | Tecnologia | Versão | Porta | Aplicação | Exporter |
|---------|------------|--------|-------|-----------|----------|
| **PostgreSQL** | PostgreSQL | latest | 5432 | Python API | PostgreSQL Exporter (9187) |
| **SQL Server** | MS SQL Server | 2019 | 1433 | .NET API | MSSQL Exporter (4000) |
| **MySQL** | MySQL | latest | 3306 | Java API | MySQL Exporter (9104) |
| **pgAdmin** | pgAdmin 4 | latest | 5050 | Gerenciamento PostgreSQL | - |

### Infraestrutura

- **Docker** & **Docker Compose** - Containerização e orquestração
- **Alpine Linux** - Imagens base otimizadas

---

## 📖 Como Foi Construído

Este laboratório foi construído de forma **incremental** em 7 fases, cada uma com objetivos específicos de aprendizado:

### **Fase 1: Fundação - Grafana + Prometheus**
- Configuração inicial da stack
- Conexão entre Grafana e Prometheus
- Primeiro datasource
- Queries básicas em PromQL
- Conceito de targets e scrape

### **Fase 2: Logs - Nginx + Alloy + Loki**
- Instalação e configuração do Loki
- Configuração do Alloy para coleta de logs
- Leitura de arquivos de log do Nginx
- Queries em LogQL
- Diferença entre métricas e logs

### **Fase 3: Métricas - Nginx Exporter**
- Conceito de exporters
- nginx-prometheus-exporter
- Coleta de métricas de aplicações legadas
- Primeiro dashboard no Grafana
- Visualizações (Stat, Time series)

### **Fase 4: API .NET com OpenTelemetry**
- Instrumentação de aplicação .NET
- OpenTelemetry SDK
- Métricas automáticas (HTTP, Runtime, ASP.NET Core)
- Métricas customizadas com Meter e Counter
- Dockerização da aplicação
- Dashboard da API

### **Fase 5: API Python com FastAPI**
- Instrumentação Python/FastAPI
- OpenTelemetry em Python
- API REST com CRUD
- Métricas customizadas
- Comparação .NET vs Python

### **Fase 6: API Java com Spring Boot**
- Instrumentação Java/Spring Boot
- Micrometer (alternativa ao OpenTelemetry)
- Spring Boot Actuator
- Métricas de JVM
- Comparação entre frameworks

### **Fase 7: Frontend Next.js**
- Aplicação frontend moderna
- API routes com métricas
- Server-side instrumentation
- Interface visual para teste
- Stack completa (frontend + backend + observabilidade)

### **Fase 8: Angular + Grafana Faro (Real User Monitoring)**
- Observabilidade de frontend (RUM)
- Grafana Faro SDK para Angular
- Core Web Vitals (LCP, FID, CLS)
- Rastreamento de erros JavaScript
- Métricas de latência de API
- Alloy com receiver Faro para coletar dados do frontend
- Monitoramento de experiência do usuário real

---

## 📋 Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- **4GB RAM** disponível (mínimo)
- **10GB** de espaço em disco

### Instalação dos Pré-requisitos

**Linux/WSL:**
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose (já incluído no Docker moderno)
docker compose version
```

**Windows:**
- Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop)

**macOS:**
- Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 🚀 Como Executar

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd lab-observabilidade
```

### 2. Subir a Stack

```bash
# Subir todos os containers
docker compose up -d

# Verificar se todos estão rodando
docker compose ps
```

### 3. Configuração Automática

O Grafana está configurado com **provisioning automático**, o que significa que ao subir, ele já cria automaticamente:

✅ **Datasources:**
- Prometheus (métricas)
- Loki (logs)

✅ **Dashboards (10 dashboards provisionados automaticamente):**
- Multi-Language Overview (visão geral de todas as APIs)
- APIs - Logs Consolidados (logs de todas as APIs + Nginx)
- .NET API Dashboard (métricas específicas da API .NET)
- Python API Dashboard (métricas específicas da API Python)
- Java API Dashboard (métricas específicas da API Java)
- Next.js App Dashboard (métricas específicas do Next.js)
- Angular App - RUM (Real User Monitoring do frontend)
- Nginx Dashboard (métricas e logs do Nginx)
- WSL - Monitoramento do Sistema (métricas do Linux/WSL)
- HOST Windows + IIS (métricas do host Windows físico)

**Não é necessário configurar manualmente!** Basta acessar o Grafana e os dashboards já estarão prontos.

**Você deve ver 12 containers:**
- ✅ nginx
- ✅ nginx-exporter
- ✅ dotnet-api
- ✅ python-api
- ✅ java-api
- ✅ nextjs-app
- ✅ angular-app
- ✅ prometheus
- ✅ loki
- ✅ alloy (logs + RUM)
- ✅ grafana
- ✅ node-exporter-linux (métricas do host WSL)

### 3. Acessar as Interfaces

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | - |
| **Next.js App** | http://localhost:3001 | - |
| **Angular App** | http://localhost:4200 | - |
| **.NET API** | http://localhost:5000/weatherforecast | - |
| **Python API** | http://localhost:8001/docs | - |
| **Java API** | http://localhost:8002/actuator/health | - |
| **Nginx** | http://localhost:8080 | - |

### 4. Configurar Datasources no Grafana

No primeiro acesso ao Grafana:

1. Login com `admin` / `admin`
2. Ir em **Connections** → **Data sources**
3. Adicionar **Prometheus**:
   - URL: `http://prometheus:9090`
   - Clicar em **Save & Test**
4. Adicionar **Loki**:
   - URL: `http://loki:3100`
   - Clicar em **Save & Test**

---

## 🧪 Como Testar

### 1. Verificar Targets no Prometheus

```bash
# Via browser
http://localhost:9090/targets

# Ou via curl
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].labels'
```

**Você deve ver 6 targets UP:**
- prometheus
- nginx
- dotnet-api
- python-api
- java-api
- nextjs-app

### 2. Gerar Tráfego nas APIs

**API .NET:**
```bash
# Gerar 50 requisições
for i in {1..50}; do
  curl -s http://localhost:5000/weatherforecast > /dev/null
  echo "Request $i"
done
```

**API Python:**
```bash
# Criar items
curl -X POST http://localhost:8001/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Dell XPS","price":5000}'

# Listar items
curl http://localhost:8001/items
```

**API Java:**
```bash
# Criar produto
curl -X POST http://localhost:8002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse","description":"Logitech MX","price":250,"stock":10}'

# Listar produtos
curl http://localhost:8002/api/products
```

**Next.js:**
```bash
# Criar tarefa
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudar OpenTelemetry"}'

# Listar tarefas
curl http://localhost:3001/api/tasks
```

### 3. Testes de Carga com k6

**Para testes mais realistas e avançados**, use o **k6** para simular múltiplos usuários simultâneos e medir performance sob carga.

📦 **Instalação:**
```bash
# Windows
choco install k6

# Linux/WSL
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6
```

🎯 **Executar testes:**
```bash
# Teste individual por API
k6 run tests/k6/test-dotnet-api.js
k6 run tests/k6/test-python-api.js
k6 run tests/k6/test-java-api.js
k6 run tests/k6/test-nextjs-app.js

# Teste de todos os serviços simultaneamente
k6 run tests/k6/test-all-services.js

# Cenários avançados (carga constante, rampa, spike)
k6 run tests/k6/load-test-scenarios.js

# Stress test customizado (50 VUs por 2 minutos)
k6 run --vus 50 --duration 2m tests/k6/test-dotnet-api.js
```

💡 **Dica:** Abra o Grafana antes de executar os testes para ver as métricas em tempo real!

📚 **Documentação completa:** [`tests/k6/README.md`](tests/k6/README.md)

### 4. Consultar Métricas no Grafana

**No Grafana → Explore → Prometheus:**

```promql
# Requisições por segundo - .NET
rate(http_server_request_duration_seconds_count{job="dotnet-api"}[1m])

# Total de previsões geradas - .NET
weather_forecast_generated_total

# Items criados - Python
items_created_total

# Produtos criados - Java
products_created_total

# Tarefas criadas - Next.js
tasks_created_total

# Latência P95 - todas as APIs
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket[1m]))
```

### 5. Consultar Logs no Grafana

**No Grafana → Explore → Loki:**

```logql
# Todos os logs do Nginx
{job="nginx"}

# Apenas logs de acesso
{job="nginx", type="access"}

# Logs com erro 404
{job="nginx", type="access"} |= "404"

# Taxa de logs por segundo
rate({job="nginx"}[1m])
```

### 5. Ver Métricas Diretas

```bash
# Métricas da API .NET
curl http://localhost:5000/metrics | grep weather

# Métricas da API Python
curl http://localhost:8001/metrics | grep items

# Métricas da API Java
curl http://localhost:8002/actuator/prometheus | grep products

# Métricas do Next.js
curl http://localhost:3001/api/metrics | grep tasks
```

---

## 📊 Dashboards

### Dashboards Provisionados Automaticamente

O Grafana está configurado com **provisioning automático** de 10 dashboards completos:

#### 1. **Multi-Language Overview**
   - Visão geral de todas as APIs
   - Comparação de requisições/s por linguagem
   - Latência comparativa
   - Uso de recursos

#### 2. **APIs - Logs Consolidados**
   - Logs de todas as APIs + Nginx
   - Taxa de logs por serviço
   - Filtros por container/job
   - Busca em tempo real

#### 3. **API .NET Dashboard**
   - Status da API
   - Total de previsões geradas
   - Requisições por segundo
   - Latência (P50, P95, P99)
   - Uso de memória GC

#### 4. **API Python Dashboard**
   - Métricas HTTP
   - Items/Users criados
   - Performance de endpoints
   - Métricas de processo

#### 5. **API Java Dashboard**
   - Métricas HTTP
   - Produtos/Pedidos criados
   - Métricas JVM (memória, threads, GC)
   - Métricas de sistema

#### 6. **Next.js App Dashboard**
   - Métricas HTTP das API routes
   - Tarefas criadas/completadas
   - Métricas do Node.js runtime
   - Performance do servidor

#### 7. **Angular App - Real User Monitoring (RUM)**
   - Core Web Vitals (LCP, FID, CLS)
   - Erros JavaScript
   - Navegação e performance
   - Experiência do usuário real

#### 8. **Nginx Dashboard**
   - Conexões ativas
   - Requisições por segundo
   - Total de requisições
   - Status do Nginx
   - Logs de acesso e erro

#### 9. **WSL - Monitoramento do Sistema**
   - CPU, Memória, Load do WSL
   - Network Traffic
   - Disk I/O
   - ⚠️ Métricas de disco não disponíveis (limitação WSL2 + filesystem 9p)

#### 10. **HOST Windows + IIS - Monitoramento**
   - CPU, Memória, Disco do Windows
   - Processos e status do sistema
   - Métricas do IIS (se instalado)
   - Network Traffic

### Como Criar um Dashboard

1. **Grafana** → ➕ **Dashboard** → **Add visualization**
2. Selecionar datasource (**Prometheus**)
3. Adicionar query (ex: `rate(http_server_request_duration_seconds_count[1m])`)
4. Configurar visualização (Time series, Stat, Gauge, etc.)
5. Dar nome ao painel e clicar em **Apply**
6. Salvar o dashboard

---

## 💡 Aprendizados

### Principais Conceitos Aprendidos

#### 1. Os 3 Pilares da Observabilidade

| Pilar | O que é | Quando usar |
|-------|---------|-------------|
| **Métricas** | Números agregados | Monitoramento, alertas, tendências |
| **Logs** | Eventos textuais | Debug, investigação, auditoria |
| **Traces** | Caminho de requisição | Performance, debugging distribuído |

#### 2. Métricas vs Logs

**Métricas** = "O que está acontecendo?"
- Quantas requisições/s?
- Qual a latência?
- CPU em 80%?

**Logs** = "Por que aconteceu?"
- Stack trace do erro
- Payload da requisição
- Sequência de eventos

#### 3. OpenTelemetry

**Padrão unificado** para observabilidade:
- Uma biblioteca para métricas, logs e traces
- Funciona com qualquer backend
- Instrumentação automática + manual
- Suporte para todas as linguagens principais

#### 4. Prometheus

- **Pull-based**: Prometheus busca métricas (scrape)
- **Time-series database**: otimizado para séries temporais
- **PromQL**: linguagem de consulta poderosa
- **Labels**: dimensões para filtrar métricas

#### 5. Exporters

Ponte entre aplicações legadas e Prometheus:
- nginx-exporter
- postgres-exporter
- redis-exporter
- etc.

---

## 📁 Estrutura do Projeto

```
lab-observabilidade/
├── apps/                          # Aplicações
│   ├── dotnet-api/               # API C# .NET
│   │   ├── Program.cs
│   │   ├── dotnet-api.csproj
│   │   └── Dockerfile
│   ├── python-api/               # API Python FastAPI
│   │   ├── main.py
│   │   ├── observability.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── java-api/                 # API Java Spring Boot
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   ├── nextjs-app/               # App Next.js
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── angular-app/              # App Angular (RUM)
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.ts
│       │   │   └── faro.config.ts
│       │   ├── main.ts
│       │   └── styles.css
│       ├── package.json
│       ├── angular.json
│       ├── nginx.conf
│       └── Dockerfile
├── observability/                # Stack de observabilidade
│   ├── prometheus/
│   │   └── prometheus.yml        # Config do Prometheus
│   ├── loki/
│   │   └── loki-config.yml       # Config do Loki
│   ├── alloy/
│   │   └── config.alloy          # Config do Alloy (logs + RUM)
│   ├── grafana/
│   │   └── provisioning/         # Provisioning automático
│   │       ├── datasources/
│   │       │   └── datasources.yml
│   │       └── dashboards/
│   │           ├── dashboards.yml
│   │           └── json/
│   │               ├── overview.json
│   │               ├── angular-rum.json
│   │               └── nginx-logs.json
│   ├── grafana/                  # Dashboards (provisioning)
│   └── nginx/
│       ├── nginx.conf            # Config do Nginx
│       ├── html/                 # HTML estático
│       └── logs/                 # Logs do Nginx
├── docker-compose.yml            # Orquestração
├── .gitignore
└── README.md
```

---

## 📈 Métricas Coletadas

### Métricas Automáticas

**API .NET (OpenTelemetry):**
- `http_server_request_duration_seconds` - Latência de requisições
- `process_runtime_dotnet_gc_*` - Garbage Collector
- `process_runtime_dotnet_*` - Runtime do .NET

**API Python (OpenTelemetry):**
- `http_server_request_duration_seconds` - Latência
- `process_*` - Métricas de processo

**API Java (Micrometer):**
- `http_server_requests` - Requisições HTTP
- `jvm_*` - JVM (memória, threads, GC)
- `system_*` - Sistema (CPU, disco)

**Next.js (prom-client):**
- `http_*` - Métricas HTTP automáticas
- `nodejs_*` - Métricas do Node.js

### Métricas Customizadas

**API .NET:**
- `weather_forecast_generated_total` - Total de previsões geradas

**API Python:**
- `items_created_total` - Items criados
- `users_created_total` - Usuários criados
- `items_deleted_total` - Items deletados

**API Java:**
- `products_created_total` - Produtos criados
- `products_deleted_total` - Produtos deletados
- `orders_created_total` - Pedidos criados
- `orders_completed_total` - Pedidos concluídos
- `orders_active` - Pedidos ativos (Gauge)

**Next.js:**
- `tasks_created_total` - Tarefas criadas
- `tasks_completed_total` - Tarefas concluídas
- `tasks_active` - Tarefas ativas (Gauge)
- `api_requests_total` - Requisições à API

### Métricas de Host (Infraestrutura)

**Node Exporter (Linux/WSL):**
- `node_cpu_seconds_total` - Uso de CPU por core e modo
- `node_memory_*` - Memória (total, disponível, buffers, cache)
- `node_load1`, `node_load5`, `node_load15` - Load average do sistema
- `node_network_*` - Tráfego de rede (bytes enviados/recebidos)
- `node_disk_*` - I/O de disco (reads, writes)
- ⚠️ `node_filesystem_*` - **Não disponível no WSL2** (limitação do filesystem 9p)

**Windows Exporter (Host Windows):**
- `windows_cpu_*` - Uso de CPU, clock, interrupts
- `windows_memory_*` - Memória física, cache, swap
- `windows_logical_disk_*` - Uso de disco por volume
- `windows_net_*` - Tráfego de rede
- `windows_system_*` - Processos, threads, uptime
- `windows_iis_*` - Métricas do IIS (se instalado): conexões, requests, pools

---

## 📝 Logs Coletados

### Nginx
- **access.log** - Requisições HTTP
- **error.log** - Erros do servidor

**Labels:**
- `job="nginx"`
- `type="access"` ou `type="error"`

### Coleta
- **Alloy** monitora arquivos de log
- Adiciona labels automaticamente
- Envia para Loki via HTTP

---

## 🔍 Distributed Tracing

### Grafana Tempo v2.9.1

Este laboratório implementa **Distributed Tracing** completo usando **Grafana Tempo** para rastrear requisições end-to-end através da stack.

**⚠️ IMPORTANTE - Bug na versão 2.10.0:**
A versão 2.10.0 do Tempo tem um bug conhecido onde o módulo `ingester` não é inicializado em modo monolithic, causando erro "InstancesCount <= 0". **Use a versão 2.9.1** (recomendada) ou anteriores (2.6.0, 2.7.x, 2.8.x).

### O que é Tracing?

**Distributed Tracing** é o terceiro pilar da observabilidade que permite:
- 🔎 Rastrear o caminho completo de uma requisição
- ⏱️ Medir latências de cada operação (HTTP, SQL, etc.)
- 🐛 Identificar gargalos de performance
- 🔗 Correlacionar com logs e métricas
- 📊 Visualizar dependências entre serviços

### Fluxo de Traces

```
API .NET → OpenTelemetry → Alloy (OTLP) → Tempo → Grafana
  ↓
PostgreSQL
  ↓
SQL Queries capturadas nos spans
```

**Componentes:**
1. **API .NET** - Gera traces com OpenTelemetry SDK
2. **OpenTelemetry** - Instrumenta HTTP requests e Entity Framework Core (SQL)
3. **Alloy** - Recebe traces via OTLP (portas 4317 gRPC / 4318 HTTP)
4. **Tempo** - Armazena traces e gera métricas (service graphs)
5. **Prometheus** - Recebe métricas do Tempo via remote write
6. **Grafana** - Visualiza traces, service graph, correlações

### Traces Capturados

A API .NET gera traces automáticos para:
- ✅ **HTTP Requests** - Duração de cada endpoint
- ✅ **SQL Queries** - Queries do Entity Framework Core com statement completo
- ✅ **HTTP Client** - Chamadas HTTP externas
- ✅ **Exceções** - Stack traces de erros

**Exemplo de trace:**
```
GET /api/products/42 (150ms)
  ├─ HTTP Request (150ms)
  │   └─ Entity Framework Core (45ms)
  │       └─ SQL Query: SELECT * FROM Products WHERE Id = 42 (45ms)
```

### PostgreSQL + 1000 Produtos

O lab inclui PostgreSQL 18-alpine com **1000 produtos** pré-carregados para criar traces realistas:
- 📦 1000 produtos em 10 categorias
- 🔍 Queries variadas (SELECT, INSERT, UPDATE, DELETE)
- 📊 Traces com SQL statements completos
- ⚡ Performance realista de banco de dados

**Endpoints instrumentados:**
- `GET /api/products` - Lista paginada
- `GET /api/products/{id}` - Busca por ID
- `POST /api/products` - Criar produto
- `PUT /api/products/{id}` - Atualizar produto
- `DELETE /api/products/{id}` - Deletar produto
- `GET /api/products/count` - Contar produtos

### Como Visualizar Traces

**1. Grafana Explore:**
```
http://localhost:3000/explore → Selecionar "Tempo"
```

**2. Search (interface visual):**
- Service Name: `dotnet-api`
- Filtrar por tags, duração, status

**3. TraceQL (queries avançadas):**
```traceql
# ⚠️ IMPORTANTE: Usar resource.service.name (não service.name)
{ resource.service.name="dotnet-api" }

# Traces com SQL queries
{ resource.service.name="dotnet-api" && span.db.statement != nil }

# Traces lentos (> 100ms)
{ resource.service.name="dotnet-api" && duration > 100ms }

# Traces com erro
{ resource.service.name="dotnet-api" && status = error }
```

**4. Service Graph:**
- Visualização do fluxo de requisições
- Taxa de req/s, latência, erros
- Requer Prometheus com `--web.enable-remote-write-receiver`

**5. Correlação com Logs:**
- Clicar em um span no trace
- Grafana busca logs relacionados automaticamente
- Correlação via tags (container, service)

### Gerar Traces

```bash
# GET produtos (queries SQL variadas)
for i in {1..10}; do
  curl -s "http://localhost:5000/api/products?page=$((RANDOM % 10 + 1))&pageSize=5" > /dev/null
  sleep 0.2
done

# GET por ID (query SQL específica)
for i in {1..10}; do
  curl -s "http://localhost:5000/api/products/$((RANDOM % 1000 + 1))" > /dev/null
  sleep 0.2
done

# Criar produto (INSERT)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Produto","description":"Teste","price":99.99,"stock":10}'
```

Depois acesse o Grafana Explore → Tempo e visualize os traces!

### Métricas de Service Graphs

O Tempo gera automaticamente métricas sobre os traces:
- `traces_service_graph_request_total` - Total de requisições entre serviços
- `traces_service_graph_request_failed_total` - Requisições com falha
- `traces_service_graph_request_server_seconds` - Latência server-side
- `traces_service_graph_request_client_seconds` - Latência client-side

Essas métricas são enviadas ao Prometheus via remote write e usadas pelo Service Graph.

---

## ⚠️ Limitações Conhecidas

### WSL2 e Filesystem 9p

O **Node Exporter** no WSL2 não consegue coletar métricas de disco devido a uma incompatibilidade com o filesystem tipo **9p** (Plan 9 Protocol) usado pelo WSL2 para montar o sistema de arquivos do Windows.

**Impacto:**
- Métricas `node_filesystem_*` não estão disponíveis no dashboard WSL
- O painel "Disk Usage" foi substituído por uma mensagem informativa
- Outras métricas (CPU, memória, rede, I/O) funcionam normalmente

**Solução:**
- Para monitorar uso de disco, utilize o **dashboard "HOST Windows + IIS"**
- O Windows Exporter coleta todas as métricas de disco corretamente

**Detalhes técnicos:**
- Erro no Node Exporter: `"error parsing file: couldn't find separator in expected field: 9p"`
- Configuração aplicada: `--collector.filesystem.fs-types-exclude=^(...|9p)$`

### Queries de CPU no WSL2

A função `rate()` do PromQL pode retornar valores incorretos (>100%) para métricas de CPU no WSL2.

**Solução aplicada:**
- Dashboards usam `irate()` ao invés de `rate()` para queries de CPU
- Query correta: `100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`

### Métricas do IIS

O dashboard "HOST Windows + IIS" inclui painéis para métricas do **Internet Information Services (IIS)**, mas essas métricas só retornarão dados se o IIS estiver instalado e rodando no Windows.

**Comportamento esperado:**
- Sem IIS: Painéis de IIS ficarão vazios
- Com IIS: Métricas completas de conexões, requests, pools, etc.

---

## 🚀 Próximos Passos

> 📋 **Nota**: Todas as melhorias listadas abaixo foram adicionadas ao backlog do projeto como tarefas detalhadas. Para ver as tarefas completas com acceptance criteria, use: `backlog task list --plain`

### Melhorias Possíveis

1. **Traces Distribuídos**
   - Adicionar Grafana Tempo
   - Implementar tracing entre APIs
   - Visualizar spans e latências

2. **Alertas**
   - Configurar Alertmanager
   - Criar regras de alerta
   - Integrar com Slack/Email

3. **Service Level Objectives (SLOs)**
   - Definir SLIs e SLOs
   - Dashboards de SLO
   - Error budget

4. **Logs Estruturados**
   - Implementar logging estruturado (JSON)
   - Adicionar trace IDs nos logs
   - Correlação logs ↔ métricas

5. **Persistência**
   - Provisionar dashboards automaticamente
   - Configurar datasources via código
   - GitOps para observabilidade

6. **Mais Aplicações**
   - Banco de dados (PostgreSQL + exporter)
   - Cache (Redis + exporter)
   - Message broker (RabbitMQ + exporter)

7. **Kubernetes**
   - Migrar para Kubernetes
   - Service mesh (Istio/Linkerd)
   - Observabilidade distribuída

---

## 📚 Referências

### Documentação Oficial

- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [Loki](https://grafana.com/docs/loki/)
- [Grafana Alloy](https://grafana.com/docs/alloy/)
- [OpenTelemetry](https://opentelemetry.io/docs/)
- [Micrometer](https://micrometer.io/docs/)

### Tutoriais e Guias

- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Tutorial](https://grafana.com/docs/loki/latest/logql/)
- [OpenTelemetry .NET](https://opentelemetry.io/docs/instrumentation/net/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

### Livros Recomendados

- **"Observability Engineering"** - Charity Majors, Liz Fong-Jones, George Miranda
- **"Prometheus: Up & Running"** - Brian Brazil
- **"Distributed Tracing in Practice"** - Austin Parker, et al.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 🎉

Para contribuir com este projeto, por favor leia o **[Guia de Contribuição](CONTRIBUTING.md)** que contém:

- 📋 Como reportar bugs
- ✨ Como sugerir melhorias
- 💻 Padrões de código
- 📝 Padrões de commit
- 🔀 Processo de Pull Request

**Formas de contribuir:**
- 🐛 Reportar bugs
- ✨ Sugerir melhorias
- 💻 Adicionar mais exemplos
- 📝 Melhorar a documentação
- 🎨 Criar novos dashboards
- 🧪 Adicionar testes

---

## 📄 Licença

Este projeto é open-source e está disponível sob a licença MIT.

---

## 👤 Autor

**Raphael Augusto Ferroni Cardoso**

[![GitHub](https://img.shields.io/badge/GitHub-ferronicardoso-181717?style=flat&logo=github)](https://github.com/ferronicardoso)

Criado como projeto educacional para aprendizado de observabilidade moderna com stack Grafana, Prometheus, Loki e OpenTelemetry.

---

## 🎓 Conclusão

Este laboratório demonstra uma stack completa de observabilidade moderna, seguindo **best practices** da indústria. É um excelente ponto de partida para:

- Aprender conceitos de observabilidade
- Implementar observabilidade em projetos reais
- Estudar para certificações (CKA, CKAD, etc.)
- Portfólio técnico
- Base para projetos profissionais

**Happy Observing!** 🔍📊📈
