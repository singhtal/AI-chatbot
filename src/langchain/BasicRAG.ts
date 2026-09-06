import { GoogleGenAI } from "@google/genai";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2",
  apiKey: process.env.GEMINI_KEY,
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_KEY,
});

const myData = [
  "My name is john",
  "My name is Bob",
  "My favorite food is pizza",
  "My favorite food is pasta",
];

const question = "what are my favorite foods?";

async function main() {
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(
    myData.map((content) => new Document({ pageContent: content })),
  );

  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  const result = await retriever._getRelevantDocuments(question);

  const resultDocs = result.map((result) => result.pageContent);

  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Asnwer the users question based on the following context: {context}",
    ],
    ["user", "{input}"],
  ]);

  const chain = template.pipe(model);

  const response = await chain.invoke({
    input: question,
    context: resultDocs,
  });

  console.log(response.content);
}

main();
