const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3002;
const websitesRouter = require("./routes/websites");
const rankingsRouter = require("./routes/rankings");
const crawlerRouter = require("./routes/crawler");

app.use(cors());
app.use(express.json());

// In-memory data stores
let websites = [];
let pages = [];
let diffs = [];
let rankings = [];

// Always clear and seed default domains and rankings on server start
websites.length = 0;
rankings.length = 0;
const dummyDomains = [
  "example.com",
  "another.com",
  "thirdsite.com",
  "fourthsite.com",
  "fifthsite.com",
];
dummyDomains.forEach((domain, idx) => {
  const id = uuidv4();
  const user_id = uuidv4();
  const newWebsite = { id, domain, user_id };
  websites.push(newWebsite);
  // Add dynamic dummy rank history for this domain
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86400000);
    // Google (search)
    const googleBefore = 20 - idx * 2 + Math.floor(Math.random() * 5) + i;
    const googleAfter = googleBefore - Math.floor(Math.random() * 3);
    rankings.push({
      page_id: id,
      type: "search",
      rank_before: googleBefore,
      rank_after: googleAfter,
      timestamp: new Date(day).toISOString(),
    });
    // LLM
    const llmBefore = 25 - idx * 2 + Math.floor(Math.random() * 5) + i;
    const llmAfter = llmBefore - Math.floor(Math.random() * 3);
    rankings.push({
      page_id: id,
      type: "llm",
      rank_before: llmBefore,
      rank_after: llmAfter,
      timestamp: new Date(day).toISOString(),
    });
  }
});

// Inject stores into routers (after seeding)
websitesRouter.setStores({ websites, rankings });
rankingsRouter.setStores({ rankings });

// GET /api/pages?website_id=...
app.get("/api/pages", (req, res) => {
  const { website_id } = req.query;
  const filtered = pages.filter((p) => p.website_id === website_id);
  res.json(filtered);
});

// POST /api/diff
app.post("/api/diff", (req, res) => {
  const { page_id, diff_json } = req.body;
  const diff = { page_id, diff_json };
  diffs = diffs.filter((d) => d.page_id !== page_id);
  diffs.push(diff);
  res.json(diff);
});

// POST /api/html/upload
app.post("/api/html/upload", (req, res) => {
  const { website_id, url, html_original, html_ai } = req.body;
  const id = uuidv4();
  const page = { id, website_id, url, html_original, html_ai };
  pages.push(page);
  res.json(page);
});

// GET /api/html/diff?id=...
app.get("/api/html/diff", (req, res) => {
  const { id } = req.query;
  const diff = diffs.find((d) => d.page_id === id);
  if (!diff) return res.status(404).json({ error: "Diff not found" });
  res.json(diff);
});

// Use routers
app.use("/api/websites", websitesRouter);
app.use("/api/rankings", rankingsRouter);
app.use("/api/crawler", crawlerRouter);

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
