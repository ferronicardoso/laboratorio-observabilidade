"""
Configuração de Observabilidade com OpenTelemetry
"""
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_client import start_http_server
import logging

logger = logging.getLogger(__name__)

# Configurar provider de métricas com Prometheus
def setup_metrics():
    """Configurar OpenTelemetry com Prometheus exporter"""
    try:
        # Criar reader do Prometheus
        prometheus_reader = PrometheusMetricReader()

        # Criar provider de métricas
        provider = MeterProvider(metric_readers=[prometheus_reader])

        # Registrar provider globalmente
        metrics.set_meter_provider(provider)

        logger.info("✅ OpenTelemetry configurado com sucesso")
        return provider
    except Exception as e:
        logger.error(f"❌ Erro ao configurar OpenTelemetry: {e}")
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
