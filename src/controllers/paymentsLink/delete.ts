import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../services/firebase";

export const deletePaymentsLink = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };

    const docData = await db
      .collection("paymentsLinks")
      .where("id", "==", id)
      .get();

    await db.collection("paymentsLinks").doc(docData.docs[0].id).delete();

    return reply.status(200).send({
      message: "Link de pagamento deletado com sucesso.",
    });
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.log("❌ Erro ao Deletar Link de Pagamento:", error);
    return;
  }
};
