const SeleniumScraper = require("../services/seleniumScraper");

class CrawlController {
  static async crawlWebsite(req, res) {
    try {
      const { url } = req.body;

      // Input validation
      if (!url) {
        return res.status(400).json({
          status: "error",
          error: "URL is required",
        });
      }

      // Ensure URL has protocol
      let normalizedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        normalizedUrl = `https://${url}`;
      }

      // Validate URL format after adding protocol
      try {
        new URL(normalizedUrl);
      } catch (error) {
        return res.status(400).json({
          status: "error",
          error: "Invalid URL format",
        });
      }

      console.log(`Starting crawl for: ${normalizedUrl}`);

      // Initialize scraper and start crawling
      const scraper = new SeleniumScraper();
      const result = await scraper.crawlWebsite(normalizedUrl);

      if (result.status === "error") {
        return res.status(500).json(result);
      }

      // Return successful response
      res.json({
        status: "success",
        pages: result.pages,
        totalPages: result.totalPages,
        baseUrl: result.baseUrl,
        crawledAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Crawl controller error:", error);
      res.status(500).json({
        status: "error",
        error: "Internal server error during crawling",
        details: error.message,
      });
    }
  }

  static async getCrawlStatus(req, res) {
    // This could be extended to show real-time crawling progress
    res.json({
      status: "idle",
      message: "Crawler service is running",
    });
  }
}

module.exports = CrawlController;
