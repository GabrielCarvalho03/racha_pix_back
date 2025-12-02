"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtdb = exports.db = void 0;
exports.getFirestore = getFirestore;
exports.getDatabase = getDatabase;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let isInitialized = false;
function initializeFirebase() {
    if (isInitialized || firebase_admin_1.default.apps.length > 0)
        return;
    console.log("🔥 Inicializando Firebase...");
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    let serviceAccount;
    if (raw) {
        try {
            const trimmed = raw.trim();
            serviceAccount = trimmed.startsWith("{")
                ? JSON.parse(trimmed)
                : JSON.parse(Buffer.from(trimmed, "base64").toString("utf-8"));
        }
        catch (err) {
            console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:", err);
        }
    }
    const databaseURL = process.env.FIREBASE_DATABASE_URL ||
        "https://finance-350fb-default-rtdb.firebaseio.com";
    if (serviceAccount) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            databaseURL,
        });
    }
    else {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
            databaseURL,
        });
    }
    isInitialized = true;
    console.log("✅ Firebase inicializado");
}
function getFirestore() {
    initializeFirebase();
    return firebase_admin_1.default.firestore();
}
function getDatabase() {
    initializeFirebase();
    return firebase_admin_1.default.database();
}
// Exports para compatibilidade
exports.db = { get: getFirestore };
exports.rtdb = { get: getDatabase };
exports.default = { get: getFirestore };
