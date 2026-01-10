import React, { useState } from "react";
import { CardContainer, CardBody, CardItem } from "../components/ui/3d-card";

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
// MOCK DATA
// ============================================

const mockAppData = {
  icon: "https://cdn-icons-png.flaticon.com/512/732/732242.png",
  name: "TaskMaster Pro",
  developer: "ProductivityHub Inc.",
  category: "Productivity",
  installs: "5M+",
  averageRating: 4.2,
  totalReviews: 87420,
  lastUpdated: "2 hours ago",
  appVersion: "v3.2.1",
};

const topMetrics = {
  totalReviewsAnalyzed: 87420,
  averageRating: 4.2,
  sentimentBreakdown: { positive: 62, neutral: 23, negative: 15 },
  healthScore: 78,
  topUninstallReason: "Too many ads",
  mostAffectedVersion: "v3.2.0",
};

const ratingDistribution = [
  { stars: 5, count: 45234, percentage: 52 },
  { stars: 4, count: 18765, percentage: 21 },
  { stars: 3, count: 10543, percentage: 12 },
  { stars: 2, count: 6987, percentage: 8 },
  { stars: 1, count: 5891, percentage: 7 },
];

const ratingOverTime = [
  { month: "Jul 2025", rating: 4.5, reviews: 8234 },
  { month: "Aug 2025", rating: 4.4, reviews: 9123 },
  { month: "Sep 2025", rating: 4.3, reviews: 11456 },
  { month: "Oct 2025", rating: 4.1, reviews: 10987 },
  { month: "Nov 2025", rating: 4.0, reviews: 12345 },
  { month: "Dec 2025", rating: 4.2, reviews: 13876 },
  { month: "Jan 2026", rating: 4.2, reviews: 15234 },
];

const sentimentOverTime = [
  { month: "Jul", positive: 70, neutral: 20, negative: 10 },
  { month: "Aug", positive: 68, neutral: 22, negative: 10 },
  { month: "Sep", positive: 65, neutral: 23, negative: 12 },
  { month: "Oct", positive: 60, neutral: 25, negative: 15 },
  { month: "Nov", positive: 58, neutral: 24, negative: 18 },
  { month: "Dec", positive: 62, neutral: 23, negative: 15 },
  { month: "Jan", positive: 62, neutral: 23, negative: 15 },
];

const bugCategories = [
  {
    name: "App Crashes",
    frequency: 28,
    severity: "High",
    sample: "App crashes when opening notifications tab",
    affectedUsers: 2456,
  },
  {
    name: "Login Issues",
    frequency: 18,
    severity: "Medium",
    sample: "Cannot login with Google account",
    affectedUsers: 1573,
  },
  {
    name: "Payment Issues",
    frequency: 12,
    severity: "High",
    sample: "Payment gets stuck at processing",
    affectedUsers: 1047,
  },
  {
    name: "Performance Lag",
    frequency: 24,
    severity: "Medium",
    sample: "App becomes slow after 10 minutes of use",
    affectedUsers: 2098,
  },
  {
    name: "Installation Problems",
    frequency: 8,
    severity: "Low",
    sample: "Update fails to install on Android 13",
    affectedUsers: 698,
  },
];

const featureRequests = [
  {
    name: "Dark Mode",
    requests: 34,
    priority: "High",
    impact: "High",
    effort: "Medium",
  },
  {
    name: "Offline Mode",
    requests: 28,
    priority: "High",
    impact: "High",
    effort: "High",
  },
  {
    name: "Better UI Design",
    requests: 22,
    priority: "Medium",
    impact: "Medium",
    effort: "High",
  },
  {
    name: "Faster Sync",
    requests: 19,
    priority: "High",
    impact: "High",
    effort: "Medium",
  },
  {
    name: "Widget Support",
    requests: 15,
    priority: "Medium",
    impact: "Medium",
    effort: "Low",
  },
  {
    name: "Calendar Integration",
    requests: 12,
    priority: "Low",
    impact: "Medium",
    effort: "Medium",
  },
];

const uninstallReasons = [
  { reason: "Too many ads", percentage: 32, count: 2789 },
  { reason: "App crashes frequently", percentage: 28, count: 2445 },
  { reason: "Slow performance", percentage: 18, count: 1571 },
  { reason: "Confusing UI/UX", percentage: 12, count: 1047 },
  { reason: "Privacy concerns", percentage: 10, count: 873 },
];

const reviewResponseData = [
  {
    month: "Jul 2025",
    responseRate: 68,
    avgResponseTime: 3.2,
    totalResponses: 5602,
  },
  {
    month: "Aug 2025",
    responseRate: 72,
    avgResponseTime: 2.8,
    totalResponses: 6569,
  },
  {
    month: "Sep 2025",
    responseRate: 65,
    avgResponseTime: 4.1,
    totalResponses: 7446,
  },
  {
    month: "Oct 2025",
    responseRate: 58,
    avgResponseTime: 5.3,
    totalResponses: 6372,
  },
  {
    month: "Nov 2025",
    responseRate: 61,
    avgResponseTime: 4.7,
    totalResponses: 7530,
  },
  {
    month: "Dec 2025",
    responseRate: 75,
    avgResponseTime: 2.5,
    totalResponses: 10407,
  },
  {
    month: "Jan 2026",
    responseRate: 78,
    avgResponseTime: 2.1,
    totalResponses: 11882,
  },
];

