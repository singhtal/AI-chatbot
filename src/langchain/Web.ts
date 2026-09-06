import {
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    apiKey: process.env.GEMINI_KEY,
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_KEY,
});

const question = "what does nagarro do?";

async function main() {

    const loader = new CheerioWebBaseLoader('https://www.nagarro.com/en/services/digital-engineering');
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    });

    const splittedDocs = await splitter.splitDocuments(docs);



    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(splittedDocs);

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
