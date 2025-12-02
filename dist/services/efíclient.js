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
function getEfiPayClient() {
    if (efiopay)
        return efiopay;
    console.log("🚀 Inicializando EFI Pay client (lazy)...");
    const isDevelopment = process.env.NODE_ENV !== "production";
    const isVercel = process.env.VERCEL === "1";
    let cert, key;
    if (isDevelopment && !isVercel) {
        const certFile = path_1.default.resolve(__dirname, "../certificates/prod.pem");
        if (!fs_1.default.existsSync(certFile)) {
            throw new Error(`Certificate file not found: ${certFile}`);
        }
        cert = certFile;
        key = certFile;
        console.log("📁 Usando arquivo físico");
    }
    else {
        if (!process.env.EFI_CERT_PEM || !process.env.EFI_PRIVATE_KEY_PEM) {
            throw new Error("EFI certificates missing");
        }
        const tmpDir = os_1.default.tmpdir();
        const combinedPath = path_1.default.join(tmpDir, `efi-${Date.now()}.pem`);
        const content = `${process.env.EFI_CERT_PEM}\n${process.env.EFI_PRIVATE_KEY_PEM}`;
        fs_1.default.writeFileSync(combinedPath, content, "utf-8");
        cert = combinedPath;
        key = combinedPath;
        console.log("☁️ Certificados criados");
    }
    efiopay = new sdk_node_apis_efi_1.default({
        sandbox: false,
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_SECRET_KEY,
        certificate: cert,
        pemKey: key,
    });
    console.log("✅ EFI Pay inicializado");
    return efiopay;
}
// Remove a inicialização imediata - só carrega quando necessário
// export { efiopay }; // Remover esta linha
