# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar pom.xml e baixar dependências
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiar código fonte e buildar
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Baixar OpenTelemetry Java Agent
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.10.0/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar

# Copiar JAR do build stage
COPY --from=build /app/target/*.jar app.jar

# Expor porta
EXPOSE 8080

# Variáveis de ambiente do OpenTelemetry
ENV OTEL_SERVICE_NAME=java-api
ENV OTEL_RESOURCE_ATTRIBUTES=service.version=1.0.0,deployment.environment=lab
ENV OTEL_TRACES_EXPORTER=otlp
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4317
ENV OTEL_EXPORTER_OTLP_PROTOCOL=grpc
ENV OTEL_METRICS_EXPORTER=none
ENV OTEL_LOGS_EXPORTER=none

# Comando para rodar a aplicação com Java Agent
ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-jar", "app.jar"]
