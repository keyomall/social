import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

let sdk: NodeSDK | null = null;

export async function initTelemetry() {
  if (process.env.OTEL_ENABLED !== "true") return;
  if (sdk) return;

  const serviceName = process.env.OTEL_SERVICE_NAME || "siag-backend";
  const serviceVersion = process.env.OTEL_SERVICE_VERSION || "1.0.0";
  const traceEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || "http://localhost:4318/v1/traces";

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: traceEndpoint }),
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
    }),
  });

  await sdk.start();
  console.log(`[OTEL] Telemetry initialized for ${serviceName} -> ${traceEndpoint}`);
}

export async function shutdownTelemetry() {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
