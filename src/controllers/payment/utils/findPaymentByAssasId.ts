import { rtdb } from "../../../services/firebase";
import { PaymentTracking } from "../webhook/assas-webhook";

export const findPaymentByAsaasId = async (
  assasId: string
): Promise<PaymentTracking | null> => {
  try {
    const snapShot = await rtdb
      .ref("/payments")
      .orderByChild("txid")
      .equalTo(assasId)
      .once("value");

    let paymentData = null;
    snapShot.forEach((child) => {
      paymentData = { trackingId: child.key, ...child.val() };
    });
    return paymentData;
  } catch (err) {
    console.error("Erro ao buscar pagamento por Assas ID:", err);
    throw err;
  }
};
