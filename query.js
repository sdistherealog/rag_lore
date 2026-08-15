/**
 * STEP 5 of 6 — query.js
 * ----------------------
 * Interactive RAG query loop over the video game lore index.
 *
 * For each question:
 *   1. Embeds the question with the same local model used to build the index.
 *   2. Computes cosine similarity against every stored chunk and takes the
 *      top-k matches.
 *   3. Sends those chunks + the question to Claude, asking it to answer
 *      using only the provided lore context.
 *
 * Requires the ANTHROPIC_API_KEY environment variable to be set:
 *   export ANTHROPIC_API_KEY="your-key-here"
 *
 * Usage:
 *   node query.js
 *   node query.js "Who is Marika the Eternal?"
 */
 
//built in file system of the node js used to read the file
const fs = require("fs");
//path module to work with the path of the file
const path = require("path");
//readline is used to read the filename from the file
const readline = require("readline");
//it is used to read the user input from the terminal line by line
const Anthropic = require("@anthropic-ai/sdk");
 //necessary imports from the config file
const { INDEX_FILE, EMBEDDING_MODEL, TOP_K, CLAUDE_MODEL } = require("./config");
 //The prompt which tells the AI model to perform a necessary task
const SYSTEM_PROMPT = `You are a video game lore expert. Answer the user's \
question using ONLY the lore excerpts provided in the context below. \
If the context doesn't contain enough information to answer, say so \
honestly instead of guessing. Cite which game each piece of information \
comes from when relevant. Keep answers clear and well-organized.`;
 
function cosineSim(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both vectors are already normalized, so dot product == cosine similarity
}
 
class LoreRAG {
  constructor() {
    if (!fs.existsSync(INDEX_FILE)) {
      throw new Error(
        "Index not found. Run buildIndex.js first (after running scraper.js)."
      );
    }
    //get the index filed data
    const raw = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
    //extracting records array from the index file
    this.records = raw.records;
    //initialises an instance for claude to work , also checks for anthropic keys
    this.client = new Anthropic();
    //it is used to load the embedding model so that subsequent loads can be avoided
    this.extractorPromise = null;
  }
 //initialises the embedding model into the extractor promise
  async getExtractor() {
    if (!this.extractorPromise) {
      const { pipeline } = await import("@xenova/transformers");
      this.extractorPromise = pipeline("feature-extraction", EMBEDDING_MODEL);
    }
    return this.extractorPromise;
  }
 //it is used to convert texts into embedding vector
  async embedQuery(text) {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
  //comparing vectors on the basis of their similarity
  async retrieve(question, topK = TOP_K) {
    const queryVec = await this.embedQuery(question);
    const scored = this.records.map((r) => ({
      ...r,
      score: cosineSim(queryVec, r.embedding),
    }));
 
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
  //function to answer questions given by user to the AI model
  async answer(question) {
    const chunks = await this.retrieve(question);
 
    if (chunks.length === 0) {
      return "No relevant lore was found in the index for that question.";
    }
 
    const contextBlocks = chunks.map(
      (c) =>
        `[Game: ${c.game} | Source: ${path.basename(c.sourceFile)} | Relevance: ${c.score.toFixed(
          2
        )}]\n${c.text}`
    );
    const context = contextBlocks.join("\n\n---\n\n");
 
    const userMessage = `Context:\n${context}\n\nQuestion: ${question}`;
 
    const response = await this.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
 
    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
  }
}
 
async function main() {
  const rag = new LoreRAG();
  /**
   * args contains the query from the command line prompt 
   * It is sliced such that the main context is brought into attention
   */
  const args = process.argv.slice(2);
 
  if (args.length > 0) {
    const question = args.join(" ");
    console.log(`\nQ: ${question}\n`);
    console.log(await rag.answer(question));
    return;
  }
 
  console.log("Video Game Lore RAG — type a question, or 'quit' to exit.\n");
 
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () =>
    new Promise((resolve) => rl.question("Q: ", resolve));
 
  while (true) {
    const question = (await ask()).trim();
    if (["quit", "exit"].includes(question.toLowerCase())) break;
    if (!question) continue;
    console.log();
    console.log(await rag.answer(question));
    console.log();
  }
 
  rl.close();
}
 
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
 
module.exports = { LoreRAG };
 