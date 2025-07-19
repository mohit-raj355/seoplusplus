# 📜 Product Requirements Document (PRD)

**Project Title:** SEO++
**Last Updated:** July 17, 2025

---

## ✅ Product Overview

### Purpose

To help webmasters and SEO professionals visualize and optimize their site’s HTML for both traditional search engines and AI answer engines. The tool enables:

- Side-by-side diffing of original vs AI-optimized HTML
- Highlighted changes (red = removed, green = added)
- Tracking of before/after rankings in both search engines and LLMs

### Users

- SEO professionals
- Content marketers
- Technical writers / site maintainers
- Agencies managing multiple websites

---

## ⚙️ Key Features

User will enter the website link and click for check SEO optimization for google searcha ndf LLM based search

### 1. SEO-Aware HTML Diff Viewer

- Side-by-side comparison of raw HTML
- Syntax highlighting
- Line-based diff (additions in green, deletions in red)
- GitHub PR-style layout

### 2. Search + LLM Rank Dashboard

- Compare rankings before and after applying AI suggestions
- Separate ranking for:
  - Google/Bing/Yandex (traditional search)
  - LLM search (ChatGPT, Perplexity, Tavily)
- Filter by domain and time range
- Graphs and tables showing performance over time

---

## 💻 Frontend Requirements

### A. SEO Diff Viewer UI

- Split screen layout
- Toolbar options:
  - Toggle inline / side-by-side
  - Export diff (JSON / HTML)
  - Copy updated HTML
- Color Key:
  - 🔴 Red = removed
  - 🟩 Green = added
- Optional: Monaco Editor integration

### B. Dashboard UI

- Domain selector (dropdown)
- Key metric cards:
  - Google Rank (Before/After)
  - LLM Rank (Before/After)
- Line graph showing historical rank trend
- Page-level table:
  - URL
  - Rank before
  - Rank after
  - Delta
- Clicking on a row shows HTML diff view for that page

---

## 🛠️ Backend Requirements

### A. API Endpoints

```
GET /api/websites
GET /api/pages?website_id=...
GET /api/rankings?page_id=...
POST /api/diff
POST /api/html/upload
GET /api/html/diff?id=...
```

### B. Data Models

#### Website

```json
{
  "id": "uuid",
  "domain": "example.com",
  "user_id": "uuid"
}
```

#### Page

```json
{
  "id": "uuid",
  "website_id": "uuid",
  "url": "/about",
  "html_original": "<html>...</html>",
  "html_ai": "<html>...</html>"
}
```

#### Diff

```json
{
  "page_id": "uuid",
  "diff_json": [
    { "line": 14, "change": "removed", "content": "<title>Old Title</title>" },
    {
      "line": 14,
      "change": "added",
      "content": "<title>New Optimized Title</title>"
    }
  ]
}
```

#### Rankings

```json
{
  "page_id": "uuid",
  "type": "search" | "llm",
  "rank_before": 12,
  "rank_after": 4,
  "timestamp": "2025-07-17T00:00:00Z"
}
```

---

## 🔌 AI Integration

- Assumed AI already provides optimized HTML
- Ranking Simulation:
  - Query LLM APIs with prompts to check if content is cited
  - Use OpenAI embeddings to compare before/after semantic match

---

## 📊 Non-Functional Requirements

| Category      | Requirement                                      |
| ------------- | ------------------------------------------------ |
| Performance   | Diff in <1s for pages <2k lines                  |
| Scalability   | Support for 100+ domains and 10k+ pages          |
| Security      | Role-based access, data isolation per user       |
| Auditability  | HTML versions & rankings timestamped             |
| Accessibility | WCAG AA support, high contrast for diff coloring |

---

## ⚠️ Edge Cases & Risk Management

| Edge Case                                  | Strategy                             |
| ------------------------------------------ | ------------------------------------ |
| LLM doesn’t cite content even after update | Use semantic similarity fallback     |
| Google rate limits API usage               | Implement caching + retry            |
| Minified/obfuscated HTML                   | Use formatter before diffing         |
| JS-rendered pages                          | Use Puppeteer to get rendered HTML   |
| HTML too large                             | Collapse unchanged regions in viewer |

---

## 📈 V2 Feature Ideas

- A/B Test runner for SEO impact
- Push updates to live site (if connected)
- Chrome Extension for live overlay
- Prompt optimizer for AI visibility
- Real-time alerts on LLM citation changes
