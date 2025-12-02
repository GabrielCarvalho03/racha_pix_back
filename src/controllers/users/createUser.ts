import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export const createUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { email, password, name, phone } = request.body as {
    name: string;
    phone: string;
    email: string;
    password: string;
  };

  try {
    const userExists = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    console.log(
      "userExists",
      userExists.docs.map((doc) => doc.data())
    );

    if (!userExists.empty) {
      return reply
        .status(400)
        .send({ error: "Já existe um usuário com este email" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = uuid();

    const usersRef = await db.collection("users").add({
      id: userId,
      name,
      phone: phone ?? "",
      email,
      password: hashedPassword,
    });

    const userData = {
      id: userId,
      name,
      phone: phone ?? "",
      email,
    };

    const token = request.server.jwt.sign(
      {
        userId: userId,
        email,
      },
      { expiresIn: "24h" }
    );

    return reply.send({
      message: "Usuário criado com sucesso",
      data: { ...userData, token },
      userId: usersRef.id,
    });
  } catch (error) {
    reply.status(500).send({ error: "Internal Server Error" });
    return;
  }
};
