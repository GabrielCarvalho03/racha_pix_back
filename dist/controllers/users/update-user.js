"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const updateUser = async (request, reply) => {
    const { userId } = request.params;
    const { name, pixKey } = request.body;
    try {
        if (!name && !pixKey) {
            return reply
                .status(400)
                .send({ message: "Nenhum dado fornecido para atualização." });
        }
        if (!userId) {
            return reply
                .status(400)
                .send({ message: "ID do usuário é obrigatório." });
        }
        const userInDb = await firebase_1.default
            .collection("users")
            .where("id", "==", userId)
            .get();
        if (userInDb.empty) {
            return reply.status(404).send({ message: "Usuário não encontrado." });
        }
        const userDoc = userInDb.docs[0];
        const updatedData = {};
        if (name)
            updatedData.name = name;
        if (pixKey)
            updatedData.pixKey = pixKey;
        await firebase_1.default.collection("users").doc(userDoc.id).update(updatedData);
        return reply
            .status(200)
            .send({ message: "Usuário atualizado com sucesso." });
    }
    catch (error) {
        return reply.status(500).send({
            message: "Ocorreu um erro interno, tente novamente mais tarde.",
        });
    }
};
exports.updateUser = updateUser;
