import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import { format } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const createPaymentsLink = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { title, value, date, storeId, paymentId } = request.body as {
    title: string;
    value: number; // Valor que o dono quer receber (ex: 200.00)
    date: string;
    storeId: string;
    paymentId: string;
  };

  try {
    // 1. Busca o dono da arena (Estabelecimento)
    const existsSeller = await db
      .collection("users")
      .where("id", "==", storeId)
      .get();

    if (existsSeller.empty || !storeId) {
      return reply.status(400).send({
        error: "Estabelecimento não encontrado.",
      });
    }

    const userData = existsSeller.docs[0].data();
    const taxModel = userData.taxModel ?? "absorve"; // Padrão: Repassar para o jogador

    // 2. LÓGICA DE PRECIFICAÇÃO DO LINK (Cálculo do Objetivo)
    const EFI_PERCENT = 0.0119; // 1.19%
    const FIXED_COSTS = 1.5; // Seu lucro (1.00) + Custo de Saque (0.50)

    let targetValue: number;

    if (taxModel === "passed_value") {
      /**
       * Cálculo para o dono receber o valor CHEIO.
       * Ex: Para receber 200,00 limpos, o racha total deve ser ~203,92.
       */
      targetValue = (value + FIXED_COSTS) / (1 - EFI_PERCENT);
    } else {
      /**
       * O dono absorve a taxa. O objetivo do racha é o valor exato da quadra.
       * No final, ele receberá menos que os 200,00 pois a taxa sairá do montante.
       */
      targetValue = value;
    }

    // 3. Salva o link de pagamento com o targetValue calculado
    const savePaymente = await db.collection("paymentsLinks").add({
      id: paymentId,
      storeId,
      title,
      taxModel, // Salva o modelo usado na criação para histórico
      originalValue: value, // Valor pretendido pelo dono
      targetValue: parseFloat(targetValue.toFixed(2)), // Objetivo real do racha (com ou sem taxa)
      date: date ?? "",
      current_amount: 0, // Quanto já foi pago até agora
      is_closed: false,
      createdAt: new Date(),
      paymentsConfirmed: [],
    });

    return reply.status(201).send({
      message: "Link de pagamento criado com sucesso",
      data: {
        id: savePaymente.id,
        targetValue: targetValue.toFixed(2), // Retorna o valor final para o frontend
      },
    });
  } catch (error) {
    console.log("❌ Erro ao Criar Link de Pagamento:", error);
    return reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
  }
};
