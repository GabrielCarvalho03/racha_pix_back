import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    jwt: {
      sign: (payload: any, options?: any) => string;
      verify: (token: string) => any;
    };
  }

  interface FastifyRequest {
    user?: any;
    jwtVerify: () => Promise<void>;
  }
}
