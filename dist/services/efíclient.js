"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEfiPayClient = getEfiPayClient;
const path_1 = __importDefault(require("path"));
const sdk_node_apis_efi_1 = __importDefault(require("sdk-node-apis-efi"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
let efiopay = null;
function initializeEfiPay() {
    if (efiopay)
        return efiopay;
    console.log("🚀 Inicializando EFI Pay client...");
    const isDevelopment = process.env.NODE_ENV !== "production";
    const isVercel = process.env.VERCEL === "1";
    let cert, key;
    if (isDevelopment && !isVercel) {
        // DESENVOLVIMENTO LOCAL: usar arquivo físico
        const certFile = path_1.default.resolve(__dirname, "../certificates/prod.pem");
        if (!fs_1.default.existsSync(certFile)) {
            throw new Error(`Certificate file not found: ${certFile}`);
        }
        cert = certFile;
        key = certFile;
        console.log("📁 Usando arquivo físico (desenvolvimento)");
    }
    else {
        // PRODUÇÃO/VERCEL: usar variáveis de ambiente
        if (!process.env.EFI_CERT_PEM || !process.env.EFI_PRIVATE_KEY_PEM) {
            throw new Error("EFI_CERT_PEM e EFI_PRIVATE_KEY_PEM são obrigatórios para produção");
        }
        const tmpDir = os_1.default.tmpdir();
        const combinedPath = path_1.default.join(tmpDir, `efi-combined-${Date.now()}.pem`);
        const combinedContent = `${process.env.EFI_CERT_PEM}\n${process.env.EFI_PRIVATE_KEY_PEM}`;
        fs_1.default.writeFileSync(combinedPath, combinedContent, "utf-8");
        cert = combinedPath;
        key = combinedPath;
        console.log("☁️ Certificados criados para produção");
    }
    efiopay = new sdk_node_apis_efi_1.default({
        sandbox: false,
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_SECRET_KEY,
        certificate: cert,
        pemKey: key,
    });
    console.log("✅ EFI Pay client inicializado");
    return efiopay;
}
function getEfiPayClient() {
    return initializeEfiPay();
}
