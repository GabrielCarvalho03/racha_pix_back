import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const createCourt = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, userId } = request.body as {
    name: string;
    userId: string;
  };

  try {
    if (!name || !userId) {
      return reply
        .status(400)
        .send({ message: "Nome da quadra e ID do usuário são obrigatórios." });
    }

    const newDoc = await db.collection("users").where("id", "==", userId).get();

    if (newDoc.empty) {
      return reply.status(404).send({ message: "Usuário não encontrado." });
    }
    const userDocId = newDoc.docs[0].id;
    const userData = newDoc.docs[0].data();

    const updatedCourts = userData.courts ? [...userData.courts, name] : [name];

    await db.collection("users").doc(userDocId).update({
      courts: updatedCourts,
    });
    return reply.status(201).send({ message: "Quadra criada com sucesso." });
  } catch (error) {
    console.error("Erro ao criar quadra:", error);
    return reply.status(500).send({
      message: "Ocorreu um erro interno, tente novamente mais tarde.",
    });
  }
};
