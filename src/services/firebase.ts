import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// FIREBASE_SERVICE_ACCOUNT_JSON pode ser:
// - JSON bruto (começa com '{')
// - ou Base64 do JSON
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let serviceAccount: any | undefined;

if (raw) {
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
      serviceAccount = JSON.parse(trimmed);
    } else {
      // decodifica base64
      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err) {
    console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    serviceAccount = undefined;
  }
}

const databaseURL =
  process.env.FIREBASE_DATABASE_URL ||
  "https://finance-350fb-default-rtdb.firebaseio.com";

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  } else {
    // fallback: usa credenciais padrão do ambiente (GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL,
    });
  }
}

export const db = admin.firestore();
export const rtdb = admin.database();
export default db;
