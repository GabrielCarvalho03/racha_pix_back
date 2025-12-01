import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const PaymentLinkById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };

    const PaymentsLinkData = await db
      .collection("paymentsLinks")
      .where("id", "==", id)
      .get();

    const paymentLink = PaymentsLinkData.docs.map((doc) => doc.data());

    return reply.status(200).send({
      message: "Link de pagamento encontrado com sucesso.",
      data: paymentLink,
    });
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.log("❌ Erro ao Buscar Links de Pagamento:", error);
    return;
  }
};
