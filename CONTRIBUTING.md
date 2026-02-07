# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Lab de Observabilidade**! Este documento fornece diretrizes para ajudar você a contribuir de forma efetiva.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Melhorias](#sugerir-melhorias)

---

## 📜 Código de Conduta

Este projeto adota um código de conduta para garantir um ambiente acolhedor e inclusivo para todos os contribuidores. Ao participar, você concorda em:

- ✅ Ser respeitoso e inclusivo
- ✅ Aceitar críticas construtivas
- ✅ Focar no que é melhor para a comunidade
- ✅ Mostrar empatia com outros membros da comunidade

Comportamentos inaceitáveis incluem:
- ❌ Uso de linguagem ou imagens sexualizadas
- ❌ Comentários insultuosos ou depreciativos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas de outros sem permissão

---

## 🎯 Como Posso Contribuir?

Existem várias formas de contribuir com este projeto:

### 1. 🐛 Reportar Bugs

Se você encontrou um bug, por favor:
- Verifique se já não existe uma issue sobre o problema
- Abra uma nova issue com detalhes claros
- Use o template de bug report
- Inclua logs, screenshots e passos para reproduzir

### 2. ✨ Sugerir Novas Features

Tem uma ideia? Ótimo!
- Abra uma issue descrevendo sua sugestão
- Explique o caso de uso
- Discuta possíveis implementações
- Aguarde feedback antes de começar a desenvolver

### 3. 📝 Melhorar Documentação

Documentação nunca é demais:
- Corrigir erros de digitação
- Melhorar explicações
- Adicionar exemplos
- Traduzir para outros idiomas
- Criar tutoriais

### 4. 💻 Contribuir com Código

Contribuições de código são muito bem-vindas:
- Corrigir bugs
- Implementar novas features
- Otimizar performance
- Adicionar testes
- Refatorar código

### 5. 🎨 Melhorar UI/UX

- Melhorar dashboards do Grafana
- Otimizar visualizações
- Adicionar novos painéis
- Melhorar interface do Next.js

### 6. 🧪 Adicionar Exemplos

- Novos exemplos de aplicações
- Outras linguagens de programação
- Diferentes frameworks
- Casos de uso específicos

---

## 🔧 Processo de Desenvolvimento

### 1. Fork do Repositório

```bash
# Fork via GitHub UI, depois clone seu fork
git clone https://github.com/SEU-USUARIO/lab-observabilidade.git
cd lab-observabilidade
```

### 2. Configurar Upstream

```bash
git remote add upstream https://github.com/ferronicardoso/lab-observabilidade.git
git fetch upstream
```

### 3. Criar Branch

```bash
# Sempre crie uma branch a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/nome-da-feature
```

**Convenção de nomenclatura de branches:**
- `feature/nome-da-feature` - Nova funcionalidade
- `fix/descricao-do-bug` - Correção de bug
- `docs/descricao` - Alterações em documentação
- `refactor/descricao` - Refatoração de código
- `test/descricao` - Adição ou modificação de testes

### 4. Fazer Suas Alterações

```bash
# Edite os arquivos necessários
# Teste suas alterações localmente
docker compose up -d
```

### 5. Testar

Certifique-se de que:
- ✅ Todos os containers sobem corretamente
- ✅ Não há erros no console
- ✅ As métricas estão sendo coletadas
- ✅ Os dashboards funcionam
- ✅ A documentação está atualizada

### 6. Commit

```bash
git add .
git commit -m "tipo(escopo): descrição breve"
```

### 7. Push

```bash
git push origin feature/nome-da-feature
```

### 8. Abrir Pull Request

Abra um PR no GitHub com:
- Título claro e descritivo
- Descrição detalhada das mudanças
- Screenshots (se aplicável)
- Referência a issues relacionadas
- Checklist de validação

---

## 📏 Padrões de Código

### Geral

- Use **4 espaços** para indentação (exceto Python: 4 espaços)
- Máximo de **120 caracteres** por linha
- Use nomes descritivos para variáveis e funções
- Comente código complexo
- Remova código comentado (dead code)
- Não commite arquivos de configuração local

### .NET (C#)

```csharp
// ✅ Bom
public async Task<WeatherForecast> GetWeatherForecastAsync()
{
    var forecast = await _service.GetForecastAsync();
    _counter.Add(1);
    return forecast;
}

// ❌ Ruim
public async Task<WeatherForecast> get()
{
    var f=await _service.GetForecastAsync();_counter.Add(1);return f;
}
```

- Use PascalCase para classes e métodos
- Use camelCase para variáveis locais
- Use async/await quando apropriado
- Siga convenções do .NET

### Python

```python
# ✅ Bom
async def create_item(item: Item) -> Item:
    """Criar novo item no sistema."""
    item.id = generate_id()
    items_db.append(item)
    items_created_counter.inc()
    return item

# ❌ Ruim
async def create(i):
    i.id=generate_id();items_db.append(i);items_created_counter.inc();return i
```

