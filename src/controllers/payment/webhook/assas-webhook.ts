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

    // 2. LÓGICA DE PRECIFICAÇÃO DO LINK (Cálculo do Objetivo)
    const EFI_PERCENT = 0.0119; // 1.19%
    const CUSTOS_FIXOS = 1.5; // R$ 1,00 seu lucro + R$ 0,50 custo do saque

    // 2. Garantir que os valores do banco sejam números (evita o NaN)
    const valorPagoAgora = Number(pixInfo.valor || 0);
    const valorOriginalDono = Number(paymentLinkData.value || 0);
    const valorObjetivoLink = Number(
      paymentLinkData.targetValue || valorOriginalDono
    );

    // 3. CÁLCULO PROPORCIONAL DO SALDO DO DONO
    // Se o dono quer 200 (original) e o racha é 203.92 (target),
    // a proporção dele é 200 / 203.92 = ~0.98.
    // Cada real que entra, ele ganha 98 centavos.

    const amountForSeller =
      paymentLinkData.taxModel === "absorve"
        ? valorPagoAgora *
          ((valorOriginalDono -
            valorOriginalDono * EFI_PERCENT -
            CUSTOS_FIXOS) /
            valorOriginalDono)
        : valorPagoAgora * (valorOriginalDono / valorObjetivoLink);

    // 4. Verificação de segurança para nunca salvar NaN no banco
    const finalAmountForSeller = isNaN(amountForSeller) ? 0 : amountForSeller;

    // 5. Atualização do saldo no Firebase
    const currentAmountInDb = Number(
      sellerData.docs[0].data().current_amount || 0
    );
    const newSellerAmount = currentAmountInDb + finalAmountForSeller;

    await db
      .collection("users")
      .doc(sellerData.docs[0].id)
      .update({
        current_amount: Number(newSellerAmount.toFixed(2)), // Garante 2 casas decimais e tipo Number
      });

    console.log(
      `💰 Saldo do Dono atualizado: +R$ ${finalAmountForSeller.toFixed(2)}`
    );

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
