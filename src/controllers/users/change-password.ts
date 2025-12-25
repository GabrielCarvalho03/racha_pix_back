import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import bcrypt from "bcrypt";

export const ChangePassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { password, userId } = request.body as {
    password: string;
    userId: string;
  };

  if (!password || !userId) {
    return reply.status(400).send({ error: "Parâmetros insuficientes" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const foundUser = await db
      .collection("users")
      .where("id", "==", userId)
      .get();

    if (foundUser.empty) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }
    await db.collection("users").doc(foundUser.docs[0].id).update({
      password: hashedPassword,
      firstAccess: false,
    });

    return reply.send({
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    reply.status(500).send({ error: "Internal Server Error" });
    return;
  }
};
