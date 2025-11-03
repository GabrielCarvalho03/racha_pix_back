import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import db from "../services/firebase";
import { listProducts } from "../controllers/list";
import openAi from "../services/openAi";
import { training } from "../training/training";
import { AskVerification } from "../training/askVerification";
import { AddMessage } from "../utils/addMessage";
import { createChat } from "../utils/createChat";
import { AskIsComplex } from "../training/askIsCmplex";
import { DisactiveAssistend } from "../utils/disactiveAssistend";

export type ListProducts = {
  product_id: number;
  product_name: string;
  price: string;
  main_image: string;
  video: string | null;
  description: string;
  seller_id: number;
  images: string[];
  related_products: string[] | null;
  options: string[] | null;
  is_current: number;
  payment_methods: string[] | null;
  total_records: number;
  per_page: number;
  current_page: number;
  total_pages: number;
};

export async function productRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "Server is running" };
  });

  app.post("/products", async (request, reply) => {
    const product = request.body;

    try {
      const newProduct = await db.collection("products").add({
        id: "12344",
        name: "Teste",
      });

      return reply.send(newProduct);
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: "Failed to create product" });
      return;
    }
    reply.status(201).send(product);
  });

  //   app.post("/allProduct", async (request, reply) => {
  //     // const { product } = request.body as {
  //     //   product: ListProducts[];
  //     // };

  //     try {
  //       for (let item of listProducts) {
  //         await db.collection("products").add(item);
  //       }

  //       return reply.send({ message: "Products added successfully" });
  //     } catch (error) {
  //       console.log(error);
  //       reply.status(500).send({ error: "Failed to create product" });
  //       return;
  //     }
  //   });

  app.post(
    "/product/:id/:sellerId/:userId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id, sellerId, userId } = request.params as {
        id: string;
        sellerId: string;
        userId: string;
      };
      const { text } = request.body as {
        text: string;
      };

      const chatId = `chat_${userId}_${sellerId}`;
      try {
        await createChat({
          chatId,
          userId,
          sellerId,
        });

        const product = await db
          .collection("products")
          .where("product_id", "==", Number(id))
          .get();
        if (product.empty) {
          return reply.status(404).send({ error: "Product not found" });
        }
        await AddMessage({
          chatId,
          message: text,
          type: "user",
          senderId: userId,
        });

        const askVerificationResponse = await AskVerification({
          text,
          product: product.docs[0].data() as ListProducts,
        });

        if (askVerificationResponse.choices[0].message?.content === "Não") {
          await AddMessage({
            chatId,
            message: "A pergunta não está relacionada ao produto.",
            type: "assistant",
            senderId: sellerId,
          });
          return reply.send({
            response: {
              content: "A pergunta não está relacionada ao produto.",
            },
          });
        }
        const AskIsComplexResponse = await AskIsComplex({
          product: product.docs[0].data() as ListProducts,
          text,
        });
        const isComplexData = JSON.parse(
          AskIsComplexResponse.choices[0].message?.content || "{}"
        );
        if (isComplexData.requires_human || isComplexData.is_complex) {
          await AddMessage({
            chatId,
            message:
              "Vou te passar para um atendente, ele vai saber te explicar direitinho😊",
            senderId: sellerId,
            type: "assistant",
          });

          await DisactiveAssistend(chatId);
          return reply.send({
            response: {
              content:
                "Vou te passar para um atendente, ele vai saber te explicar direitinho😊",
            },
          });
        }
        const response = await openAi.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: training({
                product: product.docs[0].data() as ListProducts,
              }),
            },
            {
              role: "user",
              content: text,
            },
          ],
        });
        await AddMessage({
          chatId,
          message: response.choices[0].message?.content || "",
          type: "assistant",
          senderId: sellerId,
        });
        return reply.send({
          response: response.choices[0].message,
        });
      } catch (error) {
        console.log(error);
      }
    }
  );
}
