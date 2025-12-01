import { FastifyReply, FastifyRequest } from "fastify";

export const authValidate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token } = request.body as {
      token: string;
    };
    if (!token) {
      return reply.status(400).send({
        error: "Token de autenticação não fornecido.",
      });
    }

    const decoded = request.server.jwt.verify(token);
    // Converter timestamp para data legível
    const expirationDate = new Date(decoded.exp * 1000); // exp vem em segundos, precisa converter para milliseconds
    const now = new Date();
    const isExpired = now > expirationDate;

    if (isExpired) {
      return reply.status(401).send({
        error: "Token expirado.",
      });
    }

    // Token é válido, retornar dados do usuário
    reply.send({
      message: "Token válido",
      data: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        isValid: true,
        expiredAt: isExpired,
      },
    });
  } catch (error) {
    console.error("❌ Erro na validação de autenticação:", error);
    reply.status(500).send({
      error: "Ocorreu um erro inesperado, tente novamente mais tarde.",
    });
  }
};
