import { ChromaClient } from "chromadb";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";
import { GoogleGenAI } from "@google/genai";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

const apiKey = process.env.GEMINI_KEY!;

if (!apiKey) {
  throw new Error("GEMINI_KEY is missing from environment variables.");
}

const chroma = new ChromaClient({
  host: "localhost",
  port: 8080,
});

const ai = new GoogleGenAI({ apiKey });

import { studentInfo, clubInfo, universityInfo } from "./constants"; // Import constants from constants.ts

const embeddingFunction = new GoogleGeminiEmbeddingFunction({
  apiKey: process.env.GEMINI_KEY,
  modelName: "gemini-embedding-2",
});

const collectionName = "personal-infos";

async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction,
  });
}

async function populateCollection() {
  const collection = await getCollection();
  await collection.add({
    documents: [studentInfo, clubInfo, universityInfo],
    ids: ["id1", "id2", "id3"],
  });
}

async function askQuestion(question: string) {
  const collection = await getCollection();

  // 1. Retrieve relevant document via Gemini embeddings
  const result = await collection.query({
    queryTexts: [question],
    nResults: 1,
  });

  const relevantInfo = result.documents[0]?.[0];

  if (relevantInfo) {
    // 2. Generate final answer using Gemini Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer the question based only on the following context:

Context: ${relevantInfo}

Question: ${question}`,
    });

    console.log("\nAnswer:", response.text);
  } else {
    console.log("No relevant information found.");
  }
}

async function main() {
  await populateCollection();

  const rl = createInterface({ input, output });

  const question = await rl.question("\nAsk a question: ");

  rl.close();

  await askQuestion(question);
}

main();
