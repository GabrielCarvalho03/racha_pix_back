"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const user_routes_1 = require("./routes/user.routes");
const paymentsLink_routes_1 = require("./routes/paymentsLink.routes");
const payments_routes_1 = require("./routes/payments.routes");
console.log("🚀 Iniciando aplicação Fastify...");
const app = (0, fastify_1.default)({
    logger: process.env.NODE_ENV === "development",
});
// Registrar plugins (forma mais rápida)
app.register(require("@fastify/jwt"), {
    secret: process.env.JWT_SECRET || "your-secret-key-here",
});
app.register(Promise.resolve().then(() => __importStar(require("@fastify/formbody"))));
app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    try {
        const json = JSON.parse(body);
        done(null, json);
    }
    catch (err) {
        done(err, undefined);
    }
});
app.register(require("@fastify/cors"), {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
});
// Health check ANTES das rotas pesadas
app.get("/", async (request, reply) => {
    return {
        message: "API Racha Pix funcionando!",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    };
});
// Rotas (registrar por último)
app.register(user_routes_1.AuthRoute);
app.register(payments_routes_1.PaymentsRoutes);
app.register(paymentsLink_routes_1.PaymentsLinkRoutes);
console.log("✅ Aplicação configurada");
// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
    const start = async () => {
        try {
            const PORT = Number(process.env.PORT) || 3000;
            await app.listen({ port: PORT, host: "0.0.0.0" });
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        }
        catch (err) {
            console.error("❌ Error starting server:", err);
            process.exit(1);
        }
    };
    start();
}
// Export para Vercel
exports.default = app;
