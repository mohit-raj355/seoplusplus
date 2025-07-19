import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCrawl } from "../contexts/CrawlContext";

const HomePage = () => {
  const [url, setUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { storeCrawlResults, storeScoreData } = useCrawl();

  // Auto-focus the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      // Step 1: Call the crawler API
      console.log("Starting crawl for:", url.trim());
      const crawlResponse = await fetch("/api/crawler/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const crawlResult = await crawlResponse.json();

      if (crawlResult.status !== "success") {
        throw new Error(
          `Crawling failed: ${crawlResult.error || "Unknown error"}`
        );
      }

      // Step 2: Call the score API
      console.log("Getting score for:", url.trim());
      const scoreResponse = await fetch(
        "https://3c2e7271e064.ngrok-free.app/api/score",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url.trim() }),
        }
      );

      const scoreResult = await scoreResponse.json();

      if (!scoreResult.success) {
        throw new Error(
          `Score API failed: ${scoreResult.error || "Unknown error"}`
        );
      }

      // Store both crawl results and score data in context
      storeCrawlResults({
        url: url.trim(),
        data: crawlResult,
        timestamp: new Date().toISOString(),
      });

      storeScoreData({
        url: scoreResult.data.url,
        score: scoreResult.data.score,
        markdown: scoreResult.data.markdown,
        timestamp: scoreResult.data.timestamp,
      });

      // Navigate to dashboard to show results
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during crawl and score process:", error);
      setError(error.message || "Failed to process website. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "#0a0e1a",
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(56, 139, 253, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 75% 25%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 25% 75%, rgba(34, 211, 238, 0.06) 0%, transparent 40%),
          radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.04) 0%, transparent 40%),
          url("data:image/svg+xml,%3csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23162236' stroke-width='0.5' stroke-opacity='0.4'%3e%3cpath d='M40 10L40 30M40 50L40 70M10 40L30 40M50 40L70 40M55 25L25 55M25 25L55 55'/%3e%3cg stroke='%231e40af' stroke-opacity='0.15'%3e%3ccircle cx='40' cy='40' r='4'/%3e%3ccircle cx='20' cy='20' r='2'/%3e%3ccircle cx='60' cy='60' r='2'/%3e%3ccircle cx='20' cy='60' r='2'/%3e%3ccircle cx='60' cy='20' r='2'/%3e%3c/g%3e%3cg stroke='%238b5cf6' stroke-opacity='0.1'%3e%3cpath d='M15 15L25 25M55 15L65 25M15 65L25 55M55 65L65 55'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")
        `,
      }}
    >
      {/* Enhanced atmospheric layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-purple-950/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/10 via-transparent to-transparent"></div>

      {/* Geometric accent lines - Palantir style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/15 to-transparent"></div>

        {/* Angular geometric shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 border border-blue-500/10 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 border border-purple-500/10 rotate-12 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-20 w-20 h-20 border border-cyan-500/10 -rotate-45 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sophisticated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-l from-purple-500/5 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl animate-float-slow"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 py-8 max-w-6xl mx-auto">
        {/* Logo and Heading */}
        <div className="mb-20 relative mx-4">
          <div className="mb-8">
            <h1
              className="text-6xl md:text-8xl font-bold mb-8 tracking-[-0.02em] relative"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              <span className="text-white/95">GEO</span>
              <span className="text-blue-400 ml-2">Agent</span>
            </h1>
            <div className="mb-12 space-y-4 px-4">
              <p
                className="text-2xl md:text-3xl text-gray-300 font-medium tracking-wide"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Generative Engine Optimization
              </p>
              <p
                className="text-lg md:text-xl text-gray-400 font-normal tracking-wide"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Optimize for the age of AI-powered search
              </p>
            </div>
          </div>
          <p
            className="text-lg md:text-xl text-gray-400 max-w-5xl mx-auto leading-relaxed font-normal px-6"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }}
          >
            Transform your website to rank higher on AI-powered search engines
            like <span className="text-white font-semibold">ChatGPT</span>,{" "}
            <span className="text-white font-semibold">Claude</span>, and{" "}
            <span className="text-white font-semibold">Perplexity</span> while
            maintaining your Google performance.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-3xl mx-auto px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3D Search Bar */}
        <div className="mb-20 px-4">
          <form onSubmit={handleSearch} className="relative max-w-5xl mx-auto">
            <div className="relative group">
              {/* Enhanced glassmorphism glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/15 via-purple-400/15 to-cyan-400/15 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>

              {/* Palantir-inspired clean container */}
              <div
                className="relative backdrop-blur-lg rounded-lg border-2 border-gray-600/50 hover:border-blue-500/60 focus-within:border-blue-400/80 transition-all duration-200 shadow-xl"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
              >
                <div className="flex items-center px-10 py-8">
                  {/* Minimal search icon */}
                  <div className="flex-shrink-0 mr-6">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {/* Clean input field */}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your website URL..."
                    className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                    style={{
                      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    }}
                    disabled={isSearching}
                  />

                  {/* Palantir-style clean button */}
                  <button
                    type="submit"
                    disabled={isSearching || !url.trim()}
                    className="ml-6 flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                    style={{
                      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Crawling & Analyzing...
                      </div>
                    ) : (
                      "Crawl Website"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Palantir-inspired Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-20 px-4">
          <div
            className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-10 hover:border-gray-700 transition-all duration-200 group"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          >
            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-8 group-hover:bg-blue-500 transition-colors duration-200 mx-auto">
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
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-white mb-6"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              AI vs Traditional Rankings
            </h3>
            <p
              className="text-gray-400 leading-relaxed px-2"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Compare performance across traditional Google search and modern
              AI-powered engines.
            </p>
          </div>

          <div
            className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-10 hover:border-gray-700 transition-all duration-200 group"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          >
            <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-8 group-hover:bg-cyan-500 transition-colors duration-200 mx-auto">
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
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75-7.478a12.06 12.06 0 014.5 0m-8.25 7.478a12.06 12.06 0 01-4.5 0m8.25-7.478a12.06 12.06 0 00-4.5 0m-6.75 2.25h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v7.5a1.5 1.5 0 001.5 1.5z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-white mb-6"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Content Enhancement
            </h3>
            <p
              className="text-gray-400 leading-relaxed px-2"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              AI-powered algorithms analyze and enhance your content for optimal
              performance across all search platforms.
            </p>
          </div>

          <div
            className="backdrop-blur-sm rounded-lg border border-gray-800/50 p-10 hover:border-gray-700 transition-all duration-200 group"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          >
            <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-8 group-hover:bg-purple-500 transition-colors duration-200 mx-auto">
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
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-white mb-6"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Performance Predictions
            </h3>
            <p
              className="text-gray-400 leading-relaxed px-2"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Get data-driven projections on how content changes will impact
              your rankings across all search platforms.
            </p>
          </div>
        </div>

        {/* Palantir-style Clean Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center px-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-10 py-5 border border-gray-700 hover:border-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center hover:bg-gray-800/50"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            }}
          >
            <svg
              className="w-5 h-5 mr-3 group-hover:text-purple-300 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
            <span className="group-hover:text-purple-300 transition-colors duration-200">
              View Dashboard
            </span>
          </button>
          <button
            onClick={() => navigate("/diff")}
            className="group px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-blue-900/50 hover:to-cyan-900/50 border border-gray-700 hover:border-blue-500/30 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-blue-500/20"
          >
            <svg
              className="w-5 h-5 mr-3 group-hover:text-blue-300 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="group-hover:text-blue-300 transition-colors duration-200">
              Diff Viewer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
