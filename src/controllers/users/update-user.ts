import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const updateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = request.params as { userId: string };
  const { name, pixKey } = request.body as { name?: string; pixKey?: string };

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

    const userInDb = await db
      .collection("users")
      .where("id", "==", userId)
      .get();

    if (userInDb.empty) {
      return reply.status(404).send({ message: "Usuário não encontrado." });
    }
    const userDoc = userInDb.docs[0];

    const updatedData: { name?: string; pixKey?: string } = {};
    if (name) updatedData.name = name;
    if (pixKey) updatedData.pixKey = pixKey;
    await db.collection("users").doc(userDoc.id).update(updatedData);
    return reply
      .status(200)
      .send({ message: "Usuário atualizado com sucesso." });
  } catch (error) {
    return reply.status(500).send({
      message: "Ocorreu um erro interno, tente novamente mais tarde.",
    });
  }
};
