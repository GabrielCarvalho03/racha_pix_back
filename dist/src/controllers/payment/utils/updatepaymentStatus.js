"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = void 0;
const firebase_1 = require("../../../services/firebase");
const updatePaymentStatus = async (props) => {
    try {
        const updateData = {
            status: props.status,
            lastUpdatedAt: Date.now().toLocaleString(),
            ...props.additionalData,
        };
        await firebase_1.rtdb.ref(`/payments/${props.trackingId}`).update(updateData);
    }
    catch (err) {
        console.error("Erro ao buscar pagamento por Assas ID:", err);
        throw err;
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
