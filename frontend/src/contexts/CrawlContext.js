import React, { createContext, useContext, useState } from "react";

const CrawlContext = createContext();

export const useCrawl = () => {
  const context = useContext(CrawlContext);
  if (!context) {
    throw new Error("useCrawl must be used within a CrawlProvider");
  }
  return context;
};

export const CrawlProvider = ({ children }) => {
  const [crawlResults, setCrawlResults] = useState(null);
  const [pageToOptimize, setPageToOptimize] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const storeCrawlResults = (data) => {
    setCrawlResults(data);
  };

  const clearCrawlResults = () => {
    setCrawlResults(null);
  };

  const storePageToOptimize = (data) => {
    setPageToOptimize(data);
  };

  const clearPageToOptimize = () => {
    setPageToOptimize(null);
  };

  const storeScoreData = (data) => {
    setScoreData(data);
  };

  const clearScoreData = () => {
    setScoreData(null);
  };

  const storeOptimizationData = (data) => {
    setOptimizationData(data);
  };

  const clearOptimizationData = () => {
    setOptimizationData(null);
  };

  const setOptimizing = (status) => {
    setIsOptimizing(status);
  };

  const value = {
    crawlResults,
    pageToOptimize,
    scoreData,
    optimizationData,
    isOptimizing,
    storeCrawlResults,
    clearCrawlResults,
    storePageToOptimize,
    clearPageToOptimize,
    storeScoreData,
    clearScoreData,
    storeOptimizationData,
    clearOptimizationData,
    setOptimizing,
  };

  return (
    <CrawlContext.Provider value={value}>{children}</CrawlContext.Provider>
  );
};
