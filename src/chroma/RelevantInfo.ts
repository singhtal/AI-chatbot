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

const studentInfo = `Alexandra Thompson, a 19-year-old computer science sophomore with a 3.7 GPA,
is a member of the programming and chess clubs who enjoys pizza, swimming, and hiking
in her free time in hopes of working at a tech company after graduating from the University of Washington.`;

const clubInfo = `The university chess club provides an outlet for students to come together and enjoy playing
the classic strategy game of chess. Members of all skill levels are welcome, from beginners learning
the rules to experienced tournament players. The club typically meets a few times per week to play casual games,
participate in tournaments, analyze famous chess matches, and improve members' skills.`;

const universityInfo = `The University of Washington, founded in 1861 in Seattle, is a public research university
with over 45,000 students across three campuses in Seattle, Tacoma, and Bothell.
As the flagship institution of the six public universities in Washington state,
UW encompasses over 500 buildings and 20 million square feet of space,
including one of the largest library systems in the world.`;

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
