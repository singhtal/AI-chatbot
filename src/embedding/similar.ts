import { generateEmbeddings, loadJSON } from "./data";

function dotProduct(a: number[], b: number[]) {
    return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

function cosineSimilarity(a: number[], b: number[]) {
    const product = dotProduct(a, b);

    const aMagnitude = Math.sqrt(a.map(value => value * value).reduce((a, b) => a + b, 0));
    const bMagnitude = Math.sqrt(b.map(value => value * value).reduce((a, b) => a + b, 0));

    return product / (aMagnitude * bMagnitude);
}

async function main() {
    const dataWithEmbeddings = loadJSON('dataWithEmbeddings.json');

    const input = 'insect';

    const inputEmbedding = await generateEmbeddings(input);

    const similaties: {
        input: string,
        similarity: number
    }[] = [];

    for (const entry of dataWithEmbeddings as any) {

        const InputValue = inputEmbedding.embeddings?.[0]?.values;
        if (!InputValue) {
            throw new Error("Failed to generate embedding vector.");
        }
        const similarity = cosineSimilarity(
            entry.embeddings,
            InputValue
        )

        similaties.push({
            input: entry.input,
            similarity
        })
    }

    console.log(`Similarity of ${input} with: `);
    const sortedSimilarity = similaties.sort((a,b) => b.similarity - a.similarity);
    sortedSimilarity.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`)
    })
}

main();