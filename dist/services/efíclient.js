"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.efiopay = void 0;
const path_1 = __importDefault(require("path"));
const sdk_node_apis_efi_1 = __importDefault(require("sdk-node-apis-efi"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
function getCertificatePaths() {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const isVercel = process.env.VERCEL === "1";
    console.log(`🌍 Ambiente: ${isDevelopment ? "DESENVOLVIMENTO" : "PRODUÇÃO"}`);
    console.log(`☁️ Vercel: ${isVercel ? "SIM" : "NÃO"}`);
    if (isDevelopment && !isVercel) {
        // DESENVOLVIMENTO LOCAL: usar arquivo físico original
        const certFile = path_1.default.resolve(__dirname, "../certificates/prod.pem");
        if (!fs_1.default.existsSync(certFile)) {
            throw new Error(`Certificate file not found: ${certFile}`);
        }
        console.log("📁 Usando arquivo físico original (desenvolvimento)");
        console.log("📄 Arquivo:", certFile);
        // Para o SDK EFI, usar o mesmo arquivo para cert e key
        // pois ele consegue extrair ambos do arquivo completo
        return {
            cert: certFile,
            key: certFile, // Mesmo arquivo - o SDK EFI extrai automaticamente
        };
    }
    // PRODUÇÃO OU VERCEL: usar variáveis de ambiente
    if (!process.env.EFI_CERT_PEM || !process.env.EFI_PRIVATE_KEY_PEM) {
        throw new Error("EFI_CERT_PEM e EFI_PRIVATE_KEY_PEM são obrigatórios para produção");
    }
    console.log("🔧 Usando variáveis de ambiente (produção/vercel)");
    // Criar arquivo temporário combinado (como o original)
    const tmpDir = os_1.default.tmpdir();
    const combinedPath = path_1.default.join(tmpDir, `efi-combined-${Date.now()}.pem`);
    // Combinar certificado + chave no mesmo arquivo (formato original)
    const combinedContent = `${process.env.EFI_CERT_PEM}\n${process.env.EFI_PRIVATE_KEY_PEM}`;
    try {
        fs_1.default.writeFileSync(combinedPath, combinedContent, "utf-8");
        console.log("✅ Arquivo combinado criado:");
        console.log("📄 Path:", combinedPath);
        console.log("📊 Tamanho:", fs_1.default.statSync(combinedPath).size, "bytes");
        return {
            cert: combinedPath,
            key: combinedPath, // Mesmo arquivo - como era originalmente
        };
    }
    catch (error) {
        console.error("❌ Erro ao criar arquivo combinado:", error);
        throw error;
    }
}
// Inicializar EFI Pay
let efiopay;
try {
    console.log("🚀 Inicializando EFI Pay client...");
    const { cert, key } = getCertificatePaths();
    exports.efiopay = efiopay = new sdk_node_apis_efi_1.default({
        sandbox: false, // PRODUÇÃO
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_SECRET_KEY,
        certificate: cert,
        pemKey: key,
    });
    console.log("✅ EFI Pay client inicializado com sucesso!");
}
catch (error) {
    console.error("❌ Falha ao inicializar EFI Pay client:", error);
    throw error;
}
