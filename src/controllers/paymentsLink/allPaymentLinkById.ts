import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const AllPaymentLinkByInd = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };

    const PaymentsLinkData = await db
      .collection("paymentsLinks")
      .where("storeId", "==", id)
      .get();

    const paymentLinks = PaymentsLinkData.docs.map((doc) => doc.data());

    return reply.status(200).send({
      message: "Links de pagamento encontrados com sucesso.",
      data: paymentLinks,
    });
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.log("❌ Erro ao Buscar Links de Pagamento:", error);
    return;
  }
};
