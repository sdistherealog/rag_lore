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
 
const fs = require("fs");
const path = require("path");
 
const {
  RAW_DATA_DIR,
  INDEX_DIR,
  INDEX_FILE,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  EMBEDDING_MODEL,
} = require("./config");
 
function chunkText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  const textLen = text.length;
 
  while (start < textLen) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= textLen) break;
    start = end - overlap; // move forward, keeping some overlap
  }
 
  return chunks;
}
 
function walkTxtFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkTxtFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".txt")) {
      results.push(fullPath);
    }
  }
  return results;
}
 
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