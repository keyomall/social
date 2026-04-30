import dotenv from "dotenv";
import { initTelemetry, shutdownTelemetry } from "./telemetry";

dotenv.config();

async function bootstrap() {
  await initTelemetry();
  const { createApp } = await import("./app");
  const PORT = process.env.PORT || 3001;
  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`[KERYX/SIAG] Backend inicializado en puerto ${PORT}`);
  });

  const close = async () => {
    server.close(async () => {
      await shutdownTelemetry();
      process.exit(0);
    });
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

bootstrap().catch((error) => {
  console.error("[KERYX/SIAG] Error iniciando backend:", error);
  process.exit(1);
});
