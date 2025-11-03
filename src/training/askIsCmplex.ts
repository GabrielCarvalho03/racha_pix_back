import { ListProducts } from "../routes/product.routes";
import openAi from "../services/openAi";

type AskVerificationProps = {
  text: string;
  product: ListProducts;
};

export const AskIsComplex = async ({ text, product }: AskVerificationProps) => {
  return await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Você é um classificador que analisa perguntas de clientes sobre produtos em um marketplace.

Sua tarefa é determinar:
1. Se a pergunta é **complexa** para um assistente automatizado.
2. Se a resposta **pode ser encontrada diretamente** nas informações do produto (JSON).

**Critérios:**
- Uma pergunta é **simples** quando é objetiva e relacionada a dados básicos do produto (ex: preço, cor, tamanho, frete).
- É **complexa** quando envolve comparação, recomendação, contexto de uso, ou múltiplas condições.
- Mesmo uma pergunta simples pode **requerer atendimento humano** se a resposta **não estiver disponível no JSON**.

**Formato da resposta (sempre em JSON):**
{
  "is_complex": boolean,
  "requires_human": boolean,
  "reason": string
}
        `,
      },
      {
        role: "user",
        content: `
Contexto do produto (JSON):
${JSON.stringify(product)}

Pergunta do cliente:
"${text}"
        `,
      },
    ],
    temperature: 0,
  });
};
