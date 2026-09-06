import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.8,
    // maxOutputTokens: 700,
    verbose: false,
    apiKey: process.env.GEMINI_KEY,
})

async function main() {
    // const response1 = await model.invoke(
    //     'Give me 4 good books to read'
    // );


    // const response2 = await model.batch([
    //     'Hello',
    //     'Give me 4 good books to read'
    // ]);

    const response3 = await model.stream('Give me 4 good books to read');

    for await(const chunk of response3) {
        console.log(chunk.content);
    }

}

main();