import { FastifyReply, FastifyRequest } from "fastify";
import { findPaymentByAsaasId } from "../utils/findPaymentByAssasId";
import { updatePaymentStatus } from "../utils/updatepaymentStatus";
import { efiopay } from "../../../services/efíclient";
import db from "../../../services/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PaymentTracking {
  trackingId: string;
  customerId: string;
  paymentId: string;
  value: number;
  customerName: string;
  customerCpf: string;
  status: string;
  createdAt: number;
  expiresAt: number;
  lastUpdated?: number;
  paymentLinkId: string;
  sellerId: string;
  sellerPixKey: string;
}

export const EfiWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const paymentEvent: any = request.body;
    const pixInfo = paymentEvent.pix[0];

    if (!pixInfo.txid) {
      console.log("❌ TXID não encontrado no webhook");
      return reply.status(400).send({ error: "TXID not found" });
    }

    const paymentByIdData: PaymentTracking | null = await findPaymentByAsaasId(
      pixInfo.txid
    );

    await updatePaymentStatus({
      trackingId: paymentByIdData?.trackingId || "",
      status: "received",
      additionalData: {
        current_amount: pixInfo.valor,
        paymentsConfirmed: [
          {
            name: paymentByIdData?.customerName,
            cpfCnpj: paymentByIdData?.customerCpf,
            created_at: new Date().toISOString(),
            amount: paymentByIdData?.value,
          },
        ],
      },
    });

    const paymentLink = await db
      .collection("paymentsLinks")
      .where("id", "==", paymentByIdData?.paymentLinkId)
      .get();

    if (paymentLink.empty) {
      console.log("❌ Link de pagamento não encontrado.");
      return reply
        .status(404)
        .send({ message: "Link de pagamento não encontrado." });
    }

    const paymentLinkData = paymentLink.docs[0].data();

    const sellerData = await db
      .collection("users")
      .where("id", "==", paymentByIdData?.sellerId)
      .get();

    if (sellerData.empty) {
      console.log("❌ Usuário recebedor não encontrado.");
      return reply
        .status(404)
        .send({ message: "Usuário recebedor não encontrado." });
    }

    const paymentsSnapshotFirestore = await db
      .collection("paymentsLinks")
      .where("id", "==", paymentByIdData?.paymentLinkId)
      .get();

    // 1. Constantes de taxas (Devem ser iguais às da criação do link)
    const EFI_PERCENT = 0.0119; // 1.19%
    const CUSTOS_FIXOS = 1.5; // R$ 1,00 seu lucro + R$ 0,50 saque

    // 2. Extração segura dos dados (Conforme a imagem enviada)
    const valorPagoAgora = Number(pixInfo.valor || 0); // O que o jogador pagou agora
    const valorOriginalDono = Number(paymentLinkData.originalValue || 0); // Campo 'originalValue' da imagem
    const valorMetaLink = Number(paymentLinkData.targetValue || 0); // Campo 'targetValue' da imagem
    const taxModel = paymentLinkData.taxModel; // Pode ser 'passed_value' ou 'absorve'

    let amountForSeller = 0;

    // 3. Lógica de cálculo proporcional
    if (taxModel === "absorve") {
      /** * Se o dono absorve, o racha total é R$ 200.
       * Precisamos tirar a porcentagem do banco e a parte fixa proporcionalmente.
       */
      const proporcaoLimpa =
        (valorOriginalDono - valorOriginalDono * EFI_PERCENT - CUSTOS_FIXOS) /
        valorOriginalDono;
      amountForSeller = valorPagoAgora * proporcaoLimpa;
    } else {
      /** * Se é 'passed_value', o racha total é R$ 203.93.
       * O dono só deve receber a parte proporcional aos R$ 200.
       */
      const proporcaoDono = valorOriginalDono / valorMetaLink;
      amountForSeller = valorPagoAgora * proporcaoDono;
    }

    // 4. Verificação final anti-NaN e atualização
    const finalAmount = isNaN(amountForSeller)
      ? 0
      : Number(amountForSeller.toFixed(2));

    const currentSellerAmount = Number(
      sellerData.docs[0].data().current_amount || 0
    );
    const newSellerAmount = currentSellerAmount + finalAmount;

    await db.collection("users").doc(sellerData.docs[0].id).update({
      current_amount: newSellerAmount,
    });

    console.log(`✅ Saldo atualizado para ${taxModel}: +R$ ${finalAmount}`);

    await db
      .collection("paymentsLinks")
      .doc(paymentsSnapshotFirestore.docs[0].id)
      .update({
        ...paymentsSnapshotFirestore.docs[0].data(),
        current_amount:
          Number(paymentsSnapshotFirestore.docs[0].data().current_amount || 0) +
          Number(pixInfo.valor),
        paymentsConfirmed: [
          ...(paymentsSnapshotFirestore.docs[0].data().paymentsConfirmed || []),
          {
            name: paymentByIdData?.customerName,
            cpfCnpj: paymentByIdData?.customerCpf,
            created_at: new Date().toISOString(),
            amount: paymentByIdData?.value,
          },
        ],
      });
    if (pixInfo.status === "NAO_REALIZADO") {
      console.log("❌ Transação não realizada!");
      console.log("🔍 Detalhes do erro:", pixInfo.gnExtras);
      console.log("📋 Tipo:", pixInfo.tipo);
      console.log("💰 Valor:", pixInfo.valor);
      console.log("🔑 Chave destinatário:", pixInfo.chave);
      console.log("📝 Info pagador:", pixInfo.infoPagador);
    }

    return reply.status(200).send({ message: "Webhook received successfully" });
  } catch (err) {
    console.error("Ocorreu um erro ao processar o webhook:", err);
    reply.status(500).send({ error: "Internal Server Error" });
  }
};
