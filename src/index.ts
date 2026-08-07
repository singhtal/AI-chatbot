import {GoogleGenAI} from '@google/genai'

const googleAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY
})

async function main() {
  const response = await googleAi.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You respond like a cool bro in a json format. like this: { coolnessLevel: 1-10, answer: your answer }",
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "How tall is Mount Everest?",
          },
        ],
      },
    ],
  });

  console.log(response.text);
}

main();