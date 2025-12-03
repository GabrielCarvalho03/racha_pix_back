import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";

export const PaymentLinkBySlug = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { slug } = request.params as { slug: string };

    const PaymentsLinkData = await db
      .collection("slugs")
      .where("slug", "==", slug)
      .get();

    const paymentLink = PaymentsLinkData.docs.map((doc) => doc.data());

    const paymentDatainDB = await db
      .collection("paymentsLinks")
      .where("id", "==", paymentLink[0]?.paymentId)
      .get();

    if (paymentDatainDB.empty) {
      return reply.status(404).send({
        error: "Link de pagamento não encontrado.",
      });
    }

    const paymentData = paymentDatainDB.docs.map((doc) => doc.data());

    return reply.status(200).send({
      message: "Link de pagamento encontrado com sucesso.",
      data: paymentData,
    });
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.log("❌ Erro ao Buscar Links de Pagamento:", error);
    return;
  }
};
