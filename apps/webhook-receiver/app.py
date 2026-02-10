#!/usr/bin/env python3
"""
Webhook Receiver para Alertmanager - Lab de Observabilidade
Recebe notificações de alertas e loga no console (para fins educacionais)
"""
from flask import Flask, request, jsonify
from datetime import datetime
import json
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def format_alert_message(alert):
    """Formatar alerta para exibição"""
    labels = alert.get('labels', {})
    annotations = alert.get('annotations', {})
    status = alert.get('status', 'unknown')

    severity = labels.get('severity', 'unknown')
    alertname = labels.get('alertname', 'unknown')
    service = labels.get('job', labels.get('service', 'unknown'))

    emoji = "🔴" if severity == "critical" else "⚠️" if severity == "warning" else "ℹ️"

    msg = f"\n{'='*80}\n"
    msg += f"{emoji} ALERTA: {alertname} - {severity.upper()}\n"
    msg += f"{'='*80}\n"
    msg += f"Serviço: {service}\n"
    msg += f"Status: {status}\n"

    if annotations.get('summary'):
        msg += f"Resumo: {annotations['summary']}\n"
    if annotations.get('description'):
        msg += f"Descrição: {annotations['description']}\n"

    msg += f"\nLabels:\n"
    for key, value in labels.items():
        msg += f"  - {key}: {value}\n"

    msg += f"{'='*80}\n"

    return msg

@app.route('/webhook', methods=['POST'])
def webhook_default():
    """Webhook padrão"""
    data = request.get_json()

    logger.info("📨 Recebida notificação no webhook padrão")

    if data and 'alerts' in data:
        for alert in data['alerts']:
            print(format_alert_message(alert))

    return jsonify({"status": "success", "message": "Alert received"}), 200

@app.route('/webhook/critical', methods=['POST'])
def webhook_critical():
    """Webhook para alertas críticos"""
    data = request.get_json()

    logger.critical("🚨 ALERTA CRÍTICO RECEBIDO!")

    if data and 'alerts' in data:
        for alert in data['alerts']:
            print(format_alert_message(alert))

    return jsonify({"status": "success", "message": "Critical alert received"}), 200

@app.route('/webhook/warning', methods=['POST'])
def webhook_warning():
    """Webhook para warnings"""
    data = request.get_json()

    logger.warning("⚠️  ALERTA WARNING RECEBIDO")

    if data and 'alerts' in data:
        for alert in data['alerts']:
            print(format_alert_message(alert))

    return jsonify({"status": "success", "message": "Warning alert received"}), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "service": "webhook-receiver",
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    logger.info("🚀 Webhook Receiver iniciando na porta 5001...")
    logger.info("📍 Endpoints disponíveis:")
    logger.info("  - POST /webhook (padrão)")
    logger.info("  - POST /webhook/critical")
    logger.info("  - POST /webhook/warning")
    logger.info("  - GET /health")

    app.run(host='0.0.0.0', port=5001, debug=False)
