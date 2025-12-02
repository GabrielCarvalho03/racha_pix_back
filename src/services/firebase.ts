import admin from "firebase-admin";

let isInitialized = false;

function initializeFirebase() {
  if (isInitialized || admin.apps.length > 0) return;

  console.log("🔥 Inicializando Firebase...");

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let serviceAccount: any | undefined;

  if (raw) {
    try {
      const trimmed = raw.trim();
      serviceAccount = trimmed.startsWith("{")
        ? JSON.parse(trimmed)
        : JSON.parse(Buffer.from(trimmed, "base64").toString("utf-8"));
    } catch (err) {
      console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    }
  }

  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ||
    "https://finance-350fb-default-rtdb.firebaseio.com";

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL,
    });
  }

  isInitialized = true;
  console.log("✅ Firebase inicializado");
}

export function getFirestore() {
  initializeFirebase();
  return admin.firestore();
}

export function getDatabase() {
  initializeFirebase();
  return admin.database();
}

// Exports para compatibilidade
export const db = { get: getFirestore };
export const rtdb = { get: getDatabase };
export default { get: getFirestore };
