"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfiWebhook = void 0;
const findPaymentByAssasId_1 = require("../utils/findPaymentByAssasId");
const updatepaymentStatus_1 = require("../utils/updatepaymentStatus");
const ef_client_1 = require("../../../services/ef\u00EDclient");
const firebase_1 = __importDefault(require("../../../services/firebase"));
const EfiWebhook = async (request, reply) => {
    try {
        const paymentEvent = request.body;
        const pixInfo = paymentEvent.pix[0];
        const min_tax = 2.5;
        const tax_porcent = 0.03; // 3%
        console.log("Pagamento Recebido:", pixInfo);
        const value_porcent = pixInfo.valor * tax_porcent;
        const recibmentValue = Number(pixInfo.valor);
        const sistemComition = recibmentValue > 83.33
            ? recibmentValue * tax_porcent // 3% do valor
            : min_tax; // R$ 2,50 fixo
        const valueForClient = (recibmentValue - sistemComition).toFixed(2);
        if (!pixInfo.txid) {
            console.log("❌ TXID não encontrado no webhook");
            return reply.status(400).send({ error: "TXID not found" });
        }
        const paymentByIdData = await (0, findPaymentByAssasId_1.findPaymentByAsaasId)(pixInfo.txid);
        await (0, updatepaymentStatus_1.updatePaymentStatus)({
            trackingId: paymentByIdData?.trackingId || "",
            status: "received",
            additionalData: {
                current_amount: pixInfo.valor,
                paymentsConfirmed: [
                    {
                        name: paymentByIdData?.customerName,
                        cpfCnpj: paymentByIdData?.customerCpf,
                        created_at: new Date().toISOString(),
                        amount: paymentByIdData?.value,
                    },
                ],
            },
        });
        const sellerData = await firebase_1.default
            .collection("users")
            .where("id", "==", paymentByIdData?.sellerId)
            .get();
        if (sellerData.empty) {
            console.log("❌ Usuário recebedor não encontrado.");
            return reply
                .status(404)
                .send({ message: "Usuário recebedor não encontrado." });
        }
        const paymentsSnapshotFirestore = await firebase_1.default
            .collection("paymentsLinks")
            .where("id", "==", paymentByIdData?.paymentLinkId)
            .get();
        await firebase_1.default
            .collection("paymentsLinks")
            .doc(paymentsSnapshotFirestore.docs[0].id)
            .update({
            ...paymentsSnapshotFirestore.docs[0].data(),
            current_amount: Number(paymentsSnapshotFirestore.docs[0].data().current_amount || 0) +
                recibmentValue,
            paymentsConfirmed: [
                ...(paymentsSnapshotFirestore.docs[0].data().paymentsConfirmed || []),
                {
                    name: paymentByIdData?.customerName,
                    cpfCnpj: paymentByIdData?.customerCpf,
                    created_at: new Date().toISOString(),
                    amount: paymentByIdData?.value,
                },
            ],
        });
        if (pixInfo.status === "NAO_REALIZADO") {
            console.log("❌ Transação não realizada!");
            console.log("🔍 Detalhes do erro:", pixInfo.gnExtras);
            console.log("📋 Tipo:", pixInfo.tipo);
            console.log("💰 Valor:", pixInfo.valor);
            console.log("🔑 Chave destinatário:", pixInfo.chave);
            console.log("📝 Info pagador:", pixInfo.infoPagador);
        }
        // ✅ ID válido: apenas letras e números, máximo 35 caracteres
        const idEnvio = `envio${Date.now()}${Math.random()
            .toString(36)
            .substr(2, 6)
            .replace(/[^a-zA-Z0-9]/g, "")}`.substr(0, 35);
        console.log("💰 Valor para o cliente:", valueForClient);
        await ef_client_1.efiopay.pixSend({
            idEnvio: idEnvio,
        }, {
            valor: `${valueForClient}`,
            pagador: {
                chave: "5d2d7d7d-ec6c-4ceb-b58c-6341e1204937",
                infoPagador: "Confirmação de recebimento",
            },
            favorecido: {
                chave: sellerData.docs[0].data().pixKey,
            },
        });
        return reply.status(200).send({ message: "Webhook received successfully" });
    }
    catch (err) {
        console.error("Ocorreu um erro ao processar o webhook:", err);
        reply.status(500).send({ error: "Internal Server Error" });
    }
};
exports.EfiWebhook = EfiWebhook;
