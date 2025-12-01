import { FastifyReply, FastifyRequest } from "fastify";
import db from "../../services/firebase";
import bcrypt from "bcrypt";

export const LoginUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  try {
    const usersRef = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    const userData = usersRef.docs.map((doc) => doc.data());
    console.log("userData:", userData[0]);

    if (userData.length === 0) {
      reply.status(401).send({
        error: "nenhum usuário encontrado, verifique seu email e senha",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userData[0].password
    );
    if (!isValidPassword) {
      reply.status(401).send({
        error: "senha incorreta, verifique a senha e tente novamente",
      });
      return;
    }

    const token = request.server.jwt.sign(
      {
        userId: userData[0].id,
        email: userData[0].email,
      },
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = userData[0];

    reply.send({
      message: "Login successful",
      data: { ...userWithoutPassword, token },
    });
  } catch (error) {
    reply.status(500).send({ error: "Internal Server Error" });
    return;
  }
};
