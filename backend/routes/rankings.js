const express = require("express");
const router = express.Router();

let rankings = [];

router.setStores = (stores) => {
  rankings = stores.rankings;
};

// GET /api/rankings?website_id=...
router.get("/", (req, res) => {
  const { website_id } = req.query;
  if (!website_id)
    return res.status(400).json({ error: "website_id is required" });
  const filtered = rankings.filter((r) => r.page_id === website_id);
  res.json(filtered);
});

module.exports = router;
