import { rtdb } from "../services/firebase";

export const DisactiveAssistend = async (chatId: string) => {
  const chatRef = rtdb.ref(`chats/${chatId}/isAssistant`);
  await chatRef.set(false);
};
