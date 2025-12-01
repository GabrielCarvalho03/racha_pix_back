"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentController = void 0;
const firebase_1 = __importStar(require("../../services/firebase"));
const ef_client_1 = require("../../services/ef\u00EDclient");
const createPaymentController = async (request, reply) => {
    const { name, cpfCnpj, value, paymentLinkId, userId } = request.body;
    const trackingId = `payment_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    try {
        if (!name || !cpfCnpj || !value || !userId || !paymentLinkId) {
            const missingFields = [];
            if (!name)
                missingFields.push("name");
            if (!value)
                missingFields.push("value");
            if (!cpfCnpj)
                missingFields.push("cpfCnpj");
            if (!userId)
                missingFields.push("userId");
            if (!paymentLinkId)
                missingFields.push("paymentLinkId");
            return reply.status(400).send({
                error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
                missingFields: missingFields,
            });
        }
        if (!paymentLinkId) {
            return reply.status(400).send({
                message: `Link de pagamento não fornecido`,
            });
        }
        const existPaymentLink = await firebase_1.default
            .collection("paymentsLinks")
            .where("id", "==", paymentLinkId)
            .get();
        if (existPaymentLink.empty) {
            return reply
                .status(404)
                .send({ error: "Link de pagamento não encontrado" });
        }
        const infoUser = await firebase_1.default
            .collection("users")
            .where("id", "==", userId)
            .get();
        if (infoUser.empty) {
            return reply
                .status(404)
                .send({ message: "Usuário recebedor não encontrado." });
        }
        // Criar cobrança PIX na EFí
        const pixBody = {
            calendario: {
                expiracao: 900, // 15 minutos (900 segundos)
            },
            valor: {
                original: value.toFixed(2),
            },
            chave: "5d2d7d7d-ec6c-4ceb-b58c-6341e1204937",
            solicitacaoPagador: "Pagamento PIX",
            devedor: {
                nome: name,
                cpf: cpfCnpj.replace(/\D/g, ""),
            },
            infoAdicionais: [
                {
                    nome: "Tracking ID",
                    valor: trackingId,
                },
            ],
        };
        const pixResponse = await ef_client_1.efiopay.pixCreateImmediateCharge([], pixBody);
        // Gerar QR Code
        let qrCodeData = null;
        if (pixResponse.loc && pixResponse.loc.id) {
            const qrCodeResponse = await ef_client_1.efiopay.pixGenerateQRCode({
                id: pixResponse.loc.id,
            });
            qrCodeData = qrCodeResponse;
        }
        await firebase_1.rtdb.ref(`/payments/${trackingId}`).set({
            txid: pixResponse.txid,
            paymentLinkId: existPaymentLink.docs[0].data().id ?? "",
            status: pixResponse.status,
            value: value,
            customerName: name,
            customerCpf: cpfCnpj,
            sellerId: userId,
            sellerPixKey: infoUser.docs[0].data().pixKey ?? "",
            description: "Pagamento PIX",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
        });
        return reply.status(201).send({
            message: "Pagamento Pix criado com sucesso",
            trackingId: trackingId,
            txid: pixResponse.txid,
            pixData: {
                qrcode: qrCodeData?.qrcode,
                imagemQrcode: qrCodeData?.imagemQrcode,
                valor: value.toFixed(2),
                status: pixResponse.status,
            },
        });
    }
    catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro interno no servidor" });
    }
};
exports.createPaymentController = createPaymentController;
