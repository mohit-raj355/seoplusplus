import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import DiffViewer from "./components/DiffViewer";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import { CrawlProvider } from "./contexts/CrawlContext";
import "./App.css";

function AppNav({ darkMode, setDarkMode }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Don't show nav on home page
  if (isHomePage) {
    return null;
  }

  return (
    <nav
      className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 backdrop-blur-xl border-b shadow-2xl z-20 sticky top-0"
      style={{
        backgroundColor: "rgba(33, 38, 45, 0.95)",
        borderColor: "rgba(56, 139, 253, 0.1)",
      }}
    >
      <div className="flex items-center space-x-2">
        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition"
        >
          <span
            className="text-2xl font-bold tracking-[-0.02em]"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }}
          >
            <span className="text-white/95">GEO</span>
            <span className="text-blue-400 ml-1">Agent</span>
          </span>
          <span
            className="hidden md:inline text-xs text-gray-400 ml-3 font-medium"
            style={{
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }}
          >
            Generative Engine Optimization
          </span>
        </Link>
      </div>
      <div className="flex items-center space-x-2 mt-2 md:mt-0">
        <Link
          to={
            location.pathname.startsWith("/dashboard")
              ? location.pathname
              : "/dashboard"
          }
          className={`mr-2 md:mr-4 ${
            location.pathname.startsWith("/dashboard")
              ? "font-semibold text-blue-400 border-b border-blue-400"
              : "text-gray-300 hover:text-blue-400"
          } px-3 py-2 rounded-lg hover:bg-gray-800/30 transition-all duration-200`}
          style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
          aria-label="Show Dashboard"
          tabIndex={0}
        >
          Dashboard
        </Link>
        <Link
          to="/diff"
          className={`${
            location.pathname === "/diff"
              ? "font-semibold text-purple-400 border-b border-purple-400"
              : "text-gray-300 hover:text-purple-400"
          } px-3 py-2 rounded-lg hover:bg-gray-800/30 transition-all duration-200`}
          style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
          aria-label="Show Diff Viewer"
          tabIndex={0}
        >
          Diff Viewer
        </Link>
        <button
          className="ml-2 px-3 py-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-gray-700/50"
          style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
          tabIndex={0}
        >
          {darkMode ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}

function DashboardWithParams() {
  const { domainId } = useParams();
  return <Dashboard selectedDomainId={domainId || "all"} />;
}

function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();

  // Optimized dark mode toggle with reduced transition overhead
  const handleDarkModeToggle = (newDarkMode) => {
    // Temporarily disable transitions on heavy elements during toggle
    document.documentElement.style.setProperty("--transition-duration", "0ms");

    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));

    // Re-enable transitions after state change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.style.removeProperty("--transition-duration");
      });
    });
  };

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen flex flex-col transition-colors duration-300"
          : "min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 transition-colors duration-300"
      }
      style={
        darkMode
          ? {
              backgroundColor: "#0a0e1a",
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(56, 139, 253, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(34, 211, 238, 0.04) 0%, transparent 50%),
                url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23162236' stroke-width='0.5' stroke-opacity='0.3'%3e%3cpath d='M30 5L30 25M30 35L30 55M5 30L25 30M35 30L55 30M42.5 17.5L17.5 42.5M17.5 17.5L42.5 42.5'/%3e%3cg stroke='%231e40af' stroke-opacity='0.1'%3e%3ccircle cx='30' cy='30' r='3'/%3e%3ccircle cx='15' cy='15' r='1.5'/%3e%3ccircle cx='45' cy='45' r='1.5'/%3e%3ccircle cx='15' cy='45' r='1.5'/%3e%3ccircle cx='45' cy='15' r='1.5'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")
              `,
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            }
          : {
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(56, 139, 253, 0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
              `,
            }
      }
    >
      <AppNav darkMode={darkMode} setDarkMode={handleDarkModeToggle} />
      <main className="flex-1 transition-all">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard/:domainId"
            element={
              <div className="p-2 md:p-6 bg-gray-50 dark:bg-gray-900 w-full max-w-7xl mx-auto">
                <DashboardWithParams />
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <div className="p-2 md:p-6 bg-gray-50 dark:bg-gray-900 w-full max-w-7xl mx-auto">
                <DashboardWithParams />
              </div>
            }
          />
          <Route
            path="/diff"
            element={
              <div className="p-2 md:p-6 bg-gray-50 dark:bg-gray-900 w-full max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded shadow p-2 md:p-6">
                  <DiffViewer />
                </div>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname !== "/" && (
        <footer
          className="w-full py-4 px-4 md:px-8 backdrop-blur-xl text-center text-xs text-gray-400 border-t"
          style={{
            backgroundColor: "rgba(33, 38, 45, 0.95)",
            borderColor: "rgba(56, 139, 253, 0.1)",
          }}
        >
          &copy; {new Date().getFullYear()} GEO Agent &mdash; Generative Engine
          Optimization for the LLM Era. All rights reserved.
        </footer>
      )}
    </div>
  );
}

function App() {
  // Initialize dark mode from localStorage, default to false
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  return (
    <Router>
      <CrawlProvider>
        <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
      </CrawlProvider>
    </Router>
  );
}

export default App;
