import React, { useState, useEffect } from "react";
import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import { useCrawl } from "../contexts/CrawlContext";
import { useNavigate } from "react-router-dom";

// Generate a long HTML diff for demo (about 300 lines)
const originalLines = [
  "<html>",
  "  <head>",
  "    <title>Old Title</title>",
  '    <meta name="description" content="Old description">',
  '    <meta name="keywords" content="seo, old, test">',
  "  </head>",
  "  <body>",
  "    <h1>Welcome</h1>",
  "    <p>This is the original HTML.</p>",
  "    <ul>",
];
for (let i = 1; i <= 120; i++) {
  originalLines.push(`      <li>Old Feature ${i}</li>`);
}
originalLines.push(
  "    </ul>",
  "    <footer>Contact us at old@email.com</footer>",
  "  </body>",
  "</html>"
);

const aiLines = [
  "<html>",
  "  <head>",
  "    <title>New Optimized Title</title>",
  '    <meta name="description" content="AI-optimized description for better SEO and LLMs">',
  '    <meta name="keywords" content="seo, ai, optimized, test">',
  '    <meta property="og:title" content="New Optimized Title">',
  '    <meta property="og:description" content="AI-optimized description for social sharing">',
  "  </head>",
  "  <body>",
  "    <h1>Welcome to the AI-Optimized Page</h1>",
  "    <p>This is the AI-optimized HTML for SEO++ demo.</p>",
  "    <ul>",
];
for (let i = 1; i <= 120; i++) {
  aiLines.push(`      <li>Optimized Feature ${i}</li>`);
}
aiLines.push(
  "      <li>New Feature 121</li>",
  "      <li>New Feature 122</li>",
  "    </ul>",
  "    <section>",
  "      <h2>Why Optimize for LLMs?</h2>",
  "      <p>AI answer engines use your HTML differently than traditional search engines.</p>",
  "    </section>",
  "    <footer>Contact us at new@email.com</footer>",
  "  </body>",
  "</html>"
);

// Create unified diff string
function createUnifiedDiff(orig, ai) {
  let diff = "--- Original.html\n+++ AI-Optimized.html\n";
  diff += "@@ -1," + orig.length + " +1," + ai.length + " @@\n";
  for (let i = 0; i < Math.max(orig.length, ai.length); i++) {
    if (orig[i] !== ai[i]) {
      if (orig[i] !== undefined) diff += "-" + orig[i] + "\n";
      if (ai[i] !== undefined) diff += "+" + ai[i] + "\n";
    } else if (orig[i] !== undefined) {
      diff += " " + orig[i] + "\n";
    }
  }
  return diff;
}

const exampleDiff = createUnifiedDiff(originalLines, aiLines);

