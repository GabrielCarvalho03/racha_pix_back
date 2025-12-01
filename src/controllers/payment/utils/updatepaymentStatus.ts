import { rtdb } from "../../../services/firebase";

type upddatePaymentStatusProps = {
  trackingId: string;
  status: string;
  additionalData?: any;
};

export const updatePaymentStatus = async (props: upddatePaymentStatusProps) => {
  try {
    const updateData = {
      status: props.status,
      lastUpdatedAt: Date.now().toLocaleString(),
      ...props.additionalData,
    };

    await rtdb.ref(`/payments/${props.trackingId}`).update(updateData);
  } catch (err) {
    console.error("Erro ao buscar pagamento por Assas ID:", err);
    throw err;
  }
};
