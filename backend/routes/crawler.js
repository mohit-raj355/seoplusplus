const express = require("express");
const CrawlController = require("../controllers/crawlController");

const router = express.Router();

// POST /crawl - Start website crawling
router.post("/crawl", CrawlController.crawlWebsite);

// GET /crawl/status - Get crawler status
router.get("/crawl/status", CrawlController.getCrawlStatus);

module.exports = router;
