import { FastifyInstance } from "fastify";

export const SlugRoutes = (app: FastifyInstance) => {
  app.get("/slug/:id", () => {});
  app.post("/slug", () => {});
};