const versionComparison = {
  before: { version: "v3.1.5", rating: 4.5, sentiment: 70, crashes: 3.2 },
  after: { version: "v3.2.0", rating: 4.0, sentiment: 58, crashes: 8.7 },
};

const recentReviews = [
  {
    text: "Love the new features but the app crashes too often now",
    rating: 3,
    version: "v3.2.0",
    date: "2 hours ago",
    tag: "Bug",
  },
  {
    text: "Best productivity app I've ever used! Keep it up!",
    rating: 5,
    version: "v3.2.1",
    date: "5 hours ago",
    tag: "Praise",
  },
  {
    text: "Please add dark mode, my eyes hurt at night",
    rating: 4,
    version: "v3.2.1",
    date: "1 day ago",
    tag: "Feature",
  },
  {
    text: "Can't login after latest update. Please fix!",
    rating: 1,
    version: "v3.2.0",
    date: "1 day ago",
    tag: "Bug",
  },
  {
    text: "Good app but too many ads make it unusable",
    rating: 2,
    version: "v3.2.1",
    date: "2 days ago",
    tag: "Feature",
  },
];

const topReviews = {
  positive:
    "This app has completely transformed my productivity workflow! The UI is intuitive and features are exactly what I need. Highly recommend!",
  critical:
    "App used to be great but after v3.2.0 update it crashes every time I try to open my tasks. Completely unusable right now. Very disappointed.",
};

const aiRecommendations = [
  {
    title: "Fix Critical Crash Issues Immediately",
    priority: "Critical",
    impact: "High",
    effort: "2-3 weeks",
    description:
      "Address the 28% crash rate causing major user frustration. Focus on v3.2.0 stability issues.",
    expectedOutcome: "+15% retention, +0.5 rating improvement",
    icon: "🔴",
  },
  {
    title: "Implement Dark Mode",
    priority: "High",
    impact: "High",
    effort: "1-2 weeks",
    description:
      "34% of users requesting this feature. Quick win that improves user experience significantly.",
    expectedOutcome: "+8% user satisfaction, +12% session time",
    icon: "🌙",
  },
  {
    title: "Reduce Ad Frequency",
    priority: "High",
    impact: "Very High",
    effort: "1 week",
    description:
      "32% of uninstalls due to ads. Balance monetization with user experience.",
    expectedOutcome: "-25% uninstall rate, +20% retention",
    icon: "📱",
  },
  {
    title: "Optimize App Performance",
    priority: "Medium",
    impact: "High",
    effort: "3-4 weeks",
    description:
      "Performance lag affecting 24% of users. Implement caching and optimize heavy operations.",
    expectedOutcome: "+10% user engagement, faster load times",
    icon: "⚡",
  },
  {
    title: "Add Offline Mode Support",
    priority: "Medium",
    impact: "Medium",
    effort: "4-6 weeks",
    description:
      "28% of users requesting offline functionality. Enable core features without internet.",
    expectedOutcome: "+15% daily active users, competitive advantage",
    icon: "📡",
  },
  {
    title: "Improve Onboarding Flow",
    priority: "Low",
    impact: "Medium",
    effort: "2 weeks",
    description:
      "Simplify initial setup to reduce friction and improve first-time user experience.",
    expectedOutcome: "+12% activation rate, better retention",
    icon: "🎯",
  },
];

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
  switch (priority) {
    case "High":
      return "#808080";
    case "Medium":
      return "#404808080040";
    case "Low":
      return "#808080";
    default:
      return "#999999";
  }
};

const getTagColor = (tag) => {
  switch (tag) {
    case "Bug":
      return "#1a1a1a";
    case "Feature":
      return "#404040";
    case "Praise":
      return "#666666";
    default:
      return "#999999";
  }
};

// ============================================
// COMPONENT
// ============================================

export default function Dashboard() {
  const [selectedFilter, setSelectedFilter] = useState("all");

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
          }}
        >
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
          <button
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
            Rating Trend (Last 6 Months)
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
                  style: { fill: "#999999" },
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
                  style: { fill: "#cccccc" },
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
                    {feature.requests}%
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#d1d5db",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    of users requesting
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
                    border: `1px solid ${
                      feature.impact === "High" && feature.effort === "Low"
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-lg)",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Recent Reviews
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["All", "Bug", "Feature", "Praise"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter.toLowerCase())}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background:
                    selectedFilter === filter.toLowerCase()
                      ? "#000000"
                      : "#1a1a1a",
                  color:
                    selectedFilter === filter.toLowerCase()
                      ? "#ffffff"
                      : "#999999",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
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
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: `${getTagColor(review.tag)}20`,
                      color: getTagColor(review.tag),
                    }}
                  >
                    {review.tag}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {review.version}
                  </span>
                </div>
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
          <div
            style={{
              background: "#f5f5f5",
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #e5e5e5",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginBottom: "0.25rem",
              }}
            >
              Potential Impact
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#2d2d2d",
              }}
            >
              +40%
            </div>
            <div
              style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}
            >
              installs & retention
            </div>
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
                border: `2px solid ${
                  rec.priority === "Critical"
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
                e.currentTarget.style.borderColor = `${
                  rec.priority === "Critical"
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
                        border: `1px solid ${
                          rec.priority === "Critical"
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
                  style={{
                    minWidth: "200px",
                    padding: "var(--space-md)",
                    background: "#1a1a1a",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #333333",
                    textAlign: "center",
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
