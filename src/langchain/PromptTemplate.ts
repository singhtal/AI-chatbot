import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { from } from "node:stream/iter";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.8,
  // maxOutputTokens: 700,
  verbose: false,
  apiKey: process.env.GEMINI_KEY,
});

async function fromTemplate() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description about the following product: ${product_name}",
  );

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    product_name: "bicycle",
  });

  console.log(response.content);
}

// fromTemplate();

async function fromMessage() {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "write a short description for the product provided by the user",
    ],
    ["human", "{product_name}"],
  ]);

  const chain = prompt.pipe(model);

  const result = await chain.invoke({
    product_name: "car",
  });

  console.log(result.content);
}

fromMessage();
