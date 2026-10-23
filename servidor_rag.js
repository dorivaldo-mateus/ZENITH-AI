import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { loadAndEmbedPDFs, getContext } from "./rag.js";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

await loadAndEmbedPDFs();

 export async function askAI(question, context = "") {
  const prompt = context
    ? `Usa este contexto para responder:\n\n${context}\n\nPergunta: ${question}`
    : question;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "És um professor virtual chamado ZENITH." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Pergunta não fornecida"
      });
    }

    // Procurar contexto nos PDFs
    const { context, score } = await getContext(question);

    console.log("Score:", score);
    console.log("Contexto encontrado:", context);

    // Enviar pergunta + contexto para a IA
    const answer = await perguntarIa(question, context);

    res.json({
      question,
      answer,
      usedRAG: score > 0.6,
      score
    });

  } catch (error) {
    console.error("Erro no /ask:", error);

    res.status(500).json({
      error: "Erro ao processar pergunta"
    });
  }
});