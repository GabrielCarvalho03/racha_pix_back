import { ListProducts } from "../routes/product.routes";
import openAi from "../services/openAi";

type AskVerificationProps = {
  text: string;
  product: ListProducts;
};

export const AskVerification = async ({
  text,
  product,
}: AskVerificationProps) => {
  return await openAi.chat.completions.create({
    model: "gpt-4o-mini", // se possível, mais confiável pra classificação
    messages: [
      {
        role: "system",
        content: `
Você é um classificador de perguntas feitas por clientes sobre produtos em um marketplace.

Sua tarefa é verificar **se a pergunta está relacionada ao produto informado**.

**Critérios:**
- Uma pergunta está **relacionada ao produto** se:
  - menciona o próprio produto (nome, preço, descrição, funcionamento, etc.)
  - trata de suas características (cor, tamanho, modelo, material, voltagem, compatibilidade, etc.)
  - envolve **condições de compra do produto** (ex: preço, desconto, atacado/varejo, forma de pagamento, parcelamento, frete, garantia, estoque)
  - pede recomendação, comparação ou avaliação envolvendo o produto
- Uma pergunta **não está relacionada** se:
  - fala sobre assuntos administrativos do site (login, cadastro, política de devolução, suporte técnico, entregas genéricas, etc.)
  - menciona outro produto ou tema totalmente fora do contexto

**Responda no formato JSON:**
{
  "related": boolean,
  "reason": string
}
        `,
      },
      {
        role: "user",
        content: `
Produto (JSON): ${JSON.stringify(product)}
Pergunta do cliente: "${text}"
        `,
      },
    ],
    temperature: 0,
  });
};
