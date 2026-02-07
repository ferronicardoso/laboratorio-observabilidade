# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist/angular-app/browser /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
