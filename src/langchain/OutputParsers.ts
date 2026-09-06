import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  CommaSeparatedListOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.8,
  // maxOutputTokens: 700,
  verbose: false,
  apiKey: process.env.GEMINI_KEY,
});

async function stringParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description about the following product: ${product_name}",
  );

  const parser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    product_name: "bicycle",
  });

  console.log(response);
}

async function commaParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Provide the first 5 ingredients, separated by commas, for: ${word}",
  );

  const parser = new CommaSeparatedListOutputParser();

  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    word: "bread",
  });

  console.log(response);
}

// commaParser();

async function structuredParser() {
  const templatePrompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase.
        Formatting instructions: {format_instructions}
        Phrase: {phrase}
    `);

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    name: "the name of the person",
    likes: "what the person likes",
  });

  const chain = templatePrompt.pipe(model).pipe(outputParser);

  const response = await chain.invoke({
    phrase: "John likes pineapple pizza",
    format_instructions: outputParser.getFormatInstructions(),
  });

  console.log(response);
}

structuredParser();
