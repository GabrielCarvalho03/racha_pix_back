"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const getUserById = async (request, reply) => {
    try {
        const { id } = request.params;
        const res = await firebase_1.default.collection("users").where("id", "==", id).get();
        if (res.empty) {
            return reply.status(404).send({
                error: "Usuário não encontrado.",
            });
        }
        else {
            const userData = res.docs[0].data();
            const { password: _, ...userWithoutPassword } = userData;
            return reply.send({
                message: "Usuário encontrado com sucesso.",
                data: userWithoutPassword,
            });
        }
    }
    catch (error) {
        reply.status(500).send({
            error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
        });
        console.error("❌ Erro ao Buscar Usuário por ID:", error);
        return;
    }
};
exports.getUserById = getUserById;
