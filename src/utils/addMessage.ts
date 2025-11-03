import { rtdb } from "../services/firebase";

type AddMessageProps = {
  chatId: string;
  senderId: string;
  message: string;
  type: "user" | "seller" | "assistant";
};

export const AddMessage = async (props: AddMessageProps) => {
  const { chatId, message, type, senderId } = props;

  const chatRef = rtdb.ref(`chats/${chatId}/messages`);
  const newMessageRef = chatRef.push();
  await newMessageRef.update({
    id: newMessageRef.key,
    senderId,
    type,
    message,
    timestamp: Date.now(),
  });
};