export default function DiffViewer({
  diff = exampleDiff,
  originalHtml = "",
  aiHtml = "",
}) {
  const [viewMode, setViewMode] = useState("side-by-side");
  const [pageData, setPageData] = useState(null);
  const [currentDiff, setCurrentDiff] = useState(diff);
  const [currentOriginalHtml, setCurrentOriginalHtml] = useState(originalHtml);
  const [currentAiHtml, setCurrentAiHtml] = useState(aiHtml);
  const navigate = useNavigate();
  const {
    pageToOptimize,
    clearPageToOptimize,
    isOptimizing,
    optimizationData,
    crawlResults,
    scoreData,
  } = useCrawl();

  // Proper HTML formatter for readable diff display
  const formatHtmlForDiff = (html) => {
    if (!html) return "";

    let formatted = html
      // Add line breaks after important tags for readability
      .replace(/(<\/html>)/gi, "$1\n")
      .replace(/(<html[^>]*>)/gi, "$1\n")
      .replace(/(<\/head>)/gi, "$1\n")
      .replace(/(<head[^>]*>)/gi, "$1\n")
      .replace(/(<\/body>)/gi, "$1\n")
      .replace(/(<body[^>]*>)/gi, "$1\n")
      .replace(/(<\/title>)/gi, "$1\n")
      .replace(/(<title[^>]*>)/gi, "$1\n")
      .replace(/(<meta[^>]*>)/gi, "$1\n")
      .replace(/(<link[^>]*>)/gi, "$1\n")
      .replace(/(<script[^>]*>)/gi, "$1\n")
      .replace(/(<\/script>)/gi, "$1\n")
      .replace(/(<style[^>]*>)/gi, "$1\n")
      .replace(/(<\/style>)/gi, "$1\n")
      // Add line breaks after major content tags
      .replace(/(<\/div>)/gi, "$1\n")
      .replace(/(<div[^>]*>)/gi, "$1\n")
      .replace(/(<\/p>)/gi, "$1\n")
      .replace(/(<p[^>]*>)/gi, "$1\n")
      .replace(/(<\/h[1-6]>)/gi, "$1\n")
      .replace(/(<h[1-6][^>]*>)/gi, "$1\n")
      .replace(/(<\/section>)/gi, "$1\n")
      .replace(/(<section[^>]*>)/gi, "$1\n")
      .replace(/(<\/article>)/gi, "$1\n")
      .replace(/(<article[^>]*>)/gi, "$1\n")
      .replace(/(<\/header>)/gi, "$1\n")
      .replace(/(<header[^>]*>)/gi, "$1\n")
      .replace(/(<\/footer>)/gi, "$1\n")
      .replace(/(<footer[^>]*>)/gi, "$1\n")
      .replace(/(<\/nav>)/gi, "$1\n")
      .replace(/(<nav[^>]*>)/gi, "$1\n")
      .replace(/(<\/main>)/gi, "$1\n")
      .replace(/(<main[^>]*>)/gi, "$1\n")
      // Clean up excessive newlines but preserve structure
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/^\s*\n/, "")
      .replace(/\n\s*$/, "");

    return formatted;
  };

  // Generate AI-optimized HTML based on the original (format-preserving)
  const generateAiOptimizedHtml = (originalHtml, metadata) => {
    // Work line by line to preserve formatting exactly
    const lines = originalHtml.split("\n");

    const optimizedLines = lines.map((line) => {
      let optimizedLine = line;

      // Only optimize title tag if it exists and we have metadata
      if (metadata?.title && line.includes("<title>")) {
        const newTitle = `${metadata.title} - AI Optimized`;
        optimizedLine = line.replace(
          /<title>[^<]*<\/title>/gi,
          `<title>${newTitle}</title>`
        );
      }

      // Only update meta description if it already exists
      if (line.includes('name="description"')) {
        const aiDescription =
          "AI-optimized content for better LLM search rankings";
        optimizedLine = line.replace(
          /<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*>/gi,
          `<meta name="description" content="${aiDescription}">`
        );
      }

      return optimizedLine;
    });

    return optimizedLines.join("\n");
  };

  useEffect(() => {
    console.log("DiffViewer useEffect triggered:", {
      pageToOptimize,
      optimizationData,
    });

    // Check if we have page data from crawl results
    if (pageToOptimize) {
      setPageData(pageToOptimize);

      // If we have optimization data, use the optimized HTML from optimizationData
      if (optimizationData) {
        console.log("Using optimization data for diff:", optimizationData);

        const formattedOriginal = formatHtmlForDiff(
          optimizationData.original_html
        );
        const formattedOptimized = formatHtmlForDiff(
          optimizationData.optimized_html
        );

        const originalLines = formattedOriginal.split("\n");
        const optimizedLines = formattedOptimized.split("\n");

        const newDiff = createUnifiedDiff(originalLines, optimizedLines);

        setCurrentDiff(newDiff);
        setCurrentOriginalHtml(formattedOriginal);
        setCurrentAiHtml(formattedOptimized);

        console.log("Diff created with optimization data");
      } else if (pageToOptimize.optimizedHtml) {
        // Fallback to pageToOptimize.optimizedHtml if available
        console.log("Using pageToOptimize.optimizedHtml for diff");

        const formattedOriginal = formatHtmlForDiff(
          pageToOptimize.originalHtml
        );
        const formattedOptimized = formatHtmlForDiff(
          pageToOptimize.optimizedHtml
        );

        const originalLines = formattedOriginal.split("\n");
        const optimizedLines = formattedOptimized.split("\n");

        const newDiff = createUnifiedDiff(originalLines, optimizedLines);

        setCurrentDiff(newDiff);
        setCurrentOriginalHtml(formattedOriginal);
        setCurrentAiHtml(formattedOptimized);

        console.log("Diff created with pageToOptimize data");
      } else {
        // Fallback to generating AI-optimized version from the formatted original
        console.log("Using fallback AI generation for diff");

        const formattedOriginal = formatHtmlForDiff(
          pageToOptimize.originalHtml
        );
        const aiOptimized = generateAiOptimizedHtml(
          formattedOriginal,
          pageToOptimize.metadata
        );

        const originalLines = formattedOriginal.split("\n");
        const aiLines = aiOptimized.split("\n");

        const newDiff = createUnifiedDiff(originalLines, aiLines);

        setCurrentDiff(newDiff);
        setCurrentOriginalHtml(formattedOriginal);
        setCurrentAiHtml(aiOptimized);

        console.log("Diff created with fallback generation");
      }

      // Don't clear pageToOptimize immediately - let it persist for the diff display
      // clearPageToOptimize();
    }
  }, [pageToOptimize, optimizationData]);

  // Monitor optimization state changes
  useEffect(() => {
    console.log("DiffViewer - Optimization state changed:", {
      isOptimizing,
      optimizationData,
    });
  }, [isOptimizing, optimizationData]);

  // Cleanup effect - clear pageToOptimize when component unmounts or when we have optimization data
  useEffect(() => {
    return () => {
      if (optimizationData) {
        console.log("Cleaning up pageToOptimize data");
        clearPageToOptimize();
      }
    };
  }, [optimizationData, clearPageToOptimize]);

  // Show loading state if optimizing
  console.log("DiffViewer - isOptimizing:", isOptimizing);
  if (isOptimizing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: "#0a0e1a",
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(56, 139, 253, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 75% 25%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 25% 75%, rgba(34, 211, 238, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.04) 0%, transparent 40%)
          `,
        }}
      >
        {/* Enhanced atmospheric layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-purple-950/20"></div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-l from-purple-500/5 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl animate-float-slow"></div>
        </div>

        <div className="relative z-10 text-center px-6 py-8 max-w-4xl mx-auto">
          <div className="mb-12">
            <h1
              className="text-4xl md:text-6xl font-bold mb-8 tracking-[-0.02em] relative"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              <span className="text-white/95">AI</span>
              <span className="text-blue-400 ml-2">Optimization</span>
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide mb-8"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Enhancing your content for LLM search engines...
            </p>
          </div>

          {/* Loading animation */}
          <div className="mb-12">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-8"></div>
              <div
                className="absolute inset-0 w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "2s",
                }}
              ></div>
            </div>
            <p className="text-lg text-gray-400 font-medium">
              Analyzing content structure...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>

          {/* Progress indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div
              className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-6"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Content Analysis
              </h3>
              <p className="text-gray-400 text-sm">
                Analyzing HTML structure and content
              </p>
            </div>

            <div
              className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-6"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">AI Enhancement</h3>
              <p className="text-gray-400 text-sm">
                Optimizing for LLM search engines
              </p>
            </div>

            <div
              className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-6"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Score Calculation
              </h3>
              <p className="text-gray-400 text-sm">
                Calculating optimization improvements
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Toolbar actions
  const handleExport = (type) => {
    if (type === "json") {
      const json = JSON.stringify(
        {
          diff: currentDiff,
          original_html: currentOriginalHtml,
          ai_optimized_html: currentAiHtml,
          page_info: pageData,
        },
        null,
        2
      );
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diff.json";
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === "html") {
      const diffHtml = html(currentDiff, {
        inputFormat: "diff",
        showFiles: false,
        matching: "lines",
        outputFormat: viewMode,
        drawFileList: false,
        highlight: true,
      });
      const fullHtml = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Diff HTML Export</title><link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css'></head><body>${diffHtml}</body></html>`;
      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diff.html";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    // Use currentAiHtml if available (from crawl results), otherwise fall back to aiHtml prop
    const htmlToCopy = currentAiHtml || aiHtml;

    if (htmlToCopy) {
      navigator.clipboard.writeText(htmlToCopy);
      alert("AI HTML copied to clipboard!");
    } else {
      // If no AI HTML is available, generate it from the example aiLines
      const exampleAiHtml = aiLines.join("\n");
      navigator.clipboard.writeText(exampleAiHtml);
      alert("AI HTML copied to clipboard!");
    }
  };

  console.log("Rendering diff with:", {
    currentDiff: currentDiff ? currentDiff.substring(0, 200) + "..." : "null",
    currentOriginalHtml: currentOriginalHtml
      ? currentOriginalHtml.substring(0, 100) + "..."
      : "null",
    currentAiHtml: currentAiHtml
      ? currentAiHtml.substring(0, 100) + "..."
      : "null",
  });

  const diffHtml = html(currentDiff, {
    drawFileList: false,
    matching: "lines",
    outputFormat: viewMode,
    synchronisedScroll: true,
    highlight: true,
    fileListToggle: false,
    fileListStartVisible: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                HTML Diff Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Compare original HTML with AI-optimized version
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === "side-by-side"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setViewMode("line-by-line")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === "line-by-line"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Line by Line
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExport("json")}
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                aria-label="Export diff as JSON"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport("html")}
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                aria-label="Export diff as HTML"
              >
                Export HTML
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-green-500 text-white border border-green-500 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm"
                aria-label="Copy AI HTML"
              >
                Copy AI HTML
              </button>

              <span className="ml-2 text-xs text-gray-500">
                🔴 Removed &nbsp; 🟩 Added
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Results */}
        {optimizationData && (
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Optimization Results
              </h2>
              <p className="text-gray-600">
                AI enhancement completed successfully
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Initial Score</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(optimizationData.initial_score * 100)}%
                </div>
                <div className="text-xs text-gray-400">
                  {optimizationData.initial_score.toFixed(4)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Final Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(optimizationData.updated_score * 100)}%
                </div>
                <div className="text-xs text-gray-400">
                  {optimizationData.updated_score.toFixed(4)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Improvement</div>
                <div className="text-2xl font-bold text-purple-600">
                  +{Math.round(optimizationData.improvement * 100)}%
                </div>
                <div className="text-xs text-gray-400">
                  {optimizationData.improvement.toFixed(4)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-orange-600">
                  {optimizationData.time}s
                </div>
                <div className="text-xs text-gray-400">
                  Optimization duration
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Optimized on:{" "}
              {new Date(optimizationData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Diff Display */}
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="diff-container"
              dangerouslySetInnerHTML={{ __html: diffHtml }}
              style={{
                fontFamily: "'Monaco', 'Consolas', monospace",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
