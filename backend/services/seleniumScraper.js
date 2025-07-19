const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome.js");
const cheerio = require("cheerio");
const { URL } = require("url");

// Fallback to Puppeteer if Selenium fails
let puppeteer = null;
try {
  puppeteer = require("puppeteer");
} catch (error) {
  console.log("Puppeteer not available, will use Selenium only");
}

class SeleniumScraper {
  constructor() {
    this.visitedUrls = new Set();
    this.driver = null;
    this.maxPages = 1; // Max pages to crawl
    this.timeout = 40000; // 10 seconds timeout
    this.maxHtmlSize = Infinity; // No limit on HTML content size
  }

  async initialize() {
    try {
      // Try Selenium first
      const options = new chrome.Options();
      options.addArguments("--headless");
      options.addArguments("--no-sandbox");
      options.addArguments("--disable-dev-shm-usage");
      options.addArguments("--disable-gpu");
      options.addArguments("--window-size=1920,1080");

      this.driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

      this.usePuppeteer = false;
      console.log("Using Selenium WebDriver");
    } catch (error) {
      // Fallback to Puppeteer
      if (puppeteer) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        this.page = await this.browser.newPage();
        this.usePuppeteer = true;
        console.log("Using Puppeteer as fallback");
      } else {
        throw new Error(
          "No browser automation available. Please install Chrome/Chromium or ensure Puppeteer is available."
        );
      }
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.quit();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawlWebsite(startUrl) {
    try {
      await this.initialize();
      const baseUrl = this.getBaseUrl(startUrl);
      const pages = [];

      await this.crawlPage(startUrl, baseUrl, pages);

      return {
        status: "success",
        pages: pages,
        totalPages: pages.length,
        baseUrl: baseUrl,
      };
    } catch (error) {
      console.error("Crawling error:", error);
      return {
        status: "error",
        error: error.message,
        pages: [],
      };
    } finally {
      await this.close();
    }
  }

  async crawlPage(url, baseUrl, pages, depth = 0) {
    if (
      depth > 1 ||
      pages.length >= this.maxPages ||
      this.visitedUrls.has(url)
    ) {
      return;
    }

    this.visitedUrls.add(url);
    console.log(
      `Crawling: ${url} (depth: ${depth}, page: ${pages.length + 1})`
    );

    try {
      let pageSource;

      if (this.usePuppeteer) {
        // Use Puppeteer
        await this.page.goto(url, {
          waitUntil: "networkidle2",
          timeout: this.timeout,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        pageSource = await this.page.content();
      } else {
        // Use Selenium
        await this.driver.get(url);
        await this.driver.wait(
          until.elementLocated(By.tagName("body")),
          this.timeout
        );

        // Wait for dynamic content to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        pageSource = await this.driver.getPageSource();
      }

      const pageData = this.extractPageData(url, pageSource, baseUrl);
      pages.push(pageData);

      // Find and follow internal links
      const internalLinks = pageData.links.internal;
      for (const link of internalLinks.slice(0, 4)) {
        // Limit to 4 links per page
        if (pages.length >= this.maxPages) break;

        const fullUrl = this.resolveUrl(link, baseUrl);
        if (fullUrl && !this.visitedUrls.has(fullUrl)) {
          await this.crawlPage(fullUrl, baseUrl, pages, depth + 1);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
      // Add error page data
      pages.push({
        url: url,
        html: "",
        metadata: { title: "Error", description: "", keywords: "" },
        headers: {},
        buttons: [],
        links: { internal: [], external: [] },
        error: error.message,
      });
    }
  }

  extractPageData(url, html, baseUrl) {
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: $("title").text().trim() || "",
      description: $('meta[name="description"]').attr("content") || "",
      keywords: $('meta[name="keywords"]').attr("content") || "",
    };

    // Extract headers
    const headers = {};
    for (let i = 1; i <= 6; i++) {
      const headerTexts = [];
      $(`h${i}`).each((index, element) => {
        headerTexts.push($(element).text().trim());
      });
      if (headerTexts.length > 0) {
        headers[`h${i}`] = headerTexts;
      }
    }

    // Extract buttons and clickable elements
    const buttons = [];
    $('button, a[href], input[type="button"], input[type="submit"]').each(
      (index, element) => {
        const $el = $(element);
        const text =
          $el.text().trim() || $el.attr("value") || $el.attr("title") || "";
        const href = $el.attr("href") || "";

        if (text && text.length > 0) {
          buttons.push({
            text: text,
            href: href,
          });
        }
      }
    );

    // Extract links
    const links = { internal: [], external: [] };
    $("a[href]").each((index, element) => {
      const href = $(element).attr("href");
      if (href && href !== "#" && href !== "javascript:void(0)") {
        const fullUrl = this.resolveUrl(href, baseUrl);
        if (fullUrl) {
          if (fullUrl.startsWith(baseUrl)) {
            links.internal.push(href);
          } else {
            links.external.push(fullUrl);
          }
        }
      }
    });

    // Remove duplicates
    links.internal = [...new Set(links.internal)];
    links.external = [...new Set(links.external)];

    // Truncate HTML if too large
    const truncatedHtml =
      html.length > this.maxHtmlSize
        ? html.substring(0, this.maxHtmlSize) + "\n... (truncated)"
        : html;

    return {
      url: url,
      html: truncatedHtml,
      metadata: metadata,
      headers: headers,
      buttons: buttons.slice(0, 15), // Limit buttons
      links: links,
      htmlSize: html.length,
      truncated: html.length > this.maxHtmlSize,
    };
  }

  getBaseUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch (error) {
      return url;
    }
  }

  resolveUrl(href, baseUrl) {
    try {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        return href;
      } else if (href.startsWith("/")) {
        return new URL(href, baseUrl).href;
      } else if (href.startsWith("./") || href.startsWith("../")) {
        return new URL(href, baseUrl).href;
      } else {
        return new URL(href, baseUrl).href;
      }
    } catch (error) {
      return null;
    }
  }
}

module.exports = SeleniumScraper;
