import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const googleAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY,
});

export function loadJSON<T>(fileName: string): T {
  const path = join(__dirname, fileName);
  const rawData = readFileSync(path);
  return JSON.parse(rawData.toString());
}

function saveDataToJSON(data: any, fileName: string) {
  const dataString = JSON.stringify(data, null, 2);
  const path = join(__dirname, fileName);
  writeFileSync(path, dataString);
  console.log(`Saved data to ${fileName}`);
}

export async function generateEmbeddings(input: string) {
  const formattedInput = `task: movie similarity | query: ${input}`;

  const response = await googleAi.models.embedContent({
    model: "gemini-embedding-2",
    contents: formattedInput,
  });

  return response;
}

async function main() {
  const data = loadJSON<any[]>("data/movies_list.json");

  const dataWithEmbeddings = await Promise.all(
    data.map(async (movie) => {
      const text = `
                        title: ${movie.title}
                        genres: ${movie.genres.join(", ")}
                        cast: ${movie.cast.join(", ")}
                        `;

      const response = await generateEmbeddings(
        `task: sentence similarity | query: ${text}`,
      );

      return {
        ...movie,
        embedding: response.embeddings?.[0]?.values,
      };
    }),
  );

  saveDataToJSON(dataWithEmbeddings, "MoviesDataWithEmbeddings.json");
}

// main();
