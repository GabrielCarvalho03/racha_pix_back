import fastify from "fastify";
import { AuthRoute } from "./routes/user.routes";
import { PaymentsLinkRoutes } from "./routes/paymentsLink.routes";
import { PaymentsRoutes } from "./routes/payments.routes";
const app = fastify();

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
  origin: true, // Permite todas as origens em desenvolvimento
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
});
app.register(AuthRoute);
app.register(PaymentsRoutes);
app.register(PaymentsLinkRoutes);

app.listen({ port: 3000 }).then(() => {
  console.log(`Server running at http://localhost:3000`);
});
