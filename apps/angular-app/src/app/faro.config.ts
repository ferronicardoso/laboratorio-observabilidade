import { initializeFaro as initFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export function initializeFaro() {
  const faro = initFaro({
    url: 'http://localhost:12347',
    app: {
      name: 'angular-observability-lab',
      version: '1.0.0',
      environment: 'production'
    },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
        captureConsoleDisabledLevels: []
      }),
      new TracingInstrumentation()
    ]
  });

  console.log('✅ Grafana Faro initialized');
  return faro;
}
