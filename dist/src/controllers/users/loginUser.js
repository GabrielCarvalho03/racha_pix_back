"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = void 0;
const firebase_1 = __importDefault(require("../../services/firebase"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const LoginUser = async (request, reply) => {
    const { email, password } = request.body;
    try {
        const usersRef = await firebase_1.default
            .collection("users")
            .where("email", "==", email)
            .get();
        const userData = usersRef.docs.map((doc) => doc.data());
        console.log("userData:", userData[0]);
        if (userData.length === 0) {
            reply.status(401).send({
                error: "nenhum usuário encontrado, verifique seu email e senha",
            });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(password, userData[0].password);
        if (!isValidPassword) {
            reply.status(401).send({
                error: "senha incorreta, verifique a senha e tente novamente",
            });
            return;
        }
        const token = request.server.jwt.sign({
            userId: userData[0].id,
            email: userData[0].email,
        }, { expiresIn: "24h" });
        const { password: _, ...userWithoutPassword } = userData[0];
        reply.send({
            message: "Login successful",
            data: { ...userWithoutPassword, token },
        });
    }
    catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
        return;
    }
};
exports.LoginUser = LoginUser;
