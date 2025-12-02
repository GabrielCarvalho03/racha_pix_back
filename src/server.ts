import "dotenv/config";
import fastify from "fastify";
import { AuthRoute } from "./routes/user.routes";
import { PaymentsRoutes } from "./routes/payments.routes";
import { PaymentsLinkRoutes } from "./routes/paymentsLink.routes";

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

// EXPORTA APENAS O APP (sem listen)
export default app;
