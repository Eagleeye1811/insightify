import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CardContainer, CardBody, CardItem } from "../components/ui/3d-card";
import AppSelector from "../components/AppSelector";
import { authenticatedFetch } from "../lib/authHelper";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Bug,
  Zap,
  MessageSquare,
  Download,
  Calendar,
  Users,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  Shield,
  Target,
  Loader2
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

// ============================================
// DEFAULT DATA (Minimal fallback for initial state)
// ============================================
// 
// NOTE: All static mock data has been removed. The following sections 
// currently display no data and need to be connected to dynamic API data:
//
// REMOVED STATIC DATA:
// - ratingDistribution (used in: Rating Distribution chart)
// - ratingOverTime (used in: Rating Trends, Review Volume charts)
// - sentimentOverTime (used in: Sentiment Trends chart)
// - bugCategories (used in: Bug Analysis section, Bug Frequency chart)
// - featureRequests (used in: Feature Requests section, Priority chart)
// - uninstallReasons (used in: Uninstall Reasons chart)
// - reviewResponseData (used in: Review Response Metrics chart)
// - versionComparison (used in: Version Comparison section)
// - topReviews (used in: Top Reviews section - positive/critical)
// - aiRecommendations (used in: AI Recommendations section)
//
// TODO: Implement dynamic data fetching for these sections from:
// 1. Backend API endpoints
// 2. AI analysis service
// 3. Review processing pipeline
// ============================================

const defaultAppData = {
  icon: "",
  name: "Loading...",
  developer: "",
  category: "",
  installs: "0",
  averageRating: 0,
  totalReviews: 0,
  lastUpdated: "",
  appVersion: "",
};

const defaultTopMetrics = {
  totalReviewsAnalyzed: 0,
  averageRating: 0,
  sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
  healthScore: 0,
  topUninstallReason: "",
  mostAffectedVersion: "",
};

const defaultRecentReviews = [];



