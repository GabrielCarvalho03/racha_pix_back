import path from "path";
import EfiPay from "sdk-node-apis-efi";
import os from "os";
import fs from "fs";

let efiopay: EfiPay | null = null;

function initializeEfiPay(): EfiPay {
  if (efiopay) return efiopay;

  console.log("🚀 Inicializando EFI Pay client...");

  const isDevelopment = process.env.NODE_ENV !== "production";
  const isVercel = process.env.VERCEL === "1";

  let cert: string, key: string;

  if (isDevelopment && !isVercel) {
    // DESENVOLVIMENTO LOCAL: usar arquivo físico
    const certFile = path.resolve(__dirname, "../certificates/prod.pem");

    if (!fs.existsSync(certFile)) {
      throw new Error(`Certificate file not found: ${certFile}`);
    }

    cert = certFile;
    key = certFile;
    console.log("📁 Usando arquivo físico (desenvolvimento)");
  } else {
    // PRODUÇÃO/VERCEL: usar variáveis de ambiente
    if (!process.env.EFI_CERT_PEM || !process.env.EFI_PRIVATE_KEY_PEM) {
      throw new Error(
        "EFI_CERT_PEM e EFI_PRIVATE_KEY_PEM são obrigatórios para produção"
      );
    }

    const tmpDir = os.tmpdir();
    const combinedPath = path.join(tmpDir, `efi-combined-${Date.now()}.pem`);
    const combinedContent = `${process.env.EFI_CERT_PEM}\n${process.env.EFI_PRIVATE_KEY_PEM}`;

    fs.writeFileSync(combinedPath, combinedContent, "utf-8");
    cert = combinedPath;
    key = combinedPath;
    console.log("☁️ Certificados criados para produção");
  }

  efiopay = new EfiPay({
    sandbox: false,
    client_id: process.env.EFI_CLIENT_ID!,
    client_secret: process.env.EFI_SECRET_KEY!,
    certificate: cert,
    pemKey: key,
  });

  console.log("✅ EFI Pay client inicializado");
  return efiopay;
}

export function getEfiPayClient(): EfiPay {
  return initializeEfiPay();
}
