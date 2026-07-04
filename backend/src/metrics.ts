import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  app: "todo-backend",
});

// collectDefaultMetrics({
//   register: metricsRegistry,
// });

export const httpRequestsTotal = new Counter({
  name: "todo_http_requests_total",
  help: "Total number of HTTP requests received",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry],
});

export const httpRequestDuration = new Histogram({
  name: "todo_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const activeRequests = new Gauge({
  name: "todo_http_active_requests",
  help: "Number of HTTP requests currently being processed",
  registers: [metricsRegistry],
});

export const todoCreatedTotal = new Counter({
  name: "todo_created_total",
  help: "Total number of todos created",
  registers: [metricsRegistry],
});

export const todoDeletedTotal = new Counter({
  name: "todo_deleted_total",
  help: "Total number of todos deleted",
  registers: [metricsRegistry],
});
