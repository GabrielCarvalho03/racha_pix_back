"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPaymentByAsaasId = void 0;
const firebase_1 = require("../../../services/firebase");
const findPaymentByAsaasId = async (assasId) => {
    try {
        const snapShot = await firebase_1.rtdb
            .ref("/payments")
            .orderByChild("txid")
            .equalTo(assasId)
            .once("value");
        let paymentData = null;
        snapShot.forEach((child) => {
            paymentData = { trackingId: child.key, ...child.val() };
        });
        return paymentData;
    }
    catch (err) {
        console.error("Erro ao buscar pagamento por Assas ID:", err);
        throw err;
    }
};
exports.findPaymentByAsaasId = findPaymentByAsaasId;
