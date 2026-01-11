import { FastifyInstance } from "fastify";
import { createCourt } from "../controllers/courts/createCourt";

export const CourtsRoutes = async (app: FastifyInstance) => {
  app.post("/courts/create", createCourt);
};
