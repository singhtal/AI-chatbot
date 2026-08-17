import { generateEmbeddings, loadJSON } from "./generateEmbeddings";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function dotProduct(a: number[], b: number[]) {
  return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

function cosineSimilarity(a: number[], b: number[]) {
  const product = dotProduct(a, b);

  const aMagnitude = Math.sqrt(
    a.map((value) => value * value).reduce((a, b) => a + b, 0),
  );

  const bMagnitude = Math.sqrt(
    b.map((value) => value * value).reduce((a, b) => a + b, 0),
  );

  return product / (aMagnitude * bMagnitude);
}

async function main() {
  const rl = createInterface({ input, output });

  const movieType = await rl.question("What movie type are you looking for? ");

  rl.close();

  const dataWithEmbeddings = loadJSON<any[]>(
    "data/MoviesDataWithEmbeddings.json",
  );

  const inputEmbedding = await generateEmbeddings(movieType);

  const inputVector = inputEmbedding.embeddings?.[0]?.values;

  if (!inputVector) {
    throw new Error("Failed to generate embedding vector.");
  }

  const similarities: {
    title: string;
    cast: string[];
    similarity: number;
  }[] = [];

  for (const entry of dataWithEmbeddings) {
    if (!entry.embedding) {
      console.log(`Skipping ${entry.title}: no embedding`);
      continue;
    }

    const similarity = cosineSimilarity(entry.embedding, inputVector);

    similarities.push({
      similarity,
      title: entry.title,
      cast: entry.cast,
    });
  }

  const sortedSimilarity = similarities.sort(
    (a, b) => b.similarity - a.similarity,
  );

  console.log(`\nMovies matching "${movieType}":`);

  sortedSimilarity.forEach((movie) => {
    console.log(
      `${movie.title}: ${movie.similarity.toFixed(4)} | Cast: ${movie.cast.join(", ")}`,
    );
  });

  return sortedSimilarity;
}

// main();
