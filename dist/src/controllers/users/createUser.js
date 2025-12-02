"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (request, reply) => {
    const { email, password, name, phone } = request.body;
    try {
        const userExists = await firebase_1.default
            .collection("users")
            .where("email", "==", email)
            .get();
        console.log("userExists", userExists.docs.map((doc) => doc.data()));
        if (!userExists.empty) {
            return reply
                .status(400)
                .send({ error: "Já existe um usuário com este email" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const userId = (0, uuid_1.v4)();
        const usersRef = await firebase_1.default.collection("users").add({
            id: userId,
            name,
            phone: phone ?? "",
            email,
            password: hashedPassword,
        });
        const userData = {
            id: userId,
            name,
            phone: phone ?? "",
            email,
        };
        const token = request.server.jwt.sign({
            userId: userId,
            email,
        }, { expiresIn: "24h" });
        return reply.send({
            message: "Usuário criado com sucesso",
            data: { ...userData, token },
            userId: usersRef.id,
        });
    }
    catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
        return;
    }
};
exports.createUser = createUser;
