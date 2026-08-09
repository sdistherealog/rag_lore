/**
 * STEP 4 of 6 — buildIndex.js
 * ---------------------------
 * Reads every .txt file under data/raw/, splits it into overlapping chunks,
 * embeds the chunks locally with @xenova/transformers (no API key needed),
 * and saves a JSON vector index for fast similarity search at query time.
 *
 * Saves:
 *   data/index/lore_index.json -> { records: [{ game, sourceFile, chunkId, text, embedding }] }
 *
 * Usage:
 *   node buildIndex.js
 */
 //the fs module for reading file in node js 
const fs = require("fs");
// the path module for file path
const path = require("path");
 // importing all the necessary constants from config file for rag pipeline to work
const {
  RAW_DATA_DIR,
  INDEX_DIR,
  INDEX_FILE,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  EMBEDDING_MODEL,
} = require("./config");
 //function to chunk text information taken by the scrappera
function chunkText(text, chunkSize, overlap) {
  //empty chunk array to store the chunks of text
  const chunks = [];
  let start = 0;
  const textLen = text.length;
 
  while (start < textLen) {
    //assigning the end until which chunking is to be done
    const end = start + chunkSize;
    //chunking the text for getting the appropiate chunk
    const chunk = text.slice(start, end).trim();
    //push the chunks into the chunk array 
    if (chunk) chunks.push(chunk);
    if (end >= textLen) break;
    start = end - overlap; // move forward, keeping some overlap
  }
 //return the chunk array
  return chunks;
}
 
function walkTxtFiles(dir) {
  // initialising a result array to add all the text file address like data/raw/skyrim/lore1.txt
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // fullPath is the path formed by joining the directory path with the entry's own name
    // e.g. dir = "data/raw", entry.name = "skyrim" -> fullPath = "data/raw/skyrim"
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // if it's a folder, recursively search everything inside it  to find all the text files inside it
      results = results.concat(walkTxtFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".txt")) {
      // if it's a file AND its name ends in .txt, add its path to results
      results.push(fullPath);
    }
  }
  // results now contains every .txt file path found anywhere under the original dir
  return results;
}
 // the load document takes the path of the .txt files  where it displays the name of the game , the source file and the text content of the file
function loadDocuments() {
  if (!fs.existsSync(RAW_DATA_DIR)) return [];
  const files = walkTxtFiles(RAW_DATA_DIR);
  return files.map((filepath) => ({
    game: path.basename(path.dirname(filepath)),
    sourceFile: filepath,
    text: fs.readFileSync(filepath, "utf-8"),
  }));
}
 
function normalize(vec) {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return Array.from(vec, (v) => v / norm);
}
 
async function embedTexts(texts) {
  // Lazy-loaded because @xenova/transformers is an ESM package
  const { pipeline } = await import("@xenova/transformers");
  const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
 
  const embeddings = [];
  for (let i = 0; i < texts.length; i++) {
    const output = await extractor(texts[i], { pooling: "mean", normalize: true });
    embeddings.push(Array.from(output.data));
    if ((i + 1) % 10 === 0 || i === texts.length - 1) {
      process.stdout.write(`\r  Embedded ${i + 1}/${texts.length} chunks`);
    }
  }
  process.stdout.write("\n");
  return embeddings;
}
 
async function buildIndex() {
  fs.mkdirSync(INDEX_DIR, { recursive: true });
 
  const docs = loadDocuments();
  if (docs.length === 0) {
    console.log(`No documents found in ${RAW_DATA_DIR}. Run scraper.js first.`);
    return;
  }
 
  console.log(`Loaded ${docs.length} documents. Chunking...`);
 
  const chunkRecords = [];
  for (const doc of docs) {
    const chunks = chunkText(doc.text, CHUNK_SIZE, CHUNK_OVERLAP);
    chunks.forEach((chunk, i) => {
      chunkRecords.push({
        game: doc.game,
        sourceFile: doc.sourceFile,
        chunkId: i,
        text: chunk,
      });
    });
  }
 
  console.log(
    `Created ${chunkRecords.length} chunks. Loading embedding model ` +
      `'${EMBEDDING_MODEL}' (first run downloads the model)...`
  );
 
  const texts = chunkRecords.map((r) => r.text);
  const embeddings = await embedTexts(texts);
 
  chunkRecords.forEach((record, i) => {
    record.embedding = normalize(embeddings[i]);
  });
 
  fs.writeFileSync(
    INDEX_FILE,
    JSON.stringify({ records: chunkRecords }, null, 2),
    "utf-8"
  );
 
  console.log(`\nIndex built with ${chunkRecords.length} vectors.`);
  console.log(`Saved index -> ${INDEX_FILE}`);
}
 
if (require.main === module) {
  buildIndex().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
 
module.exports = { buildIndex, chunkText };