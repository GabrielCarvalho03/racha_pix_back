import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const getUserById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };

    const res = await db.collection("users").where("id", "==", id).get();

    if (res.empty) {
      return reply.status(404).send({
        error: "Usuário não encontrado.",
      });
    } else {
      const userData = res.docs[0].data();

      const { password: _, ...userWithoutPassword } = userData;
      return reply.send({
        message: "Usuário encontrado com sucesso.",
        data: userWithoutPassword,
      });
    }
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.error("❌ Erro ao Buscar Usuário por ID:", error);
    return;
  }
};
