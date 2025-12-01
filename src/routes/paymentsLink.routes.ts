import { FastifyInstance } from "fastify";
import { createPaymentsLink } from "../controllers/paymentsLink/create";
import { AllPaymentLinkByInd } from "../controllers/paymentsLink/allPaymentLinkById";
import { deletePaymentsLink } from "../controllers/paymentsLink/delete";
import { PaymentLinkById } from "../controllers/paymentsLink/PaymentLinkById";

export const PaymentsLinkRoutes = async (app: FastifyInstance) => {
  app.get("/payments-link/:id", AllPaymentLinkByInd);
  app.get("/payments-link/byId/:id", PaymentLinkById);

  app.post("/payments-link", createPaymentsLink);

  app.delete("/payments-link/:id", deletePaymentsLink);
};
