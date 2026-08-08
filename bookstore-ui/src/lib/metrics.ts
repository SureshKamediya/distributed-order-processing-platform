import client from 'prom-client';

const globalForMetrics = global as unknown as { registry?: client.Registry };

export const registry = globalForMetrics.registry ?? new client.Registry();

if (!globalForMetrics.registry) {
  client.collectDefaultMetrics({ register: registry }); // event loop lag, memory, GC, etc.
  globalForMetrics.registry = registry;
}

export const httpRequestDuration = globalForMetrics.registry
  ? (client.register.getSingleMetric('http_request_duration_seconds') as client.Histogram<string>)
  : new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [registry],
    });