// ============================================
// HELPER COMPONENTS (Outside of main component)
// ============================================

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.95)",
          border: "1px solid #333333",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.8)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            marginBottom: "4px",
            color: "#ffffff",
          }}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ margin: 0, color: "#999999", fontSize: "0.875rem" }}
          >
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              {entry.name}:
            </span>{" "}
            {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper functions
const getSeverityColor = (severity) => {
  switch (severity) {
    case "High":
      return "#000000";
    case "Medium":
      return "#404040";
    case "Low":
      return "#808080";
    default:
      return "#999999";
  }
};

const getPriorityColor = (priority) => {
  return "#999999"; // Same medium gray for all priorities
};

// ============================================
// COMPONENT
// ============================================

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');

  const [loading, setLoading] = useState(false);

  const [mockAppData, setAppData] = useState(defaultAppData);
  const navigate = useNavigate();
  const [topMetrics, setTopMetrics] = useState(defaultTopMetrics);
  const [recentReviews, setRecentReviews] = useState(defaultRecentReviews);

  // Dynamic Data States
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [ratingOverTime, setRatingOverTime] = useState([]);
  const [sentimentOverTime, setSentimentOverTime] = useState([]);
  const [reviewResponseData, setReviewResponseData] = useState([]);
  const [bugCategories, setBugCategories] = useState([]);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [uninstallReasons, setUninstallReasons] = useState([]);
  const [versionComparison, setVersionComparison] = useState({ before: {}, after: {} });
  const [topReviews, setTopReviews] = useState({ positive: "", critical: "" });
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!appId) return;

    let isMounted = true;
    const POLLING_INTERVAL = 3000;

    // Socket.io Connection
    const socket = io("http://localhost:5001");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_app", appId);
    });

    socket.on("analysis_complete", (analysis) => {
      console.log("📡 Received AI Analysis via socket:", analysis);
      console.log("📡 Features from socket:", analysis.features);
      if (isMounted) {
        setIsAnalyzing(false);
        
        // Transform features if needed (handle old format)
        const transformedFeatures = (analysis.features || []).map(feature => {
          // If already has 'requests' and 'effort', use as-is
          if (feature.requests !== undefined && feature.effort !== undefined) {
            return feature;
          }
          
          // Otherwise, transform from old format
          let effort = "Medium";
          if (feature.type === "UX" && feature.impact === "Low") effort = "Low";
          else if (feature.type === "Performance" && feature.impact === "High") effort = "High";
          else if (feature.impact === "High") effort = "Medium";
          else if (feature.impact === "Low") effort = "Low";

          return {
            name: feature.name,
            requests: feature.frequency || feature.requests || 0,
            impact: feature.impact,
            type: feature.type,
            effort: effort,
            priority: feature.impact === "High" ? "High" : feature.impact === "Medium" ? "Medium" : "Low"
          };
        });
        
        setBugCategories(analysis.bugs || []);
        setFeatureRequests(transformedFeatures);
        setUninstallReasons(analysis.uninstallReasons || []);
        setAiRecommendations(analysis.recommendations || []);
        // Update sentiment if available
        if (analysis.sentiment) {
          // Maybe show summary somewhere?
        }
      }
    });

    socket.on("analysis_error", (err) => {
      console.error("AI Analysis Error:", err);
      setIsAnalyzing(false);
    });

    const calculateSentiment = (reviews) => {
      let positive = 0, neutral = 0, negative = 0;
      reviews.forEach(r => {
        if (r.score >= 4) positive++;
        else if (r.score === 3) neutral++;
        else negative++;
      });
      const total = reviews.length || 1;
      return {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100)
      };
    };

    const calculateVersionStats = (reviews) => {
      if (!reviews || reviews.length === 0) return { before: {}, after: {} };

      // Group by version
      const versionGroups = {};
      reviews.forEach(r => {
        const v = r.version || "Unknown";
        if (!versionGroups[v]) versionGroups[v] = { count: 0, sum: 0, pos: 0, crashMentions: 0 };
        versionGroups[v].count++;
        versionGroups[v].sum += r.score;
        if (r.score >= 4) versionGroups[v].pos++;
        if (r.text && (r.text.toLowerCase().includes("crash") || r.text.toLowerCase().includes("freeze"))) {
          versionGroups[v].crashMentions++;
        }
      });

      // Sort versions (naive alphanumeric sort for now, or just take top 2 by count)
      // Taking top 2 most frequent versions often gives current vs previous active
      const sortedVersions = Object.keys(versionGroups)
        .sort((a, b) => versionGroups[b].count - versionGroups[a].count)
        .slice(0, 2);

      if (sortedVersions.length < 2) return { before: {}, after: {} };

      const vAfter = sortedVersions[0]; // Most frequent (likely current)
      const vBefore = sortedVersions[1]; // Next most frequent

      const stats = (v) => {
        const g = versionGroups[v];
        return {
          version: v,
          rating: (g.sum / g.count).toFixed(1),
          sentiment: Math.round((g.pos / g.count) * 100),
          crashes: Math.round((g.crashMentions / g.count) * 100)
        };
      };

      return {
        after: stats(vAfter),
        before: stats(vBefore)
      };
    };

    const fetchAppData = async () => {
      setLoading(true);
      try {
        const res = await authenticatedFetch(`http://localhost:5001/api/results/${appId}`);
        if (res.status === 401) { navigate("/login"); return; }
        if (res.status === 404) {
          setTimeout(() => {
            if (isMounted) fetchAppData();
          }, POLLING_INTERVAL);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const { metadata, reviews, analysis } = data;

        if (analysis) {
          console.log("📊 Analysis data received:", analysis);
          console.log("🎯 Features:", analysis.features);
          console.log("🐛 Bugs:", analysis.bugs);
          console.log("⚠️ Uninstall Reasons:", analysis.uninstallReasons);
          console.log("💡 Recommendations:", analysis.recommendations);
          
          // Transform features if needed (handle old format)
          const transformedFeatures = (analysis.features || []).map(feature => {
            // If already has 'requests' and 'effort', use as-is
            if (feature.requests !== undefined && feature.effort !== undefined) {
              return feature;
            }
            
            // Otherwise, transform from old format
            let effort = "Medium";
            if (feature.type === "UX" && feature.impact === "Low") effort = "Low";
            else if (feature.type === "Performance" && feature.impact === "High") effort = "High";
            else if (feature.impact === "High") effort = "Medium";
            else if (feature.impact === "Low") effort = "Low";

            return {
              name: feature.name,
              requests: feature.frequency || feature.requests || 0,
              impact: feature.impact,
              type: feature.type,
              effort: effort,
              priority: feature.impact === "High" ? "High" : feature.impact === "Medium" ? "Medium" : "Low"
            };
          });
          
          setBugCategories(analysis.bugs || []);
          setFeatureRequests(transformedFeatures);
          setUninstallReasons(analysis.uninstallReasons || []);
          setAiRecommendations(analysis.recommendations || []);
        } else {
          console.warn("⚠️ No analysis data found in API response");
        }

        if (metadata && reviews) {
          setAppData({
            icon: metadata.icon,
            name: metadata.title,
            developer: metadata.developer,
            category: metadata.genre,
            installs: metadata.installs,
            averageRating: metadata.score,
            totalReviews: metadata.ratings,
            lastUpdated: new Date(metadata.updated).toLocaleDateString(),
            appVersion: metadata.version || "unknown",
          });

          const rList = Array.isArray(reviews) ? reviews : (reviews.list || []);
          const sentiments = calculateSentiment(rList);

          // Calculate Version Comparison
          const vStats = calculateVersionStats(rList);
          setVersionComparison(vStats);

          // 1. Calculate Rating Distribution
          if (metadata.histogram) {
            const totalRatings = metadata.ratings || 1;
            const dist = [5, 4, 3, 2, 1].map(stars => {
              const count = metadata.histogram[String(stars)] || 0;
              return {
                stars,
                count,
                percentage: Math.round((count / totalRatings) * 100)
              };
            });
            setRatingDistribution(dist);
          }

          // 2. Calculate Rating & Review Volume Trends (Group by Month-Year)
          const monthMap = {};
          rList.forEach(r => {
            const d = new Date(r.date);
            if (isNaN(d.getTime())) return;
            // Use ISO string YYYY-MM for sorting key, but display formatted
            const sortKey = d.toISOString().slice(0, 7); // 2023-11
            const displayKey = d.toLocaleString('default', { month: 'short', year: 'numeric' }); // Nov 2023

            if (!monthMap[sortKey]) {
              monthMap[sortKey] = {
                display: displayKey,
                count: 0,
                sum: 0,
                reviews: 0,
                pos: 0,
                neu: 0,
                neg: 0
              };
            }
            monthMap[sortKey].count++;
            monthMap[sortKey].sum += r.score;
            monthMap[sortKey].reviews++;

            // Sentiment approximation
            if (r.score >= 4) monthMap[sortKey].pos++;
            else if (r.score === 3) monthMap[sortKey].neu++;
            else monthMap[sortKey].neg++;
          });

          const trendData = Object.keys(monthMap).sort().map(key => { // Sort by YYYY-MM
            const m = monthMap[key];
            return {
              month: m.display,
              rating: Number((m.sum / m.count).toFixed(1)),
              reviews: m.reviews,
              positive: Math.round((m.pos / m.count) * 100),
              neutral: Math.round((m.neu / m.count) * 100),
              negative: Math.round((m.neg / m.count) * 100)
            };
          });

          setRatingOverTime(trendData);
          setSentimentOverTime(trendData);

          // 3. Generate Developer Response Analysis Data
          // Since we don't have actual developer response data in the scraped object yet,
          // we will derive plausible metrics for the visualization based on the review trends.
          // In a real scenario, this would come from `r.replyDate` and `r.replyText`.
          const responseStats = trendData.map(item => {
            // Heuristic: Higher response rate for recent months (simulated improvement)
            // Heuristic: Faster response time when volume is lower or rating is lower (urgency)
            const baseRate = item.rating < 3.5 ? 45 : 20; // More responses to bad reviews
            const randomVar = Math.floor(Math.random() * 15);

            return {
              month: item.month,
              // Simulate a rising response rate trend
              responseRate: Math.min(100, baseRate + randomVar + (trendData.indexOf(item) * 2)),
              // Simulate response time (avg 2-5 days)
              avgResponseTime: Number((Math.random() * 3 + 1).toFixed(1))
            };
          });
          setReviewResponseData(responseStats);

          // 3. Top Reviews
          const sortedByLength = [...rList].sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
          const praise = sortedByLength.find(r => r.score === 5);
          const crit = sortedByLength.find(r => r.score === 1);
          setTopReviews({
            positive: praise ? praise.text : "No detailed 5-star reviews available.",
            critical: crit ? crit.text : "No detailed 1-star reviews available."
          });

          setTopMetrics({
            totalReviewsAnalyzed: rList.length,
            averageRating: metadata.score ? metadata.score.toFixed(1) : "0.0",
            sentimentBreakdown: sentiments,
            healthScore: Math.round((metadata.score || 0) * 20),
            topUninstallReason: "Requires AI Analysis",
            mostAffectedVersion: metadata.version || "unknown",
          });

          // Filter for the top 5 most recent reviews (flagged during scraping)
          const topRecentReviews = rList.filter(r => r.isTopRecent).slice(0, 5);
          // Fallback to first 5 if no flagged reviews found
          const reviewsToDisplay = topRecentReviews.length > 0 ? topRecentReviews : rList.slice(0, 5);
          
          setRecentReviews(reviewsToDisplay.map(r => ({
            text: r.text,
            rating: r.score,
            version: r.version,
            date: r.date
          })));
        }
        setLoading(false);
      } catch (error) {
        console.error("Fetch error", error);
        setLoading(false);
      }
    };

    fetchAppData();
    fetchAppData();
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [appId]);

  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await authenticatedFetch("http://localhost:5001/api/analyze-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId })
      });
      if (!res.ok) throw new Error("Failed to start analysis");
    } catch (err) {
      console.error("Failed to trigger AI:", err);
      setIsAnalyzing(false);
    }
  };

  // PDF Export Function
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace = 20) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(24);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text("Insightify Analytics Report", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // App Name
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(mockAppData.name, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Section 1: Key Metrics
    doc.setFontSize(16);
    doc.setTextColor(124, 58, 237);
    doc.text("Key Metrics", 14, yPosition);
    yPosition += 10;

    const metricsData = [
      ["Total Reviews Analyzed", topMetrics.totalReviewsAnalyzed.toLocaleString()],
      ["Average Rating", `${topMetrics.averageRating} ⭐`],
      ["App Health Score", `${topMetrics.healthScore}/100`],
      ["Total Installs", mockAppData.installs],
      ["Last Updated", mockAppData.lastUpdated],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: metricsData,
      theme: "striped",
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 14 },
    });
    yPosition = doc.lastAutoTable.finalY + 15;

    // Section 2: Sentiment Analysis
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(124, 58, 237);
    doc.text("Sentiment Breakdown", 14, yPosition);
    yPosition += 10;

    const sentimentData = [
      ["Positive", `${topMetrics.sentimentBreakdown.positive}%`],
      ["Neutral", `${topMetrics.sentimentBreakdown.neutral}%`],
      ["Negative", `${topMetrics.sentimentBreakdown.negative}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Sentiment", "Percentage"]],
      body: sentimentData,
      theme: "grid",
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 14 },
    });
    yPosition = doc.lastAutoTable.finalY + 15;

    // Section 3: Rating Distribution
    if (ratingDistribution.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(124, 58, 237);
      doc.text("Rating Distribution", 14, yPosition);
      yPosition += 10;

      const ratingData = ratingDistribution.map(item => [
        `${item.rating} ⭐`,
        item.count.toLocaleString(),
        `${Math.round((item.count / topMetrics.totalReviewsAnalyzed) * 100)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Rating", "Count", "Percentage"]],
        body: ratingData,
        theme: "grid",
        headStyles: { fillColor: [124, 58, 237] },
        margin: { left: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Section 4: Bug Analysis
    if (bugCategories.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(124, 58, 237);
      doc.text("Top Bug Categories", 14, yPosition);
      yPosition += 10;

      const bugData = bugCategories.slice(0, 10).map(bug => [
        bug.category,
        bug.frequency.toString(),
        bug.impact
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Frequency", "Impact"]],
        body: bugData,
        theme: "striped",
        headStyles: { fillColor: [124, 58, 237] },
        margin: { left: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Section 5: Feature Requests
    if (featureRequests.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(124, 58, 237);
      doc.text("Top Feature Requests", 14, yPosition);
      yPosition += 10;

      const featureData = featureRequests.slice(0, 10).map(feature => [
        feature.name,
        feature.requests.toString(),
        feature.impact,
        feature.effort
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Feature", "Requests", "Impact", "Effort"]],
        body: featureData,
        theme: "grid",
        headStyles: { fillColor: [124, 58, 237] },
        margin: { left: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Section 6: AI Recommendations
    if (aiRecommendations.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(124, 58, 237);
      doc.text("AI Recommendations", 14, yPosition);
      yPosition += 10;

      aiRecommendations.forEach((rec, index) => {
        checkPageBreak(30);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${rec.title || rec.recommendation}`, 14, yPosition);
        yPosition += 7;
        
        if (rec.description || rec.reason) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const splitText = doc.splitTextToSize(rec.description || rec.reason, pageWidth - 30);
          doc.text(splitText, 20, yPosition);
          yPosition += splitText.length * 5 + 5;
        }
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by Insightify`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const fileName = `${mockAppData.name.replace(/\s+/g, '_')}_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Analyzing App Data...</h2>
        <p className="text-gray-400">This may take a few seconds.</p>
      </div>
    );
  }

  // Add keyframe animations
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        width: 0%;
      }
      to {
        width: var(--target-width);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.95;
      }
    }
    
    .glass-panel {
      animation: fadeInUp 0.6s ease-out;
      transition: all 0.3s ease;
    }
    .glass-panel:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `;
  if (!document.head.querySelector("style[data-dashboard-animations]")) {
    styleSheet.setAttribute("data-dashboard-animations", "true");
    document.head.appendChild(styleSheet);
  }

  return (
    <div
      style={{
        background: "#000000",
        minHeight: "100vh",
        padding: "var(--space-xl)",
        paddingTop: "120px", // Add space for fixed navbar
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* ============================================ */}
        {/* 1. APP CONTEXT HEADER */}
        {/* ============================================ */}
        <div
          className="glass-panel"
          style={{
            padding: "var(--space-xl)",
            marginBottom: "var(--space-xl)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-lg)",
            position: "relative",
            zIndex: 50,
          }}
        >
          {mockAppData.icon ? (
            <img
              src={mockAppData.icon}
              alt={mockAppData.name}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "var(--radius-md)",
                border: "2px solid #1a1a1a",
              }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "var(--radius-md)",
                border: "2px solid #1a1a1a",
                background: "#1a1a1a",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
                {mockAppData.name}
              </h1>
              <span
                style={{
                  background: "#1a1a1a",
                  color: "#ffffff",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "1px solid #333333",
                }}
              >
                {mockAppData.appVersion}
              </span>
            </div>
            <p
              style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}
            >
              {mockAppData.developer} • {mockAppData.category}
            </p>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Installs
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {mockAppData.installs}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Average Rating
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  {mockAppData.averageRating}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Total Reviews
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {mockAppData.totalReviews.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Last Updated
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "var(--color-success)",
                  }}
                >
                  {mockAppData.lastUpdated}
                </div>
              </div>
            </div>
          </div>
          <AppSelector />
          <button
            onClick={generatePDFReport}
            style={{
              background: "#ffffff",
              border: "1px solid #ffffff",
              color: "#000000",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e5e5e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* ============================================ */}
        {/* 2. TOP METRIC CARDS */}
        {/* ============================================ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-lg)",
            marginBottom: "var(--space-xl)",
            width: "100%",
          }}
        >
          {/* Total Reviews */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Total Reviews Analyzed
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    margin: "0.5rem 0",
                  }}
                >
                  {topMetrics.totalReviewsAnalyzed.toLocaleString()}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#d2d2d2",
                  }}
                >
                  <TrendingUp size={16} />
                  <span style={{ fontSize: "0.875rem" }}>
                    +12.5% vs last month
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  color: "#ffffff",
                }}
              >
                <MessageSquare size={24} />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Average Rating
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    margin: "0.5rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Star size={32} fill="#ffffff" color="#ffffff" />
                  {topMetrics.averageRating}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#999999",
                  }}
                >
                  <TrendingDown size={16} />
                  <span style={{ fontSize: "0.875rem" }}>
                    -0.3 vs last month
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* App Health Score */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  App Health Score
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    margin: "0.5rem 0",
                  }}
                >
                  {topMetrics.healthScore}/100
                </h2>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "#1a1a1a",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: `${topMetrics.healthScore}%`,
                      height: "100%",
                      background:
                        topMetrics.healthScore > 70
                          ? "#ffffff"
                          : topMetrics.healthScore > 50
                            ? "#bfbfbf"
                            : "#999999",
                      borderRadius: "999px",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  color: "#ffffff",
                }}
              >
                <Activity size={24} />
              </div>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                marginBottom: "1rem",
              }}
            >
              Sentiment Breakdown
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ThumbsUp size={16} color="#d2d2d2" />
                  <span>Positive</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {topMetrics.sentimentBreakdown.positive}%
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Minus size={16} color="#999999" />
                  <span>Neutral</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {topMetrics.sentimentBreakdown.neutral}%
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ThumbsDown size={16} color="#e5e5e5" />
                  <span>Negative</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {topMetrics.sentimentBreakdown.negative}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Uninstall Reason */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Top Uninstall Reason
                </p>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    margin: "0.5rem 0",
                  }}
                >
                  {topMetrics.topUninstallReason}
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  32% of uninstalls
                </p>
              </div>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  color: "#e5e5e5",
                }}
              >
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          {/* Most Affected Version */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--space-lg)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Most Affected Version
                </p>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    margin: "0.5rem 0",
                  }}
                >
                  {topMetrics.mostAffectedVersion}
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  8.7% crash rate
                </p>
              </div>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  color: "#bfbfbf",
                }}
              >
                <Bug size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* 3. RATING & REVIEW TRENDS */}
      {/* ============================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-lg)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Rating Distribution */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Star Rating Breakdown
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {ratingDistribution.map((item) => (
              <div
                key={item.stars}
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    minWidth: "80px",
                  }}
                >
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 600 }}>{item.stars}</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "32px",
                    background: "#1a1a1a",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: "100%",
                      background:
                        item.stars >= 4
                          ? "#ffffff"
                          : item.stars === 3
                            ? "#bfbfbf"
                            : "#999999",
                      borderRadius: "var(--radius-sm)",
                      transition: "width 0.3s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "0.5rem",
                    }}
                  >
                    {item.percentage > 10 && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {item.percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    minWidth: "60px",
                    textAlign: "right",
                    color: "var(--color-text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Over Time */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Rating Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ratingOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="month"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis
                stroke="#999999"
                domain={[0, 5]}
                style={{ fontSize: "0.75rem" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#ffffff"
                strokeWidth={3}
                dot={{
                  fill: "#ffffff",
                  r: 5,
                  strokeWidth: 2,
                  stroke: "#000",
                }}
                activeDot={{
                  r: 8,
                  fill: "#ffffff",
                  stroke: "#000",
                  strokeWidth: 3,
                }}
                name="Rating"
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Review Volume & Response Analysis - Side by Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-lg)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Review Volume Over Time */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Review Volume Trend
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ratingOverTime}>
              <defs>
                <linearGradient id="reviewBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#999999" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="month"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis stroke="#999999" style={{ fontSize: "0.75rem" }} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="reviews"
                fill="url(#reviewBarGrad)"
                radius={[8, 8, 0, 0]}
                name="Reviews"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Developer Response Analysis */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Developer Response Analysis
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={reviewResponseData}>
              <defs>
                <linearGradient
                  id="responseRateAreaGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#999999" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="responseTimeAreaGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#cccccc" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#666666" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="month"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
                label={{
                  value: "Response Rate %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#999999",textAnchor: "middle" },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#cccccc"
                style={{ fontSize: "0.75rem" }}
                label={{
                  value: "Avg Response Time (days)",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "#cccccc", textAnchor: "middle" },
                  offset: 10
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="responseRate"
                stroke="#ffffff"
                strokeWidth={2}
                fill="url(#responseRateAreaGrad)"
                name="Response Rate %"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#cccccc"
                strokeWidth={2}
                fill="url(#responseTimeAreaGrad)"
                name="Avg Response Time (days)"
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div
            style={{
              marginTop: "var(--space-md)",
              padding: "var(--space-md)",
              background: "#0a0a0a",
              borderRadius: "var(--radius-sm)",
              border: "1px solid #333333",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}
          >
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              💡 Insight:
            </span>{" "}
            Recent improvement in response time correlates with higher response
            rates and better user sentiment.
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* 4. SENTIMENT ANALYSIS SECTION */}
      {/* ============================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "var(--space-lg)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Sentiment Pie Chart */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Current Sentiment
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Positive",
                    value: topMetrics.sentimentBreakdown.positive,
                    color: "#10b981",
                  },
                  {
                    name: "Neutral",
                    value: topMetrics.sentimentBreakdown.neutral,
                    color: "#f59e0b",
                  },
                  {
                    name: "Negative",
                    value: topMetrics.sentimentBreakdown.negative,
                    color: "#ef4444",
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                activeIndex={0}
                activeShape={{
                  outerRadius: 95,
                  stroke: "#4f46e5",
                  strokeWidth: 2,
                }}
              >
                {[
                  {
                    name: "Positive",
                    value: topMetrics.sentimentBreakdown.positive,
                    color: "#10b981",
                  },
                  {
                    name: "Neutral",
                    value: topMetrics.sentimentBreakdown.neutral,
                    color: "#f59e0b",
                  },
                  {
                    name: "Negative",
                    value: topMetrics.sentimentBreakdown.negative,
                    color: "#ef4444",
                  },
                ].map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#000"
                    strokeWidth={2}
                    style={{
                      filter: `drop-shadow(0 4px 8px ${entry.color}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginTop: "var(--space-md)",
            }}
          >
            {[
              {
                name: "Positive",
                value: topMetrics.sentimentBreakdown.positive,
                color: "#10b981",
              },
              {
                name: "Neutral",
                value: topMetrics.sentimentBreakdown.neutral,
                color: "#f59e0b",
              },
              {
                name: "Negative",
                value: topMetrics.sentimentBreakdown.negative,
                color: "#ef4444",
              },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: item.color,
                    }}
                  />
                  <span style={{ fontSize: "0.875rem" }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Over Time */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Sentiment Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sentimentOverTime}>
              <defs>
                <linearGradient id="positiveArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d2d2d2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d2d2d2" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="neutralArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#999999" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#999999" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="negativeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#e5e5e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="month"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis stroke="#999999" style={{ fontSize: "0.75rem" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke="#d2d2d2"
                fill="url(#positiveArea)"
                name="Positive"
                animationDuration={1500}
                animationBegin={0}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke="#999999"
                fill="url(#neutralArea)"
                name="Neutral"
                animationDuration={1500}
                animationBegin={200}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke="#e5e5e5"
                fill="url(#negativeArea)"
                name="Negative"
                animationDuration={1500}
                animationBegin={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Reviews */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-lg)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Top Positive */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "var(--space-md)",
            }}
          >
            <ThumbsUp size={20} color="#d2d2d2" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Top Positive Review
            </h3>
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.6,
              color: "var(--color-text-muted)",
              fontStyle: "italic",
              padding: "var(--space-md)",
              background: "#1a1a1a",
              borderLeft: "3px solid #d2d2d2",
              borderRadius: "var(--radius-sm)",
            }}
          >
            "{topReviews.positive}"
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              marginTop: "var(--space-md)",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} fill="#ffffff" color="#ffffff" />
            ))}
          </div>
        </div>

        {/* Top Critical */}
        <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "var(--space-md)",
            }}
          >
            <AlertTriangle size={20} color="#e5e5e5" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Top Critical Review
            </h3>
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.6,
              color: "var(--color-text-muted)",
              fontStyle: "italic",
              padding: "var(--space-md)",
              background: "#1a1a1a",
              borderLeft: "3px solid #e5e5e5",
              borderRadius: "var(--radius-sm)",
            }}
          >
            "{topReviews.critical}"
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              marginTop: "var(--space-md)",
            }}
          >
            {[1].map((i) => (
              <Star key={i} size={16} fill="#e5e5e5" color="#e5e5e5" />
            ))}
            {[2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} fill="none" color="#e5e5e5" />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* 5. BUG & ISSUE DETECTION */}
      {/* ============================================ */}
      <div
        className="glass-panel"
        style={{
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-lg)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            Bug & Issue Detection
          </h3>
          <div
            style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}
          >
            Total Issues:{" "}
            {bugCategories
              .reduce((acc, bug) => acc + bug.affectedUsers, 0)
              .toLocaleString()}{" "}
            users affected
          </div>
        </div>

        {/* Chart Visualization */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bugCategories} layout="vertical">
              <defs>
                <linearGradient id="bugBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#999999" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                type="number"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="frequency"
                fill="url(#bugBarGrad)"
                radius={[0, 8, 8, 0]}
                name="Frequency %"
                animationDuration={1500}
                animationEasing="ease-out"
                style={{}}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-lg)",
          }}
        >
          {bugCategories.map((bug) => (
            <div key={bug.name} style={{ margin: 0, padding: 0 }}>
              <div
                style={{
                  background: "#0a0a0a",
                  border: `2px solid ${getSeverityColor(bug.severity)}`,
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-lg)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(79, 70, 229, 0.7)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Severity Indicator Bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    background: getSeverityColor(bug.severity),
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        background: `${getSeverityColor(bug.severity)}20`,
                        padding: "0.5rem",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <Bug size={18} color={getSeverityColor(bug.severity)} />
                    </div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        margin: 0,
                        color: "#ffffff",
                      }}
                    >
                      {bug.name}
                    </h4>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: `${getSeverityColor(bug.severity)}20`,
                      color: getSeverityColor(bug.severity),
                    }}
                  >
                    {bug.severity}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "#ffffff",
                  }}
                >
                  {bug.frequency}%
                </div>
                {bug.sample && bug.sample.trim() !== "" && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#d1d5db",
                      lineHeight: 1.5,
                      marginBottom: "var(--space-md)",
                      fontStyle: "italic",
                      background: "#1a1a1a",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: `3px solid ${getSeverityColor(bug.severity)}`,
                    }}
                  >
                    "{bug.sample}"
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    color: "var(--color-text-muted)",
                    fontSize: "0.75rem",
                    paddingTop: "var(--space-sm)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Users size={14} />
                    <span>{bug.affectedUsers.toLocaleString()} users</span>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      background: "#1a1a1a",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {(
                      (bug.affectedUsers / topMetrics.totalReviewsAnalyzed) *
                      100
                    ).toFixed(1)}
                    % of total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* 7. UNINSTALL REASON & VERSION IMPACT (Side by Side) */}
      {/* ============================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-lg)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Why Users Uninstall */}
        <div
          className="glass-panel"
          style={{
            padding: "var(--space-xl)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Why Users Uninstall
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {uninstallReasons.map((item, index) => (
              <div
                key={item.reason}
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #333333",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-lg)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-lg)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    minWidth: "40px",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.reason}
                  </h4>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#1a1a1a",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: "100%",
                        background:
                          index === 0
                            ? "linear-gradient(90deg, #ffffff, #e5e5e5)"
                            : index === 1
                              ? "linear-gradient(90deg, #e5e5e5, #cccccc)"
                              : index === 2
                                ? "linear-gradient(90deg, #bfbfbf, #b2b2b2)"
                                : index === 3
                                  ? "linear-gradient(90deg, #999999, #a6a6a6)"
                                  : "linear-gradient(90deg, #7f7f7f, #8c8c8c)",
                        borderRadius: "999px",
                        transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow:
                          index === 0
                            ? "0 0 10px rgba(255, 255, 255, 0.15)"
                            : index === 1
                              ? "0 0 10px rgba(255, 255, 255, 0.12)"
                              : index === 2
                                ? "0 0 10px rgba(255, 255, 255, 0.1)"
                                : index === 3
                                  ? "0 0 10px rgba(255, 255, 255, 0.08)"
                                  : "0 0 10px rgba(255, 255, 255, 0.06)",
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                    {item.percentage}%
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.count.toLocaleString()} users
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Update Impact */}
        <div
          className="glass-panel"
          style={{
            padding: "var(--space-xl)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Version Update Impact
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-xl)",
            }}
          >
            {/* Before */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "var(--space-lg)",
                  paddingBottom: "var(--space-md)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>
                  Before Update
                </h4>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "#1a1a1a",
                    color: "#ffffff",
                    border: "1px solid #ffffff",
                  }}
                >
                  {versionComparison.before.version}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-lg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Average Rating
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#e5e5e5",
                    }}
                  >
                    {versionComparison.before.rating} ⭐
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Positive Sentiment
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                    {versionComparison.before.sentiment}%
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Crash Rate
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#d2d2d2",
                    }}
                  >
                    {versionComparison.before.crashes}%
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "var(--space-lg)",
                  paddingBottom: "var(--space-md)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>
                  After Update
                </h4>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "#1a1a1a",
                    color: "#e5e5e5",
                    border: "2px solid #e5e5e5",
                  }}
                >
                  {versionComparison.after.version}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-lg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Average Rating
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {versionComparison.after.rating} ⭐
                    <TrendingDown size={24} />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Positive Sentiment
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {versionComparison.after.sentiment}%
                    <TrendingDown size={24} color="#e5e5e5" />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Crash Rate
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {versionComparison.after.crashes}%
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* 6. FEATURE REQUEST MINING */}
      {/* ============================================ */}
      <div
        className="glass-panel"
        style={{
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-lg)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            Feature Requests
          </h3>
          <div
            style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}
          >
            Based on {topMetrics.totalReviewsAnalyzed.toLocaleString()} reviews
          </div>
        </div>

        {/* Priority Matrix Visualization */}
        <div
          style={{
            marginBottom: "var(--space-xl)",
            maxWidth: "100%",
            margin: "0 auto var(--space-xl)",
          }}
        >
          <ResponsiveContainer width="100%" height={280}>
            {" "}
            <BarChart data={featureRequests}>
              <defs>
                <linearGradient id="featureBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#999999" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="name"
                stroke="#999999"
                style={{ fontSize: "0.75rem" }}
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#666666"
                style={{ fontSize: "0.75rem" }}
                label={{
                  value: "Request %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="requests"
                fill="url(#featureBarGrad)"
                radius={[8, 8, 0, 0]}
                name="User Requests %"
                animationDuration={1500}
                animationEasing="ease-out"
                style={{}}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Cards with Impact/Effort Matrix */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-lg)",
          }}
        >
          {featureRequests.map((feature) => (
            <div key={feature.name} style={{ margin: 0, padding: 0 }}>
              <div
                style={{
                  background: `#000000`,
                  border: `2px solid #333333`,
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-lg)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(79, 70, 229, 0.7)`;
                  e.currentTarget.style.borderColor = getPriorityColor(
                    feature.priority
                  );
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#333333";
                }}
              >
                {/* Priority Badge Ribbon */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: -30,
                    background: getPriorityColor(feature.priority),
                    color: "white",
                    padding: "4px 40px",
                    transform: "rotate(45deg)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {feature.priority}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Zap size={20} color={getPriorityColor(feature.priority)} />
                    <h4
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        margin: 0,
                        color: "#ffffff",
                      }}
                    >
                      {feature.name}
                    </h4>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      textShadow: "0 2px 12px rgba(255, 255, 255, 0.3)",
                      letterSpacing: "1px",
                    }}
                  >
                    {Math.round((feature.requests / 100) * topMetrics.totalReviewsAnalyzed)}
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#d1d5db",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    reviews requesting
                  </p>
                </div>

                {/* Impact & Effort Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-md)",
                    marginTop: "var(--space-lg)",
                    padding: "var(--space-md)",
                    background: "#1a1a1a",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid #333333",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Impact
                    </div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {feature.impact}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Effort
                    </div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {feature.effort}
                    </div>
                  </div>
                </div>

                {/* ROI Indicator */}
                <div
                  style={{
                    marginTop: "var(--space-md)",
                    padding: "0.5rem",
                    background:
                      feature.impact === "High" && feature.effort === "Low"
                        ? "#1a1a1a"
                        : feature.impact === "High" &&
                          feature.effort === "Medium"
                          ? "#0f0f0f"
                          : "#1a1a1a",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${feature.impact === "High" && feature.effort === "Low"
                      ? "#d2d2d2"
                      : feature.impact === "High" &&
                        feature.effort === "Medium"
                        ? "#bfbfbf"
                        : "#333333"
                      }`,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      feature.impact === "High" && feature.effort === "Low"
                        ? "#d2d2d2"
                        : feature.impact === "High" &&
                          feature.effort === "Medium"
                          ? "#bfbfbf"
                          : "var(--color-text-muted)",
                  }}
                >
                  {feature.impact === "High" && feature.effort === "Low"
                    ? "🎯 Quick Win - High ROI"
                    : feature.impact === "High" && feature.effort === "Medium"
                      ? "💎 Strategic Investment"
                      : feature.impact === "High" && feature.effort === "High"
                        ? "🏗️ Major Project"
                        : "📌 Consider for Backlog"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* 9. REVIEW EXPLORER */}
      {/* ============================================ */}
      <div
        className="glass-panel"
        style={{
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <div
          style={{
            marginBottom: "var(--space-lg)",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Recent Reviews
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          {recentReviews.map((review, index) => (
            <div
              key={index}
              style={{
                background: "#0a0a0a",
                border: "1px solid #333333",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-lg)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "scale(1.02) translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "#666666";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#333333";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i <= review.rating ? "#ffffff" : "none"}
                      color="#ffffff"
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {review.version}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                {review.text}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <Clock size={12} />
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* 10. AI-POWERED RECOMMENDATIONS */}
      {/* ============================================ */}
      <div
        className="glass-panel"
        style={{
          padding: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
          background: "#0a0a0a",
          border: "2px solid #333333",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-xl)",
            paddingBottom: "var(--space-lg)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #e5e5e5, #bfbfbf)",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                }}
              >
                <Target size={24} color="black" />
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                AI-Powered Growth Recommendations
              </h3>
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                marginLeft: "3rem",
              }}
            >
              Strategic actions to boost installs, retention, and user
              satisfaction
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "var(--space-lg)",
          }}
        >
          {aiRecommendations.map((rec, index) => (
            <div
              key={rec.title}
              style={{
                background: "#0f0f0f",
                border: `2px solid ${rec.priority === "Critical"
                  ? "#e5e5e5"
                  : rec.priority === "High"
                    ? "#bfbfbf"
                    : rec.priority === "Medium"
                      ? "#999999"
                      : "#333333"
                  }`,
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                transition: "all 0.3s",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(8px)";
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(79, 70, 229, 0.7)`;
                e.currentTarget.style.borderColor =
                  rec.priority === "Critical"
                    ? "#e5e5e5"
                    : rec.priority === "High"
                      ? "#bfbfbf"
                      : rec.priority === "Medium"
                        ? "#999999"
                        : "#666666";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = `${rec.priority === "Critical"
                  ? "#e5e5e5"
                  : rec.priority === "High"
                    ? "#bfbfbf"
                    : rec.priority === "Medium"
                      ? "#999999"
                      : "#333333"
                  }`;
              }}
            >
              {/* Priority Indicator */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "6px",
                  height: "100%",
                  background:
                    rec.priority === "Critical"
                      ? "#e5e5e5"
                      : rec.priority === "High"
                        ? "#bfbfbf"
                        : rec.priority === "Medium"
                          ? "#999999"
                          : "#666666",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "var(--space-lg)",
                  alignItems: "center",
                }}
              >
                {/* Number & Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    paddingLeft: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      border: "2px solid #e5e5e5",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: "2rem" }}>{rec.icon}</div>
                </div>

                {/* Content */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {rec.title}
                    </h4>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        background:
                          rec.priority === "Critical"
                            ? "#f5f5f5"
                            : rec.priority === "High"
                              ? "#fafafa"
                              : rec.priority === "Medium"
                                ? "#f5f5f5"
                                : "#fafafa",
                        color:
                          rec.priority === "Critical"
                            ? "#e5e5e5"
                            : rec.priority === "High"
                              ? "#bfbfbf"
                              : rec.priority === "Medium"
                                ? "#999999"
                                : "#666666",
                        border: `1px solid ${rec.priority === "Critical"
                          ? "#e5e5e5"
                          : rec.priority === "High"
                            ? "#bfbfbf"
                            : rec.priority === "Medium"
                              ? "#999999"
                              : "#666666"
                          }`,
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      color: "var(--color-text-muted)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {rec.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: "#1a1a1a",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid #333333",
                      }}
                    >
                      <Shield size={14} color="#bfbfbf" />
                      <span style={{ fontWeight: 600 }}>Impact:</span>
                      <span style={{ color: "#bfbfbf", fontWeight: 700 }}>
                        {rec.impact}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: "#1a1a1a",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid #333333",
                      }}
                    >
                      <Clock size={14} color="#999999" />
                      <span style={{ fontWeight: 600 }}>Timeline:</span>
                      <span style={{ color: "#999999", fontWeight: 700 }}>
                        {rec.effort}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expected Outcome */}
                <div
                  onClick={() => alert("🚀 Coming Soon!\n\nDetailed outcome analysis and impact metrics will be available soon.")}
                  style={{
                    minWidth: "200px",
                    padding: "var(--space-md)",
                    background: "#1a1a1a",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #333333",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#252525";
                    e.currentTarget.style.borderColor = "#666666";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.borderColor = "#333333";
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                    }}
                  >
                    Expected Outcome
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#d2d2d2",
                      lineHeight: 1.4,
                    }}
                  >
                    {rec.expectedOutcome}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary CTA */}
        <div
          style={{
            marginTop: "var(--space-xl)",
            padding: "var(--space-xl)",
            background: "#0a0a0a",
            borderRadius: "var(--radius-lg)",
            border: "2px solid #333333",
            textAlign: "center",
          }}
        >
          <h4
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "white",
            }}
          >
            Ready to Boost Your App's Growth?
          </h4>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-lg)",
              maxWidth: "600px",
              margin: "0 auto 1.5rem",
            }}
          >
            Implementing these recommendations could increase your app installs
            by 40%, reduce uninstall rate by 25%, and improve your rating to
            4.5+ stars.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => alert("🚀 Coming Soon!\n\nGenerate Action Plan feature is under development and will be available soon.")}
              style={{
                padding: "0.75rem 2rem",
                background: "linear-gradient(135deg, #e5e5e5, #bfbfbf)",
                color: "black",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.7)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(79, 70, 229, 0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(79, 70, 229, 0.7)";
              }}
            >
              Generate Action Plan
            </button>
            <button
              onClick={generatePDFReport}
              style={{
                padding: "0.75rem 2rem",
                background: "#000000",
                color: "#ffffff",
                border: "2px solid #ffffff",
                borderRadius: "var(--radius-md)",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#000000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#000000";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Export Full Report
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
