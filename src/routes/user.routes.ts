import { FastifyInstance } from "fastify";
import { authValidate } from "../controllers/users/auth-validate";
import { getUserById } from "../controllers/users/getUserById";
import { updateUser } from "../controllers/users/update-user";
import { createUser } from "../controllers/users/createUser";
import { LoginUser } from "../controllers/users/loginUser";
import { ChangePassword } from "../controllers/users/change-password";

export async function AuthRoute(app: FastifyInstance) {
  app.get("/user/:id", getUserById);
  app.put("/user/edit/:userId", updateUser);
  app.post("/register", createUser);
  app.post("/login", LoginUser);
  app.post("/auth/validate", authValidate);
  app.post("/change-password", ChangePassword);
}
