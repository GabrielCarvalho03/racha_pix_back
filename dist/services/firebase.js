"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtdb = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// FIREBASE_SERVICE_ACCOUNT_JSON pode ser:
// - JSON bruto (começa com '{')
// - ou Base64 do JSON
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let serviceAccount;
if (raw) {
    try {
        const trimmed = raw.trim();
        if (trimmed.startsWith("{")) {
            serviceAccount = JSON.parse(trimmed);
        }
        else {
            // decodifica base64
            const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
            serviceAccount = JSON.parse(decoded);
        }
    }
    catch (err) {
        console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:", err);
        serviceAccount = undefined;
    }
}
const databaseURL = process.env.FIREBASE_DATABASE_URL ||
    "https://finance-350fb-default-rtdb.firebaseio.com";
if (!firebase_admin_1.default.apps.length) {
    if (serviceAccount) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            databaseURL,
        });
    }
    else {
        // fallback: usa credenciais padrão do ambiente (GOOGLE_APPLICATION_CREDENTIALS)
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
            databaseURL,
        });
    }
}
exports.db = firebase_admin_1.default.firestore();
exports.rtdb = firebase_admin_1.default.database();
exports.default = exports.db;
