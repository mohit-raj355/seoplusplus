const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// In-memory data stores
let websites = [];
let rankings = [];

// Always clear and seed in place
websites.length = 0;
rankings.length = 0;
const dummyDomains = [
  { domain: "example.com", user_id: uuidv4() },
  { domain: "test.com", user_id: uuidv4() },
  { domain: "dummy.com", user_id: uuidv4() },
];
dummyDomains.forEach((site) => {
  const id = uuidv4();
  websites.push({ id, ...site });

  // Add dummy rank history for this domain
  const now = new Date();
  const baseGoogle = Math.floor(Math.random() * 20) + 1;
  const baseLLM = Math.floor(Math.random() * 25) + 1;
  const rankHistory = [
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 5,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 3,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 2,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 1,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle,
      rank_after: baseGoogle,
      timestamp: now.toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 5,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 3,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 2,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 1,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM,
      rank_after: baseLLM,
      timestamp: now.toISOString(),
    },
  ];
  rankings.push(...rankHistory);
});

// Helper to inject stores from main app
router.setStores = (stores) => {
  websites = stores.websites;
  rankings = stores.rankings;
};

// GET /api/websites
router.get("/", (req, res) => {
  res.json(websites);
});

// POST /api/websites
router.post("/", (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });
  const id = uuidv4();
  const user_id = uuidv4();
  const newWebsite = { id, domain, user_id };
  websites.push(newWebsite);

  // Add dummy rank history for this domain
  const now = new Date();
  const baseGoogle = Math.floor(Math.random() * 20) + 1;
  const baseLLM = Math.floor(Math.random() * 25) + 1;
  const rankHistory = [
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 5,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 3,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 2,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle + 1,
      rank_after: baseGoogle,
      timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "search",
      rank_before: baseGoogle,
      rank_after: baseGoogle,
      timestamp: now.toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 5,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 3,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 2,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM + 1,
      rank_after: baseLLM,
      timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      page_id: id,
      type: "llm",
      rank_before: baseLLM,
      rank_after: baseLLM,
      timestamp: now.toISOString(),
    },
  ];
  rankings.push(...rankHistory);

  res.json(newWebsite);
});

module.exports = router;
