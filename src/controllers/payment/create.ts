import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import db, { rtdb } from "../../services/firebase";
// import { efiopay } from "../../services/efíclient";

export const createPaymentController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, cpfCnpj, value, paymentLinkId, userId } = request.body as {
    name: string;
    cpfCnpj: string;
    value: number;
    paymentLinkId: string;
    userId: string;
  };

  const trackingId = `payment_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    if (!name || !cpfCnpj || !value || !userId || !paymentLinkId) {
      const missingFields = [];

      if (!name) missingFields.push("name");
      if (!value) missingFields.push("value");
      if (!cpfCnpj) missingFields.push("cpfCnpj");
      if (!userId) missingFields.push("userId");
      if (!paymentLinkId) missingFields.push("paymentLinkId");

      return reply.status(400).send({
        error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
        missingFields: missingFields,
      });
    }

    if (!paymentLinkId) {
      return reply.status(400).send({
        message: `Link de pagamento não fornecido`,
      });
    }

    const existPaymentLink = await db
      .collection("paymentsLinks")
      .where("id", "==", paymentLinkId)
      .get();

    if (existPaymentLink.empty) {
      return reply
        .status(404)
        .send({ error: "Link de pagamento não encontrado" });
    }

    const infoUser = await db
      .collection("users")
      .where("id", "==", userId)
      .get();

    if (infoUser.empty) {
      return reply
        .status(404)
        .send({ message: "Usuário recebedor não encontrado." });
    }
    // Criar cobrança PIX na EFí
    const pixBody = {
      calendario: {
        expiracao: 900, // 15 minutos (900 segundos)
      },
      valor: {
        original: value.toFixed(2),
      },
      chave: "5d2d7d7d-ec6c-4ceb-b58c-6341e1204937",
      solicitacaoPagador: "Pagamento PIX",
      devedor: {
        nome: name,
        cpf: cpfCnpj.replace(/\D/g, ""),
      },
      infoAdicionais: [
        {
          nome: "Tracking ID",
          valor: trackingId,
        },
      ],
    };
    // const pixResponse = await efiopay.pixCreateImmediateCharge([], pixBody);

    // Gerar QR Code
    let qrCodeData = null;
    // if (pixResponse.loc && pixResponse.loc.id) {
    //   const qrCodeResponse = await efiopay.pixGenerateQRCode({
    //     id: pixResponse.loc.id,
    //   });
    //   qrCodeData = qrCodeResponse;
    // }

    // await rtdb.ref(`/payments/${trackingId}`).set({
    //   txid: pixResponse.txid,
    //   paymentLinkId: existPaymentLink.docs[0].data().id ?? "",
    //   status: pixResponse.status,
    //   value: value,
    //   customerName: name,
    //   customerCpf: cpfCnpj,
    //   sellerId: userId,
    //   sellerPixKey: infoUser.docs[0].data().pixKey ?? "",
    //   description: "Pagamento PIX",
    //   createdAt: new Date().toISOString(),
    //   expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
    // });

    // return reply.status(201).send({
    //   message: "Pagamento Pix criado com sucesso",
    //   trackingId: trackingId,
    //   txid: pixResponse.txid,
    //   pixData: {
    //     qrcode: qrCodeData?.qrcode,
    //     imagemQrcode: qrCodeData?.imagemQrcode,
    //     valor: value.toFixed(2),
    //     status: pixResponse.status,
    //   },
    // });

    return reply.status(201).send({
      message: "Pagamento Pix criado com sucesso",
      trackingId: trackingId,
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Erro interno no servidor" });
  }
};
