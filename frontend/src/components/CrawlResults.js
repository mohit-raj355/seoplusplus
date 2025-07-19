import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCrawl } from "../contexts/CrawlContext";

const CrawlResults = () => {
  const [selectedPage, setSelectedPage] = useState(0);
  const [showHtml, setShowHtml] = useState(true);
  const navigate = useNavigate();
  const {
    crawlResults,
    clearCrawlResults,
    storePageToOptimize,
    scoreData,
    setOptimizing,
    storeOptimizationData,
  } = useCrawl();

  // No longer need useEffect to load from localStorage - data comes from context

  const clearResults = () => {
    clearCrawlResults();
  };

  const optimizeWithAI = async () => {
    if (
      !crawlResults ||
      !crawlResults.data.pages ||
      crawlResults.data.pages.length === 0 ||
      !scoreData
    ) {
      alert("Please ensure both crawl results and score data are available.");
      return;
    }

    const pageToOptimize =
      crawlResults.data.pages[selectedPage] || crawlResults.data.pages[0];

    // Set optimizing state and navigate to diff viewer
    setOptimizing(true);
    navigate("/diff");

    // Add a timeout fallback to clear loading state after 5 minutes
    const timeoutId = setTimeout(() => {
      console.log("Optimization timeout - clearing loading state");
      setOptimizing(false);
    }, 5 * 60 * 1000); // 5 minutes

    try {
      // Prepare the payload for the optimization API
      const payload = {
        url: crawlResults.url,
        html: pageToOptimize.html,
        markdown: scoreData.markdown,
        score: scoreData.score,
        target_keyword: "finance",
        improvement_threshold: 0.001,
      };

      console.log("Starting optimization with payload:", payload);

      // For SSE, we need to use fetch with streaming since EventSource doesn't support POST with body
      const response = await fetch(
        "https://3c2e7271e064.ngrok-free.app/api/optimize",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          console.log("Processing line:", line);

          // Try different SSE formats
          let jsonData = null;

          if (line.startsWith("data: ")) {
            try {
              jsonData = JSON?.parse(line?.slice(6) || "{}");
            } catch (e) {
              console.log(
                "Failed to parse data: line, trying alternative formats"
              );
            }
          } else if (line.trim() && line.trim() !== "") {
            // Try parsing the line directly as JSON
            try {
              jsonData = JSON?.parse(line?.trim()) || "{}";
            } catch (e) {
              console.log("Failed to parse line as JSON:", line);
            }
          }

          if (jsonData) {
            console.log("Optimization event received:", jsonData);
            jsonData.originalHtml = "<html><body><h1>Hello</h1></body></html>";
            jsonData.optimizedHtml = "<html><body><h1>Hello</h1></body></html>";
            if (jsonData.optimized_html) {
              console.log(
                "Optimization completed, storing data and clearing loading state"
              );

              // Decode base64 HTML content
              const originalHtml = atob(jsonData.data.original_html);
              const optimizedHtml = atob(jsonData.data.optimized_html);

              // Store optimization data
              const optimizationDataToStore = {
                original_html: originalHtml,
                optimized_html: optimizedHtml,
                updated_score: jsonData.data.updated_score,
                initial_score: jsonData.data.initial_score,
                improvement: jsonData.data.improvement,
                time: jsonData.data.time,
                timestamp: jsonData.data.timestamp,
              };
              console.log(
                "Storing optimization data:",
                optimizationDataToStore
              );
              storeOptimizationData(optimizationDataToStore);

              // Store page data for diff viewer
              const pageDataToStore = {
                url: pageToOptimize.url,
                originalHtml: originalHtml,
                optimizedHtml: optimizedHtml,
                metadata: pageToOptimize.metadata,
                timestamp: new Date().toISOString(),
              };
              console.log(
                "Storing page data for diff viewer:",
                pageDataToStore
              );
              storePageToOptimize(pageDataToStore);

              // Clear loading state and timeout
              clearTimeout(timeoutId);
              setOptimizing(false);
              console.log("Loading state cleared");
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error starting optimization:", error);
      clearTimeout(timeoutId);
      setOptimizing(false);
      alert("Failed to start optimization. Please try again.");
    }
  };

  if (!crawlResults) {
    return (
      <div
        className="backdrop-blur-lg border border-gray-700/50 rounded-xl p-8 mb-8"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
      >
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-blue-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span
            className="text-blue-300 font-medium"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }}
          >
            No crawl results found. Use the search on the home page to analyze a
            website.
          </span>
        </div>
      </div>
    );
  }

  const { url, data, timestamp } = crawlResults;
  const pages = data.pages || [];
  const currentPage = pages[selectedPage];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "#0a0e1a",
        backgroundImage: `
        radial-gradient(circle at 30% 20%, rgba(56, 139, 253, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.04) 0%, transparent 50%),
        url("data:image/svg+xml,%3csvg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23162236' stroke-width='0.5' stroke-opacity='0.3'%3e%3cpath d='M45 15L45 35M45 55L45 75M15 45L35 45M55 45L75 45M60 30L30 60M30 30L60 60'/%3e%3cg stroke='%231e40af' stroke-opacity='0.15'%3e%3ccircle cx='45' cy='45' r='3'/%3e%3ccircle cx='22.5' cy='22.5' r='1.5'/%3e%3ccircle cx='67.5' cy='67.5' r='1.5'/%3e%3ccircle cx='22.5' cy='67.5' r='1.5'/%3e%3ccircle cx='67.5' cy='22.5' r='1.5'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")
      `,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Enhanced atmospheric layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/10 via-transparent to-purple-950/10"></div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div
          className="backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl p-8"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-3xl font-bold text-white tracking-[-0.02em] mb-2"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Analysis Results
              </h2>
              <p
                className="text-gray-300 font-medium mb-1"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Website: {url}
              </p>
              <p
                className="text-sm text-gray-400 font-normal"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Analyzed on {new Date(timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={optimizeWithAI}
                disabled={!pages || pages.length === 0}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg disabled:cursor-not-allowed flex items-center backdrop-blur-sm border border-blue-500/20"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.091zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
                Enhance for LLMs
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.totalPages}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                Pages Crawled
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.baseUrl}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                Base Domain
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {pages.filter((p) => !p.error).length}/{pages.length}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">
                Success Rate
              </div>
            </div>
          </div>
        </div>

        {/* Page Navigation */}
        {pages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Crawled Pages
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPage(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPage === index
                      ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {page.url}
                    </span>
                    {page.error && (
                      <span className="text-xs text-red-600 dark:text-red-400 ml-2">
                        Error
                      </span>
                    )}
                  </div>
                  {page.metadata?.title && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {page.metadata.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page Details */}
        {currentPage && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Page Analysis
              </h3>
              <button
                onClick={() => setShowHtml(!showHtml)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showHtml ? "Hide HTML" : "Show HTML"}
              </button>
            </div>

            {currentPage.error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-red-800 dark:text-red-200 font-medium">
                  Crawl Error
                </h4>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {currentPage.error}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metadata */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Metadata
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title:
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {currentPage.metadata?.title || "No title"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description:
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {currentPage.metadata?.description || "No description"}
                      </p>
                    </div>
                    {currentPage.metadata?.keywords && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Keywords:
                        </span>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {currentPage.metadata.keywords}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Headers */}
                {Object.keys(currentPage.headers || {}).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Headers
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(currentPage.headers).map(
                        ([tag, texts]) => (
                          <div
                            key={tag}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                              {tag}:
                            </span>
                            <ul className="mt-1 space-y-1">
                              {texts.map((text, index) => (
                                <li
                                  key={index}
                                  className="text-gray-900 dark:text-white text-sm"
                                >
                                  • {text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Links Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Internal Links
                    </h5>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currentPage.links?.internal?.length || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      External Links
                    </h5>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currentPage.links?.external?.length || 0}
                    </div>
                  </div>
                </div>

                {/* HTML Content */}
                {showHtml && currentPage.html && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      HTML Content
                    </h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {currentPage.html.substring(0, 5000)}
                        {currentPage.html.length > 5000 && "\n... (truncated)"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlResults;
