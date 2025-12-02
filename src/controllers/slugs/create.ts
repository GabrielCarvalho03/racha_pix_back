import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import { v4 as uuid } from "uuid";

export const createSlug = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { slug } = request.body as {
    slug: string;
  };
  const paymentId = uuid();
  try {
    const slugExists = await db
      .collection("slugs")
      .where("slug", "==", slug)
      .get();

    if (!slugExists.empty) {
      return reply
        .status(400)
        .send({ error: "Já existe um link com este titulo" });
    }

    const newSlug = await db.collection("slugs").add({
      slug,
      paymentId,
    });

    return reply.status(201).send({ id: newSlug.id, slug, paymentId });
  } catch (error) {
    console.error("Error creating slug:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno no servidor, tente novamente mais tarde." });
  }
};
