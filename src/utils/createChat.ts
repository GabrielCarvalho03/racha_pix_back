import { rtdb } from "../services/firebase";

type createChatProps = {
  chatId: string;
  userId: string;
  sellerId: string;
};

export const createChat = async ({
  chatId,
  userId,
  sellerId,
}: createChatProps) => {
  const chatRef = rtdb.ref(`chats/${chatId}`);
  const snapshot = await chatRef.once("value");

  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    const newChat = {
      chatId,
      isAssistant: true,
      participants: [userId, sellerId],
      messages: {},
    };

    await chatRef.set(newChat);
    console.log("Chat criado:", newChat);
    return newChat;
  }
};