- Siga [PEP 8](https://pep8.org/)
- Use type hints
- Use snake_case para funções e variáveis
- Docstrings em todas as funções públicas

### Java

```java
// ✅ Bom
@PostMapping
public ResponseEntity<Product> createProduct(@RequestBody Product product) {
    product.setId(counter.incrementAndGet());
    products.add(product);
    metricsService.incrementProductsCreated();
    return ResponseEntity.status(HttpStatus.CREATED).body(product);
}

// ❌ Ruim
@PostMapping
public ResponseEntity<Product> create(@RequestBody Product p){
    p.setId(counter.incrementAndGet());products.add(p);metricsService.incrementProductsCreated();return ResponseEntity.status(HttpStatus.CREATED).body(p);
}
```

- Siga [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use camelCase para métodos e variáveis
- Use PascalCase para classes

### TypeScript/JavaScript

```typescript
// ✅ Bom
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newTask = {
      id: ++taskIdCounter,
      title: body.title,
      completed: false,
    }
    tasks.push(newTask)
    tasksCreatedCounter.inc()
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// ❌ Ruim
export async function POST(request: Request) {
  const body = await request.json();const newTask = {id: ++taskIdCounter,title: body.title,completed: false};tasks.push(newTask);tasksCreatedCounter.inc();return NextResponse.json(newTask, { status: 201 })
}
```

- Use camelCase para variáveis e funções
- Use PascalCase para componentes React
- Use type annotations do TypeScript
- Evite `any`

### Docker

```dockerfile
# ✅ Bom - Multi-stage build otimizado
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]

# ❌ Ruim - Imagem grande, não otimizada
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

- Use multi-stage builds
- Use imagens Alpine quando possível
- Minimize camadas
- Use .dockerignore

---

## 📝 Padrões de Commit

Este projeto segue o [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações em documentação
- **style**: Formatação, ponto e vírgula, etc (não altera código)
- **refactor**: Refatoração de código
- **perf**: Melhoria de performance
- **test**: Adição ou correção de testes
- **chore**: Mudanças no processo de build, ferramentas, etc
- **ci**: Mudanças em CI/CD

### Exemplos

```bash
# Nova feature
feat(api): adicionar endpoint de estatísticas

# Correção de bug
fix(docker): corrigir erro ao buildar imagem do Next.js

# Documentação
docs(readme): adicionar seção de troubleshooting

# Refatoração
refactor(metrics): extrair lógica de métricas para service

# Performance
perf(prometheus): otimizar queries com cache

# Testes
test(api): adicionar testes unitários para ProductController
```

---

## 🔀 Pull Requests

### Checklist

Antes de abrir um PR, verifique:

- [ ] O código segue os padrões do projeto
- [ ] Todos os containers sobem sem erros
- [ ] As métricas estão sendo coletadas
- [ ] A documentação foi atualizada
- [ ] Os commits seguem o padrão Conventional Commits
- [ ] Não há conflitos com a branch main
- [ ] Foi testado localmente

### Template de PR

```markdown
## 📝 Descrição

Breve descrição do que foi alterado e por quê.

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 📝 Documentação
- [ ] 🎨 Refatoração
- [ ] ⚡ Performance
- [ ] ✅ Testes

## 🧪 Como Testar

1. Passo 1
2. Passo 2
3. Resultado esperado

## 📸 Screenshots (se aplicável)

Adicione screenshots relevantes.

## 🔗 Issues Relacionadas

Closes #123
Relates to #456

## ✅ Checklist

- [ ] Testei localmente
- [ ] Atualizei a documentação
- [ ] Segui os padrões de código
- [ ] Commits seguem Conventional Commits
```

### Processo de Review

1. Um maintainer irá revisar seu PR
2. Podem ser solicitadas alterações
3. Após aprovação, o PR será mesclado
4. Seu nome será adicionado aos contribuidores!

---

## 🐛 Reportar Bugs

### Template de Issue de Bug

```markdown
## 🐛 Descrição do Bug

Descrição clara e concisa do bug.

## 📋 Passos para Reproduzir

1. Vá para '...'
2. Execute '...'
3. Veja o erro

## ✅ Comportamento Esperado

O que deveria acontecer.

## ❌ Comportamento Atual

O que está acontecendo.

## 🖼️ Screenshots

Adicione screenshots se ajudar.

## 🔧 Ambiente

- OS: [e.g. Ubuntu 22.04]
- Docker: [e.g. 24.0.0]
- Docker Compose: [e.g. 2.20.0]

## 📝 Logs

```
Cole logs relevantes aqui
```

## 💡 Contexto Adicional

Qualquer outra informação relevante.
```

---

## ✨ Sugerir Melhorias

### Template de Issue de Feature

```markdown
## ✨ Descrição da Feature

Descrição clara da feature sugerida.

## 🎯 Problema que Resolve

Qual problema esta feature resolve?

## 💡 Solução Proposta

Como você imagina que isso deveria funcionar?

## 🔄 Alternativas Consideradas

Outras soluções que você pensou?

## 📊 Prioridade

- [ ] Alta
- [ ] Média
- [ ] Baixa

## 💬 Contexto Adicional

Qualquer outra informação relevante.
```

---

## 🙏 Agradecimentos

Toda contribuição é valiosa e apreciada! Se você contribuiu para este projeto, seu nome será adicionado à lista de contribuidores.

### Contribuidores

Obrigado a todas essas pessoas incríveis:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Será preenchido automaticamente -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📞 Contato

Dúvidas sobre como contribuir?

- 📧 Abra uma issue com a label `question`
- 💬 Inicie uma discussão no GitHub Discussions
- 🔗 Conecte-se no GitHub: [@ferronicardoso](https://github.com/ferronicardoso)

---

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Obrigado por contribuir! 🚀**

Juntos, estamos construindo uma excelente referência de observabilidade para a comunidade!
