"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentsLink = void 0;
const firebase_1 = require("../../services/firebase");
const deletePaymentsLink = async (request, reply) => {
    try {
        const { id } = request.params;
        const docData = await firebase_1.db
            .collection("paymentsLinks")
            .where("id", "==", id)
            .get();
        await firebase_1.db.collection("paymentsLinks").doc(docData.docs[0].id).delete();
        return reply.status(200).send({
            message: "Link de pagamento deletado com sucesso.",
        });
    }
    catch (error) {
        reply.status(500).send({
            error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
        });
        console.log("❌ Erro ao Deletar Link de Pagamento:", error);
        return;
    }
};
exports.deletePaymentsLink = deletePaymentsLink;
