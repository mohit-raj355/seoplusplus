import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import DiffViewer from "./DiffViewer";
import CrawlResults from "./CrawlResults";
import { useNavigate } from "react-router-dom";
import { useCrawl } from "../contexts/CrawlContext";

const domainColors = [
  "#7c3aed",
  "#06b6d4",
  "#6366f1",
  "#8b5cf6",
  "#0891b2",
  "#a855f7",
  "#0ea5e9",
  "#22d3ee",
];
const domainColorsLLM = [
  "rgba(124,58,237,0.5)",
  "rgba(6,182,212,0.5)",
  "rgba(99,102,241,0.5)",
  "rgba(139,92,246,0.5)",
  "rgba(8,145,178,0.5)",
  "rgba(168,85,247,0.5)",
  "rgba(14,165,233,0.5)",
  "rgba(34,211,238,0.5)",
];

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const google = payload.find((p) => p.dataKey === "google");
    const llm = payload.find((p) => p.dataKey === "llm");
    return (
      <div
        className="backdrop-blur-xl border border-gray-500/30 rounded-xl p-4 shadow-2xl text-sm relative overflow-hidden"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"></div>

        <div className="relative z-10">
          <div
            className="font-bold mb-3 text-white text-base tracking-[-0.01em]"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }}
          >
            📊 {label}
          </div>
          {google && (
            <div
              className="flex items-center mb-2 font-medium"
              style={{ color: "#a855f7" }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
              Google: <span className="font-bold ml-1">#{google.value}</span>
            </div>
          )}
          {llm && (
            <div
              className="flex items-center font-medium"
              style={{ color: "#22d3ee" }}
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
              LLM: <span className="font-bold ml-1">#{llm.value}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

// Custom tooltip for Rank Trend line chart
function CustomLineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const google = payload.find((p) => p.dataKey === "google");
    const llm = payload.find((p) => p.dataKey === "llm");
    return (
      <div className="bg-gray-950/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-lg text-sm">
        <div className="font-semibold mb-2 text-white">{label}</div>
        {google && (
          <div style={{ color: "#a855f7" }}>
            Google: <b>#{google.value}</b>
          </div>
        )}
        {llm && (
          <div style={{ color: "#22d3ee" }}>
            LLM: <b>#{llm.value}</b>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function getMockDiff(page) {
  if (!page) return "";
  return `--- Original.html\n+++ AI-Optimized.html\n@@ -1,5 +1,5 @@\n-<h1>Old Title for ${page.url}</h1>\n-<p>Rank before: ${page.rank_before}</p>\n+<h1>New Optimized Title for ${page.url}</h1>\n+<p>Rank after: ${page.rank_after}</p>\n`;
}

export default function Dashboard({ selectedDomainId }) {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedPage, setSelectedPage] = useState(null);
  const [dateStart, setDateStart] = useState("2025-07-01");
  const [dateEnd, setDateEnd] = useState("2025-07-17");
  const [search, setSearch] = useState("");
  const [rankings, setRankings] = useState({});
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { crawlResults, scoreData } = useCrawl();

  // Fetch domains from backend
  useEffect(() => {
    fetch("/api/websites")
      .then((res) => res.json())
      .then((data) => {
        setDomains([{ id: "all", domain: "All domains" }, ...data]);
      });
  }, []);

  // Set selected domain from URL param on mount
  useEffect(() => {
    if (selectedDomainId && selectedDomain !== selectedDomainId) {
      setSelectedDomain(selectedDomainId);
    }
  }, [selectedDomainId]);

  // When dropdown changes, update the route
  const handleDomainChange = (e) => {
    const val = e.target.value;
    setSelectedDomain(val);
    navigate(`/dashboard/${val}`);
  };

  // Fetch rankings for all domains
  useEffect(() => {
    if (!domains.length) return;
    const fetchAll = async () => {
      const all = {};
      for (const d of domains) {
        if (d.id === "all") continue;
        const res = await fetch(`/api/rankings?website_id=${d.id}`);
        all[d.id] = await res.json();
      }
      setRankings(all);
    };
    fetchAll();
  }, [domains]);

  // Add new domain
  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setLoading(true);
    await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: newDomain.trim() }),
    });
    // Re-fetch domains and rankings
    const res = await fetch("/api/websites");
    const data = await res.json();
    setDomains([{ id: "all", domain: "All domains" }, ...data]);
    setNewDomain("");
    setLoading(false);
    setShowAddModal(false);
  };

  // Prepare chart data
  const domainIds = domains.filter((d) => d.id !== "all").map((d) => d.id);
  // For all domains, build barData for latest date
  let barData = [];
  let latestDate = "";
  if (selectedDomain === "all" && domainIds.length) {
    // Find the latest date across all rankings
    let allDates = [];
    for (const id of domainIds) {
      (rankings[id] || []).forEach((r) =>
        allDates.push(r.timestamp.slice(0, 10))
      );
    }
    allDates = Array.from(new Set(allDates)).sort();
    latestDate = allDates[allDates.length - 1];
    barData = domainIds.map((id, idx) => {
      // Find the latest ranking for this domain and metric
      const googleRank = (rankings[id] || [])
        .filter(
          (r) => r.type === "search" && r.timestamp.slice(0, 10) === latestDate
        )
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.rank_after;
      const llmRank = (rankings[id] || [])
        .filter(
          (r) => r.type === "llm" && r.timestamp.slice(0, 10) === latestDate
        )
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.rank_after;
      return {
        domain: domains.find((d) => d.id === id)?.domain,
        google: googleRank ?? "-",
        llm: llmRank ?? "-",
        color: domainColors[idx % domainColors.length],
      };
    });
  }

  // For line chart and metric cards, build chartData for selected domain
  let chartData = [];
  let googleBefore = "-";
  let googleAfter = "-";
  let llmBefore = "-";
  let llmAfter = "-";
  if (selectedDomain !== "all" && rankings[selectedDomain]) {
    // Group by date
    const byDate = {};
    for (const r of rankings[selectedDomain]) {
      const date = r.timestamp.slice(0, 10);
      if (!byDate[date]) byDate[date] = { date };
      byDate[date][r.type === "search" ? "google" : "llm"] = r.rank_after;
    }
    chartData = Object.values(byDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    // Metric cards: use earliest and latest for each metric
    const googleRanks = rankings[selectedDomain]
      .filter((r) => r.type === "search")
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const llmRanks = rankings[selectedDomain]
      .filter((r) => r.type === "llm")
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (googleRanks.length) {
      googleBefore = googleRanks[0].rank_before;
      googleAfter = googleRanks[googleRanks.length - 1].rank_after;
    }
    if (llmRanks.length) {
      llmBefore = llmRanks[0].rank_before;
      llmAfter = llmRanks[llmRanks.length - 1].rank_after;
    }
  }

  // Dummy pages for table (can be replaced with backend integration)
  const mockPages = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    url: `/page-${i + 1}`,
    rank_before: Math.floor(Math.random() * 20) + 1,
    rank_after: Math.floor(Math.random() * 10) + 1,
  }));
  const filteredPages = mockPages.filter((page) =>
    page.url.toLowerCase().includes(search.toLowerCase())
  );

  // Check if we have crawl results to show
  const showCrawlResults = crawlResults && crawlResults !== null;

  return (
    <div
      className="space-y-6 min-h-screen relative"
      style={{
        backgroundColor: "#0a0e1a",
        backgroundImage: `
           radial-gradient(circle at 20% 20%, rgba(56, 139, 253, 0.1) 0%, transparent 50%),
           radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
           radial-gradient(circle at 60% 40%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
           url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23162236' stroke-width='0.5' stroke-opacity='0.4'%3e%3cpath d='M50 10L50 40M50 60L50 90M10 50L40 50M60 50L90 50M70 30L30 70M30 30L70 70'/%3e%3cg stroke='%231e40af' stroke-opacity='0.2'%3e%3ccircle cx='50' cy='50' r='5'/%3e%3ccircle cx='25' cy='25' r='2'/%3e%3ccircle cx='75' cy='75' r='2'/%3e%3ccircle cx='25' cy='75' r='2'/%3e%3ccircle cx='75' cy='25' r='2'/%3e%3c/g%3e%3cg stroke='%238b5cf6' stroke-opacity='0.15'%3e%3cpath d='M20 20L30 30M70 20L80 30M20 80L30 70M70 80L80 70'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")
         `,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Enhanced atmospheric layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/60 to-slate-950/85"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/15 via-transparent to-purple-950/15"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,139,253,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,139,253,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-60"></div>

      <div className="relative z-10 p-6">
        {/* Show Crawl Results if available */}
        {showCrawlResults && (
          <div className="mb-8">
            <CrawlResults />
          </div>
        )}

        {/* Show Score Card if available */}
        {scoreData && (
          <div className="mb-8">
            <div className="relative group">
              {/* Ambient glow effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-emerald-400/5 rounded-2xl blur-xl"></div>

              {/* Glass container with enhanced effects */}
              <div
                className="relative backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl p-8 overflow-hidden"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.4)",
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                {/* Floating particles background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 left-8 w-2 h-2 bg-green-400/20 rounded-full animate-pulse"></div>
                  <div
                    className="absolute top-12 right-16 w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute bottom-8 left-1/3 w-1.5 h-1.5 bg-teal-400/20 rounded-full animate-pulse"
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>

                {/* Score content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className="font-bold text-white text-2xl tracking-[-0.02em] drop-shadow-lg mb-2"
                        style={{
                          fontFamily:
                            "Inter, system-ui, -apple-system, sans-serif",
                          textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        AI Optimization Score
                      </h3>
                      <p className="text-gray-300/90 text-sm">
                        {scoreData.url}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-400 mb-1">
                        {Math.round(scoreData.score * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        Score: {scoreData.score.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Score visualization */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">
                        Optimization Level
                      </span>
                      <span className="text-sm text-gray-300">
                        {scoreData.score < 0.5
                          ? "Poor"
                          : scoreData.score < 0.7
                          ? "Fair"
                          : scoreData.score < 0.85
                          ? "Good"
                          : scoreData.score < 0.95
                          ? "Excellent"
                          : "Outstanding"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.round(scoreData.score * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Markdown preview */}
                  {scoreData.markdown && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-white font-semibold mb-3 text-sm">
                        Content Analysis
                      </h4>
                      <div className="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
                        {scoreData.markdown}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-400">
                    Analyzed: {new Date(scoreData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Domain Selector and Add Domain Button Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <label
              className="font-semibold text-white/90"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
            >
              Domain:
            </label>
            <select
              className="backdrop-blur-lg border border-gray-700/50 rounded-lg px-4 py-3 font-medium text-white focus:border-blue-400 focus:outline-none transition-all duration-200 hover:border-gray-600"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
              value={selectedDomain}
              onChange={handleDomainChange}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.domain}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg font-medium transition-colors duration-200 flex items-center backdrop-blur-sm border border-blue-500/20"
              style={{
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}
              onClick={() => navigate("/")}
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
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Analyze new website
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring"
              onClick={() => setShowAddModal(true)}
            >
              + Add Domain
            </button>
          </div>
        </div>
        {/* Enhanced Glassmorphism Bar Chart for All Domains */}
        {selectedDomain === "all" && barData.length > 0 && (
          <div className="relative group">
            {/* Ambient glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5 rounded-2xl blur-xl"></div>

            {/* Glass container with enhanced effects */}
            <div
              className="relative backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center overflow-hidden"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.4)",
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
              }}
            >
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-8 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
                <div
                  className="absolute top-12 right-16 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute bottom-8 left-1/3 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
                <div
                  className="absolute bottom-16 right-8 w-1 h-1 bg-blue-300/25 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Enhanced header with glass effect */}
              <div className="relative z-10 mb-8 text-center">
                <div
                  className="font-bold mb-3 text-white text-2xl tracking-[-0.02em] drop-shadow-lg"
                  style={{
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Search Performance Analytics
                </div>
                <div
                  className="text-sm text-gray-300/90 font-medium px-4 py-2 rounded-lg backdrop-blur-sm border border-gray-600/20"
                  style={{
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    backgroundColor: "rgba(15, 23, 42, 0.3)",
                  }}
                >
                  📊 Latest Analysis: {latestDate}
                </div>
              </div>
              {/* Enhanced glassmorphism chart container */}
              <div
                className="relative z-10 w-full backdrop-blur-sm rounded-xl border border-gray-500/20 overflow-hidden"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.2)" }}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={barData}
                    barCategoryGap={20}
                    barGap={4}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="2 2"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth={0.8}
                    />
                    <XAxis
                      dataKey="domain"
                      tick={{
                        fontWeight: "600",
                        fill: "#e2e8f0",
                        fontSize: 12,
                        fontFamily:
                          "Inter, system-ui, -apple-system, sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                      tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                    />
                    <YAxis
                      reversed
                      allowDecimals={false}
                      tick={{
                        fill: "#cbd5e1",
                        fontSize: 11,
                        fontFamily:
                          "Inter, system-ui, -apple-system, sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                      tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "13px",
                        fontFamily:
                          "Inter, system-ui, -apple-system, sans-serif",
                        color: "#f1f5f9",
                        fontWeight: "500",
                      }}
                    />
                    <Bar
                      dataKey="google"
                      name="Google"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={true}
                    >
                      {barData.map((entry, idx) => (
                        <Cell
                          key={`gbar-${idx}`}
                          fill={domainColors[idx % domainColors.length]}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="llm"
                      name="LLM"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={true}
                    >
                      {barData.map((entry, idx) => (
                        <Cell
                          key={`lbar-${idx}`}
                          fill={domainColorsLLM[idx % domainColorsLLM.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        {selectedDomain !== "all" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded shadow text-center">
              <div className="text-xs text-gray-500">Google Rank (Before)</div>
              <div className="text-2xl font-bold">{googleBefore}</div>
            </div>
            <div className="bg-green-50 p-4 rounded shadow text-center">
              <div className="text-xs text-gray-500">Google Rank (After)</div>
              <div className="text-2xl font-bold">{googleAfter}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded shadow text-center">
              <div className="text-xs text-gray-500">LLM Rank (Before)</div>
              <div className="text-2xl font-bold">{llmBefore}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded shadow text-center">
              <div className="text-xs text-gray-500">LLM Rank (After)</div>
              <div className="text-2xl font-bold">{llmAfter}</div>
            </div>
          </div>
        )}
        {/* Line Graph with Date Range Filter */}
        {selectedDomain !== "all" && chartData.length > 0 && (
          <div
            className="backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl p-8 h-96"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className="font-bold text-white text-xl tracking-[-0.01em]"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Performance Trends
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <label>From:</label>
                <input
                  type="date"
                  className="border rounded px-1 py-0.5"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
                <label>To:</label>
                <input
                  type="date"
                  className="border rounded px-1 py-0.5"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date">
                  <Label value="Date" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis reversed allowDecimals={false}>
                  <Label value="Rank" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="google"
                  stroke="#2563eb"
                  name="Google"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="llm"
                  stroke="#a21caf"
                  name="LLM"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Page Table with Search */}
        {selectedDomain !== "all" && (
          <div className="bg-gray-950/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Pages</div>
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="Search URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: 180 }}
              />
            </div>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left rounded-tl-lg">URL</th>
                    <th className="p-3 text-right">Rank Before</th>
                    <th className="p-3 text-right">Rank After</th>
                    <th className="p-3 text-right rounded-tr-lg">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page, idx) => (
                    <tr
                      key={page.id}
                      className={`transition-colors duration-100 ${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 cursor-pointer`}
                      onClick={() => setSelectedPage(page)}
                    >
                      <td className="p-3 font-mono text-blue-900">
                        {page.url}
                      </td>
                      <td className="p-3 text-right">{page.rank_before}</td>
                      <td className="p-3 text-right">{page.rank_after}</td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          page.rank_after - page.rank_before >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {page.rank_after - page.rank_before}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPages.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No pages found.
              </div>
            )}
          </div>
        )}
        {/* Diff Viewer Modal */}
        {selectedPage && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative animate-fadeIn">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow"
                onClick={() => setSelectedPage(null)}
                aria-label="Close"
                style={{ lineHeight: 1 }}
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Diff for {selectedPage.url}
              </h2>
              <DiffViewer diff={getMockDiff(selectedPage)} />
            </div>
          </div>
        )}
        {/* Add Domain Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                style={{ lineHeight: 1 }}
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Add Domain</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newDomain.trim()) return;
                  setLoading(true);
                  const res = await fetch("/api/websites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ domain: newDomain.trim() }),
                  });
                  const data = await res.json();
                  setDomains((prev) => [
                    { id: "all", domain: "All domains" },
                    ...prev.filter((d) => d.id !== "all"),
                    data,
                  ]);
                  setNewDomain("");
                  setLoading(false);
                  setShowAddModal(false);
                }}
              >
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-full mb-4"
                  placeholder="Add new domain (e.g. mysite.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 w-full"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Domain"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
