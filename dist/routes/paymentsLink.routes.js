"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsLinkRoutes = void 0;
const create_1 = require("../controllers/paymentsLink/create");
const allPaymentLinkById_1 = require("../controllers/paymentsLink/allPaymentLinkById");
const delete_1 = require("../controllers/paymentsLink/delete");
const PaymentLinkById_1 = require("../controllers/paymentsLink/PaymentLinkById");
const PaymentsLinkRoutes = async (app) => {
    app.get("/payments-link/:id", allPaymentLinkById_1.AllPaymentLinkByInd);
    app.get("/payments-link/byId/:id", PaymentLinkById_1.PaymentLinkById);
    app.post("/payments-link", create_1.createPaymentsLink);
    app.delete("/payments-link/:id", delete_1.deletePaymentsLink);
};
exports.PaymentsLinkRoutes = PaymentsLinkRoutes;
