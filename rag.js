import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { createRequire } from "module";
import { getEmbedding } from "./embeddingService.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

let vectorStore = [];
let isReady = false;

export async function loadAndEmbedPDFs() {
  const items = fs.readdirSync("./rag");

  for (const item of items) {
    const path = `./rag/${item}`;

    const stat = fs.statSync(path);

    if (stat.isDirectory()) continue;

    if (!item.endsWith(".pdf")) continue;

    const buffer = fs.readFileSync(path);
    const data = await pdfParse(buffer);

    const chunks = splitText(data.text, 500);

    for (const chunk of chunks) {
      try {
        const embedding = await getEmbedding(chunk);

        vectorStore.push({
          text: chunk,
          embedding
        });

      } catch (err) {
        console.log("Erro embedding:", err.message);
      }
    }
  }

  isReady = true;
  console.log("PDFs indexados com embeddings");
}

function splitText(text, size = 500) {
  const chunks = [];

  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }

  return chunks;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) return 0;

  return dot / denominator;
}

export async function getContext(question) {
  if (!isReady) {
    return {
      context: null,
      score: 0
    };
  }

  const questionEmbedding = await getEmbedding(question);

  let bestMatch = null;
  let bestScore = -1;

  for (const item of vectorStore) {
    const score = cosineSimilarity(questionEmbedding, item.embedding);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item.text;
    }
  }

  return {
    context: bestMatch,
    score: bestScore
  };
}