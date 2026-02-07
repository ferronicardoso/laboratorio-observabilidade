# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar csproj e restaurar dependências
COPY dotnet-api.csproj .
RUN dotnet restore

# Copiar o resto dos arquivos e buildar
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copiar os binários do build stage
COPY --from=build /app/publish .

# Expor portas
EXPOSE 8080
EXPOSE 8081

# Desabilitar HTTPS redirect (para simplificar no Docker)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "dotnet-api.dll"]
