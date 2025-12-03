import { FastifyInstance } from "fastify";
import { createSlug } from "../controllers/slugs/create";
import { PaymentLinkBySlug } from "../controllers/paymentsLink/paymentLinkBySlug";

export const SlugRoutes = (app: FastifyInstance) => {
  app.get("/slug/:slug", PaymentLinkBySlug);
  app.post("/slug", createSlug);
};
