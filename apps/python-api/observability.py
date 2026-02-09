"""
Configuração de Observabilidade com OpenTelemetry
"""
from opentelemetry import metrics, trace
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from prometheus_client import start_http_server
import logging
import os

logger = logging.getLogger(__name__)

# Configurar recursos (service info)
def create_resource():
    """Criar recurso com informações do serviço"""
    return Resource.create({
        SERVICE_NAME: "python-api",
        SERVICE_VERSION: "1.0.0",
    })

# Configurar tracing com OTLP
def setup_tracing():
    """Configurar OpenTelemetry Tracing com OTLP exporter"""
    try:
        # Endpoint do Alloy (OTLP gRPC)
        otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://alloy:4317")

        # Criar resource
        resource = create_resource()

        # Criar OTLP exporter para traces
        otlp_exporter = OTLPSpanExporter(
            endpoint=otlp_endpoint,
            insecure=True  # sem TLS em ambiente de dev
        )

        # Criar TracerProvider
        tracer_provider = TracerProvider(resource=resource)

        # Adicionar BatchSpanProcessor com OTLP exporter
        tracer_provider.add_span_processor(
            BatchSpanProcessor(otlp_exporter)
        )

        # Registrar provider globalmente
        trace.set_tracer_provider(tracer_provider)

        # Instrumentar HTTP client (httpx)
        HTTPXClientInstrumentor().instrument()

        logger.info(f"✅ Tracing configurado com OTLP endpoint: {otlp_endpoint}")
        return tracer_provider
    except Exception as e:
        logger.error(f"❌ Erro ao configurar tracing: {e}")
        raise

# Configurar provider de métricas com Prometheus
def setup_metrics():
    """Configurar OpenTelemetry Metrics com Prometheus exporter"""
    try:
        # Criar resource
        resource = create_resource()

        # Criar reader do Prometheus
        prometheus_reader = PrometheusMetricReader()

        # Criar provider de métricas
        provider = MeterProvider(
            resource=resource,
            metric_readers=[prometheus_reader]
        )

        # Registrar provider globalmente
        metrics.set_meter_provider(provider)

        logger.info("✅ Métricas configuradas com Prometheus exporter")
        return provider
    except Exception as e:
        logger.error(f"❌ Erro ao configurar métricas: {e}")
        raise

def instrument_app(app):
    """Instrumentar FastAPI com OpenTelemetry"""
    try:
        # Instrumentação automática do FastAPI
        FastAPIInstrumentor.instrument_app(app)
        logger.info("✅ FastAPI instrumentado com OpenTelemetry")
    except Exception as e:
        logger.error(f"❌ Erro ao instrumentar FastAPI: {e}")
        raise

def get_meter(name: str, version: str = "1.0.0"):
    """Obter meter para criar métricas customizadas"""
    return metrics.get_meter(name, version)
