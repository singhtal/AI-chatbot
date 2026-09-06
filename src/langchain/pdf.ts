import {
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    apiKey: process.env.GEMINI_KEY,
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    apiKey: process.env.GEMINI_KEY,
});

const question = "Names of cities in this document?";

async function main() {
    const loader = new PDFLoader(
        "cities.pdf", {
        splitPages: false,
    }
    );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });

    const splittedDocs = await splitter.splitDocuments(docs);

    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(splittedDocs);

    const retriever = vectorStore.asRetriever({
        k: 2,
    });

    const result = await retriever.invoke(question);

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
