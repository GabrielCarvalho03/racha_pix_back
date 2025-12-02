import "dotenv/config";
import fastify from "fastify";
import { AuthRoute } from "./routes/user.routes";
import { PaymentsLinkRoutes } from "./routes/paymentsLink.routes";
import { PaymentsRoutes } from "./routes/payments.routes";

console.log("🚀 Iniciando aplicação Fastify...");

const app = fastify({
  logger: process.env.NODE_ENV === "development",
});

// Registrar plugins (forma mais rápida)
app.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET || "your-secret-key-here",
});

app.register(import("@fastify/formbody"));

app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);

app.register(require("@fastify/cors"), {
  origin: true,
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
});

// Health check ANTES das rotas pesadas
app.get("/", async (request, reply) => {
  return {
    message: "API Racha Pix funcionando!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  };
});

app.get("/health", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

// Rotas (registrar por último)
app.register(AuthRoute);
app.register(PaymentsRoutes);
app.register(PaymentsLinkRoutes);

console.log("✅ Aplicação configurada");

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const start = async () => {
    try {
      const PORT = Number(process.env.PORT) || 3000;
      await app.listen({ port: PORT, host: "0.0.0.0" });
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    } catch (err) {
      console.error("❌ Error starting server:", err);
      process.exit(1);
    }
  };
  start();
}

// Export para Vercel
export default app;
