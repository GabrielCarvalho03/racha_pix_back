"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRoutes = void 0;
const create_1 = require("../controllers/payment/create");
const assas_webhook_1 = require("../controllers/payment/webhook/assas-webhook");
const PaymentsRoutes = async (app) => {
    app.post("/payments/Create", create_1.createPaymentController);
    app.post("/efi/webhook", (request, reply) => {
        reply.status(200).send();
    });
    app.post("/efi/webhook/pix", assas_webhook_1.EfiWebhook);
};
exports.PaymentsRoutes = PaymentsRoutes;
