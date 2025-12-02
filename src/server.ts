import "dotenv/config";
import fastify from "fastify";
import { AuthRoute } from "./routes/user.routes";
import { PaymentsRoutes } from "./routes/payments.routes";
import { PaymentsLinkRoutes } from "./routes/paymentsLink.routes";

// Cria a instância
const app = fastify({
  logger: process.env.NODE_ENV === "development",
});

// Plugins
app.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET || "your-secret",
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

// Health check
app.get("/", () => ({
  message: "API Racha Pix funcionando!",
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// Rotas
app.register(AuthRoute);
app.register(PaymentsRoutes);
app.register(PaymentsLinkRoutes);

// -----------------------
// LOCAL ONLY
// -----------------------
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

// -----------------------
// VERCEL EXPORT
// -----------------------
export default app;
