import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const createPaymentsLink = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { title, value, date, storeId, paymentId } = request.body as {
    title: string;
    value: number;
    date: string;
    storeId: string;
    paymentId: string;
  };

  console.log("storeId:", value);
  try {
    const existsSeller = await db
      .collection("users")
      .where("id", "==", storeId)
      .get();

    if (existsSeller.empty || !storeId) {
      return reply.status(400).send({
        error: "Estabelecimente não encontrado.",
      });
    }

    const savePaymente = await db.collection("paymentsLinks").add({
      id: paymentId,
      storeId,
      title,
      value,
      date,
      current_amount: 0,
      is_closed: false,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm:ss", {
        timeZone: "America/Sao_Paulo",
        locale: ptBR,
      }),
      paymentsConfirmed: [],
    });

    return reply.status(201).send({
      message: "Link de pagamento criado com sucesso",
      data: { id: savePaymente.id },
    });
  } catch (error) {
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
    console.log("❌ Erro ao Criar Link de Pagamento:", error);
    return;
  }
};
