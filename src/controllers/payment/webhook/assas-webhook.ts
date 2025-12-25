import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../../services/firebase";

export interface PaymentTracking {
  trackingId: string;
  customerId: string;
  paymentId: string;
  value: number; // Valor total que o jogador pagou
  netValue: number; // Valor líquido que pertence ao dono (calculado no Controller)
  customerName: string;
  customerCpf: string;
  status: string;
  paymentLinkId: string;
  sellerId: string;
}

export const EfiWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const paymentEvent: any = request.body;

    // A Efí pode enviar um array de Pix, pegamos o primeiro
    const pixInfo = paymentEvent.pix?.[0];

    if (!pixInfo || !pixInfo.txid) {
      return reply.status(200).send(); // Retornamos 200 para a Efí não reenviar
    }

    // 1. Busca os dados do pagamento que salvamos na criação (Tracking)
    // Precisamos buscar pelo TXID no Firestore ou Realtime Database
    const paymentSnapshot = await db
      .collection("payments_tracking") // Ou o nome da sua collection de tracking
      .where("txid", "==", pixInfo.txid)
      .get();

    if (paymentSnapshot.empty) {
      console.log("❌ Pagamento não encontrado para o TXID:", pixInfo.txid);
      return reply.status(200).send();
    }

    const paymentData = paymentSnapshot.docs[0].data() as PaymentTracking;

    // 2. Busca o Link de Pagamento e o Vendedor
    const linkRef = db
      .collection("paymentsLinks")
      .doc(paymentData.paymentLinkId);
    const sellerRef = db.collection("users").doc(paymentData.sellerId);

    const [linkDoc, sellerDoc] = await Promise.all([
      linkRef.get(),
      sellerRef.get(),
    ]);

    if (!linkDoc.exists || !sellerDoc.exists) {
      console.log("❌ Link ou Vendedor não encontrado.");
      return reply.status(200).send();
    }

    const currentLinkData = linkDoc.data();
    const currentSellerData = sellerDoc.data();

    // 3. ATUALIZAÇÃO DE SALDOS
    // O valor que entra para o dono é o NET_VALUE (valor sem taxas)
    const newSellerAmount =
      Number(currentSellerData?.current_amount || 0) +
      Number(paymentData.netValue);

    // O valor que entra no link é o valor TOTAL que o jogador pagou (para bater a meta)
    const newLinkAmount =
      Number(currentLinkData?.current_amount || 0) + Number(pixInfo.valor);

    // 4. Executa as atualizações no Firestore
    const batch = db.batch();

    // Atualiza o saldo sacável do dono
    batch.update(sellerRef, { current_amount: newSellerAmount });

    // Atualiza o progresso do Link e adiciona o pagamento confirmado
    const isClosed = newLinkAmount >= (currentLinkData?.targetValue || 0);

    batch.update(linkRef, {
      current_amount: newLinkAmount,
      is_closed: isClosed,
      paymentsConfirmed: [
        ...(currentLinkData?.paymentsConfirmed || []),
        {
          name: paymentData.customerName,
          cpfCnpj: paymentData.customerCpf,
          created_at: new Date().toISOString(),
          amount: pixInfo.valor, // No histórico do link, mostramos o valor cheio que o jogador pagou
        },
      ],
    });

    // Opcional: Atualizar o status do tracking para 'received'
    batch.update(paymentSnapshot.docs[0].ref, { status: "received" });

    await batch.commit();

    console.log(
      `✅ Pix processado! Dono: +R$${paymentData.netValue} | Link: +R$${pixInfo.valor}`
    );

    return reply
      .status(200)
      .send({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Erro no processamento do webhook:", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
