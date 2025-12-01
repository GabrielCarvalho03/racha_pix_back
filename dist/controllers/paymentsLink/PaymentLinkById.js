"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinkById = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const PaymentLinkById = async (request, reply) => {
    try {
        const { id } = request.params;
        const PaymentsLinkData = await firebase_1.default
            .collection("paymentsLinks")
            .where("id", "==", id)
            .get();
        const paymentLink = PaymentsLinkData.docs.map((doc) => doc.data());
        return reply.status(200).send({
            message: "Link de pagamento encontrado com sucesso.",
            data: paymentLink,
        });
    }
    catch (error) {
        reply.status(500).send({
            error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
        });
        console.log("❌ Erro ao Buscar Links de Pagamento:", error);
        return;
    }
};
exports.PaymentLinkById = PaymentLinkById;
