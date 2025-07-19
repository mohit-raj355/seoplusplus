# 📄 Product Requirements Document (PRD)

## 🧩 Project Title:

**Website Crawler API (Backend in Node.js + Express + Selenium)**

---

## 📌 Objective

Develop a backend service that takes a website URL as input and uses **Selenium** to recursively scrape all accessible pages of the website. The service should return structured information for each page including:

- Page HTML
- Meta tags
- Header tags
- Button texts and their associated links
- Internal/external links
- Other visible elements of significance

---

## 🛠️ Tech Stack

- **Node.js** (JavaScript runtime)
- **Express.js** (Web server framework)
- **Selenium WebDriver** (for headless browser automation)
- **Cheerio** (optional, for HTML parsing)
- **Puppeteer** (optional fallback for rendering issues)
- **Redis** or **in-memory Set** (to avoid crawling duplicate URLs)

---

## 🔌 API Design

### `POST /crawl`

**Description**: Triggers the website crawler for a given URL.

#### Request Body:

```json
{
  "url": "https://example.com"
}

response structure

{
  "status": "success",
  "pages": [
    {
      "url": "https://example.com",
      "html": "<!DOCTYPE html> ...",
      "metadata": {
        "title": "Home",
        "description": "...",
        "keywords": "..."
      },
      "headers": {
        "h1": ["Welcome"],
        "h2": ["Our Services"]
      },
      "buttons": [
        {
          "text": "Learn More",
          "href": "/learn-more"
        }
      ],
      "links": {
        "internal": ["/about", "/contact"],
        "external": ["https://twitter.com/example"]
      }
    }
  ]
}


 Functional Requirements
Input Validation

Validate the format of the input URL.

Ensure the URL is reachable.

Page Rendering

Use Selenium (headless Chrome/Firefox) to render pages.

Wait for DOM to fully load (configurable timeout).

Content Extraction

Extract and store:

Full HTML

<title>, <meta> tags

All <h1> to <h6> tags

Button texts (<button>, clickable <a>)

Internal and external links

Recursive Navigation

Follow internal links to crawl all accessible pages.

Prevent loops via a visited URL cache.

Optional: respect robots.txt

Configurable depth/page limit.

Performance Optimization

Headless sessions with timeout.

Cache visited URLs.

Optional: throttle requests to avoid being blocked.

Error Handling

Handle invalid URLs, timeouts, and JS errors.

Return partial results if some pages fail.

🧪 Non-Functional Requirements
Scalability: Handle large websites with many internal links.

Extensibility: Add screenshot support, async content loading.

Security: Sanitize inputs to avoid SSRF and injection.

Observability: Log visited URLs, errors, durations.

📈 Optional Enhancements
Export to CSV/JSON

Live dashboard to show crawling progress

Visual sitemap generation

Auth & rate limiting support


suggested file structure

/crawler-backend
├── /controllers
│   └── crawlController.js
├── /services
│   └── seleniumScraper.js
├── /routes
│   └── crawler.js
├── app.js
├── package.json


example flow

User sends POST /crawl with URL https://example.com

Backend uses Selenium to load the page

Extracts metadata, headers, links, and buttons

Recursively visits internal links

Responds with full crawl data in JSON
```
