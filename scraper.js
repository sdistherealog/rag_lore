/**
 * STEP 3 of 6 — scraper.js
 * ------------------------
 * Scrapes lore text from Fandom (MediaWiki-based) wiki pages listed in
 * config.WIKI_SOURCES and saves each page as a plain-text file under
 * data/raw/<game_name>/<page_title>.txt
 *
 * Usage:
 *   node scraper.js
 */
 
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
 
const { WIKI_SOURCES, RAW_DATA_DIR, REQUEST_DELAY_MS } = require("./config");
 
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; LoreResearchBot/1.0; +https://example.com/bot-info)",
};
 
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_");
}
 
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
async function fetchPage(url) {
  try {
    const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return res.data;
  } catch (err) {
    console.error(`  [!] Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}
 
function extractArticleText(html) {
  const $ = cheerio.load(html);
 
  const titleEl = $(".page-header__title").first().length
    ? $(".page-header__title").first()
    : $("h1").first();
  const title = titleEl.text().trim() || "untitled";
 
  const content = $(".mw-parser-output").first();
  if (content.length === 0) {
    return { title, body: "" };
  }
 
  // Remove elements that are not useful article prose
  content
    .find(
      "table, aside, sup.reference, div.toc, style, script, div.navbox, div.gallery, .mw-editsection"
    )
    .remove();
 
  const paragraphs = [];
  content.find("p, h2, h3, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) paragraphs.push(text);
  });
 
  let body = paragraphs.join("\n\n");
  body = body.replace(/\[\d+\]/g, ""); // strip citation markers like [1]
  body = body.replace(/\n{3,}/g, "\n\n").trim();
 
  return { title, body };
}
 
async function scrapeAll() {
  fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
 
  for (const [game, urls] of Object.entries(WIKI_SOURCES)) {
    const gameDir = path.join(RAW_DATA_DIR, slugify(game));
    fs.mkdirSync(gameDir, { recursive: true });
 
    console.log(`\n=== ${game} ===`);
    for (const url of urls) {
      console.log(`Fetching: ${url}`);
      const html = await fetchPage(url);
      if (!html) continue;
 
      const { title, body } = extractArticleText(html);
      if (!body) {
        console.log(`  [!] No article body found for ${url}, skipping.`);
        continue;
      }
 
      const filename = `${slugify(title)}.txt`;
      const filepath = path.join(gameDir, filename);
      const fileContent = `# ${title}\n# Game: ${game}\n# Source: ${url}\n\n${body}`;
      fs.writeFileSync(filepath, fileContent, "utf-8");
 
      console.log(`  Saved -> ${filepath} (${body.length} chars)`);
      await sleep(REQUEST_DELAY_MS);
    }
  }
 
  console.log("\nScraping complete.");
}
 
if (require.main === module) {
  scrapeAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
 
module.exports = { scrapeAll, slugify, extractArticleText };
 