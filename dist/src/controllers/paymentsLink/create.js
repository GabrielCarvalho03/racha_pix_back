"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentsLink = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const uuid_1 = require("uuid");
const date_fns_tz_1 = require("date-fns-tz");
const locale_1 = require("date-fns/locale");
const createPaymentsLink = async (request, reply) => {
    const { title, value, date, storeId } = request.body;
    console.log("storeId:", value);
    try {
        const existsSeller = await firebase_1.default
            .collection("users")
            .where("id", "==", storeId)
            .get();
        if (existsSeller.empty || !storeId) {
            return reply.status(400).send({
                error: "Estabelecimente não encontrado.",
            });
        }
        const savePaymente = await firebase_1.default.collection("paymentsLinks").add({
            id: (0, uuid_1.v4)(),
            storeId,
            title,
            value,
            date,
            current_amount: 0,
            is_closed: false,
            createdAt: (0, date_fns_tz_1.format)(new Date(), "yyyy-MM-dd HH:mm:ss", {
                timeZone: "America/Sao_Paulo",
                locale: locale_1.ptBR,
            }),
            paymentsConfirmed: [],
        });
        return reply.status(201).send({
            message: "Link de pagamento criado com sucesso",
            data: { id: savePaymente.id },
        });
    }
    catch (error) {
        reply.status(500).send({
            error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
        });
        console.log("❌ Erro ao Criar Link de Pagamento:", error);
        return;
    }
};
exports.createPaymentsLink = createPaymentsLink;
