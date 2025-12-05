import { FastifyInstance } from "fastify";
import { createPaymentController } from "../controllers/payment/create";
import { EfiWebhook } from "../controllers/payment/webhook/assas-webhook";
import { paymentSeller } from "../controllers/payment/paymentSeller";

export const PaymentsRoutes = async (app: FastifyInstance) => {
  app.post("/payments/Create", createPaymentController);
  app.post("/efi/webhook", (request, reply) => {
    reply.status(200).send();
  });
  app.post("/efi/webhook/pix", EfiWebhook);
  app.post("/payment/seller", paymentSeller);
};
