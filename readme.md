# Video Game Lore Search (RAG) — Node.js

> **File build order** (each file is labeled with its step number in its
> header comment):
> 1. `config.js` — settings everything else depends on
> 2. `package.json` — dependencies
> 3. `scraper.js` — get raw lore text
> 4. `buildIndex.js` — turn text into a searchable index
> 5. `query.js` — answer questions using the index
> 6. `README.md` — this file, ties it all together

A retrieval-augmented generation (RAG) pipeline for answering questions about
video game lore across multiple games. It scrapes lore pages from Fandom
wikis, embeds and indexes them locally (no API key needed for this part),
and uses Claude to generate grounded answers from the retrieved lore.

## How it works

```
scraper.js      -> pulls article text from wiki pages into data/raw/
buildIndex.js   -> chunks + embeds the text locally, saves a JSON vector index
query.js        -> retrieves relevant chunks and asks Claude to answer
```

Embeddings run locally in Node via `@xenova/transformers` (a JS port of
Hugging Face transformers) using the `all-MiniLM-L6-v2` model — the same
model used in the Python version. Retrieval is a simple, dependency-free
cosine-similarity search over a JSON index, so there's no native vector-DB
binary to compile.

## 1. Setup

Requires **Node.js 18+**.

```bash
npm install
```

Set your Anthropic API key (needed for the answer-generation step):

```bash
export ANTHROPIC_API_KEY="your-key-here"        # macOS/Linux
setx ANTHROPIC_API_KEY "your-key-here"           # Windows
```

## 2. Configure which games/pages to scrape

Edit `config.js` and fill in `WIKI_SOURCES` with the games and Fandom wiki
page URLs you want. Example:

```js
WIKI_SOURCES: {
  "Elden Ring": [
    "https://eldenring.fandom.com/wiki/Marika_the_Eternal",
    "https://eldenring.fandom.com/wiki/Godfrey",
  ],
  "Dark Souls": [
    "https://darksouls.fandom.com/wiki/Gwyn,_Lord_of_Cinder",
  ],
},
```

Add as many games and pages as you like — the more pages, the richer the
lore search will be.

## 3. Scrape the lore

```bash
npm run scrape
```

This saves one `.txt` file per wiki page under `data/raw/<game_name>/`.

## 4. Build the search index

```bash
npm run build-index
```

This chunks all the scraped text, embeds it locally, and saves
`data/index/lore_index.json` containing every chunk's text + embedding
vector. The first run downloads the embedding model (~90MB), which is
then cached for future runs.

## 5. Ask questions

```bash
npm run query
```

or ask a one-off question directly:

```bash
node query.js "Who is Marika the Eternal and how is she connected to the Elden Ring?"
```

Claude will answer using only the lore chunks retrieved from your indexed
wiki pages, and will tell you if it doesn't have enough information.

## Notes & tips

- **Respect the wikis.** The scraper adds a short delay between requests
  (`REQUEST_DELAY_MS` in `config.js`) and identifies itself with a
  User-Agent string. Don't hammer a site with huge page lists.
- **Re-run `npm run build-index`** any time you add more pages/games — it
  rebuilds the whole index from whatever is currently in `data/raw/`.
- **Swap the embedding model** in `config.js` (`EMBEDDING_MODEL`) if you
  want a different tradeoff between speed and accuracy — any
  `feature-extraction` model supported by `@xenova/transformers` will work.
- **Adjust `TOP_K`** in `config.js` to retrieve more or fewer chunks per
  question.
- The vector search here is brute-force cosine similarity, which is fine
  for up to tens of thousands of chunks. For much larger corpora, swap the
  JSON index in `buildIndex.js`/`query.js` for a proper vector DB (e.g.
  `hnswlib-node`, Pinecone, or Qdrant).
- This is built for Fandom/MediaWiki-style wikis. Scraping a differently
  structured site will need small tweaks to `extractArticleText()` in
  `scraper.js`.
