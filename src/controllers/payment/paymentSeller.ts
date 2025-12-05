import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import { efiopay } from "../../services/efíclient";

export const paymentSeller = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { sellerID, amount } = request.body as {
    sellerID: string;
    amount: number;
  };
  try {
    const user = await db
      .collection("users")
      .where("sellerID", "==", sellerID)
      .get();
    if (user.empty) {
      return reply.status(404).send({ error: "usuário não encontrado." });
    }
    const userData = user.docs[0].data();

    // ✅ ID válido: apenas letras e números, máximo 35 caracteres
    const idEnvio = `envio${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 6)
      .replace(/[^a-zA-Z0-9]/g, "")}`.substr(0, 35);

    await efiopay.pixSend(
      {
        idEnvio: idEnvio,
      },
      {
        valor: `${amount}`,
        pagador: {
          chave: "5d2d7d7d-ec6c-4ceb-b58c-6341e1204937",
          infoPagador: "Confirmação de recebimento",
        },
        favorecido: {
          chave: userData.pixKey,
        },
      }
    );
  } catch (error) {
    console.error("Error in createPaymentController:", error);
    reply.status(500).send({
      error: "Ocorreu um erro interno no servidor, tente novamente mais tarde.",
    });
  }
};
