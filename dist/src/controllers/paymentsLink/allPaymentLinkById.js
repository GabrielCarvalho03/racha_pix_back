"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllPaymentLinkByInd = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const AllPaymentLinkByInd = async (request, reply) => {
    try {
        const { id } = request.params;
        const PaymentsLinkData = await firebase_1.default
            .collection("paymentsLinks")
            .where("storeId", "==", id)
            .get();
        const paymentLinks = PaymentsLinkData.docs.map((doc) => doc.data());
        return reply.status(200).send({
            message: "Links de pagamento encontrados com sucesso.",
            data: paymentLinks,
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
exports.AllPaymentLinkByInd = AllPaymentLinkByInd;
