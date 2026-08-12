import { ChromaClient } from "chromadb";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";

const client = new ChromaClient({
  host: "localhost",
  port: 8080,
});

const embeddingFunction = new GoogleGeminiEmbeddingFunction({
  apiKey: process.env.GEMINI_KEY,
  modelName: "gemini-embedding-2",
});

async function createCollection() {
  const response = await client.getOrCreateCollection({
    name: "data-test2",
  });

  console.log(response);
}

async function addData() {
  await createCollection();
  const collection = await client.getCollection({
    name: "data-test2",
    embeddingFunction: embeddingFunction,
  });

  await collection.add({
    ids: ["id1"],
    documents: ["Here is my emtry"],
    embeddings: [[0.1, 0.2]],
  });

  const result = await collection.get();

  console.log(result);
}

// addData();
