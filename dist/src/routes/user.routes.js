"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = AuthRoute;
const auth_validate_1 = require("../controllers/users/auth-validate");
const getUserById_1 = require("../controllers/users/getUserById");
const update_user_1 = require("../controllers/users/update-user");
const createUser_1 = require("../controllers/users/createUser");
const loginUser_1 = require("../controllers/users/loginUser");
async function AuthRoute(app) {
    app.get("/user/:id", getUserById_1.getUserById);
    app.put("/user/edit/:userId", update_user_1.updateUser);
    app.post("/register", createUser_1.createUser);
    app.post("/login", loginUser_1.LoginUser);
    app.post("/auth/validate", auth_validate_1.authValidate);
}
