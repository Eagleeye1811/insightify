import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Sparkles,
  Brain,
  Activity,
  Zap,
  Clock,
  MessageCircle,
  AlertCircle,
  Lightbulb,
  Star,
  Download,
  CheckCircle2,
} from "lucide-react";
import { authenticatedFetch } from "../lib/authHelper";
import { useAuth } from "../context/AuthContext";
import "../pages/Landing.css";

const AnalyzeApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing analysis...");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Dynamic loading text animation
  useEffect(() => {
    if (!isAnalyzing) return;

    const loadingMessages = [
      "🔍 Searching Play Store...",
      "📥 Fetching reviews...",
      "📊 Processing data...",
      "🤖 Running AI analysis...",
      "💡 Generating insights...",
      "✨ Almost ready...",
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Real-time search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        console.log(`🔍 Searching for: ${searchQuery}`);

        const searchResponse = await authenticatedFetch(
          "http://localhost:5001/api/search-apps",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: searchQuery }),
          }
        );

        if (searchResponse.ok) {
          const data = await searchResponse.json();
          console.log(`✅ Found ${data.apps?.length || 0} apps`);
          setSearchResults(data.apps || []);
        } else {
          console.error("Search failed:", searchResponse.status);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectApp = async (app) => {
    setIsAnalyzing(true);
    setError("");
    setSearchResults([]);
    setSearchQuery(app.title);

    const appId = app.appId;

    try {
      console.log(`🔍 Starting analysis for: ${appId}`);

      // Step 1: Trigger scraping
      const analyzeResponse = await authenticatedFetch(
        "http://localhost:5001/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appId }),
        }
      );

      if (!analyzeResponse.ok) {
        throw new Error("Failed to start analysis");
      }

      const analyzeData = await analyzeResponse.json();
      console.log("✅ Analysis started:", analyzeData);

      // Step 2: Poll for data completion
      let attempts = 0;
      const maxAttempts = 60;

      const pollForData = async () => {
        while (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Polling attempt ${attempts}/${maxAttempts} for ${appId}...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));

          try {
            const statusResponse = await authenticatedFetch(
              `http://localhost:5001/api/results/${appId}`,
              {
                method: "GET",
              }
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();

              if (statusData.reviews && statusData.reviews.length > 0) {
                console.log(`✅ Reviews fetched! Count: ${statusData.reviews.length}`);
                console.log("🤖 Triggering AI analysis...");

                // Step 3: Trigger AI analysis
                const aiResponse = await authenticatedFetch(
                  "http://localhost:5001/api/analyze-ai",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ appId }),
                  }
                );

                if (aiResponse.ok) {
                  console.log("✅ AI analysis started successfully");

                  // Wait for AI to process (may take 30-60 seconds)
                  console.log("⏳ Waiting for AI analysis to complete...");
                  await new Promise((resolve) => setTimeout(resolve, 10000));

                  setAnalysisComplete(true);
                  setIsAnalyzing(false);

                  console.log("🎉 Analysis complete! Redirecting to dashboard...");

                  // Navigate to dashboard with appId after 2 seconds
                  setTimeout(() => {
                    navigate(`/dashboard?appId=${appId}`);
                  }, 2000);

                  return;
                }
              } else {
                console.log(`⏳ Waiting... Reviews not ready yet (attempt ${attempts}/${maxAttempts})`);
              }
            } else {
              console.log(`⏳ Waiting... Data not ready yet (${statusResponse.status})`);
            }
          } catch (error) {
            // 404 is expected while waiting, don't log as error
            if (error.message && !error.message.includes('404')) {
              console.error("⚠️ Polling error:", error.message);
            }
          }
        }

        throw new Error("Analysis timeout - reviews may be too large. Please try again.");
      };

      await pollForData();
    } catch (err) {
      console.error("❌ Analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                Analyze Your App
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Get instant AI-powered insights from Google Play Store reviews.
              <br className="hidden md:block" />
              Understand your users better and grow faster.
            </motion.p>
          </div>

          {/* Search Box */}
          {!isAnalyzing && !analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group max-w-3xl mx-auto"
            >
              <div className="relative flex items-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="pl-6 text-gray-400">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an app (e.g., Instagram, WhatsApp)..."
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-500 py-5 px-4 text-lg"
                  autoFocus
                  disabled={!user}
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50"
                >
                  {searchResults.map((app) => (
                    <div
                      key={app.appId}
                      onClick={() => handleSelectApp(app)}
                      className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 cursor-pointer transition-all border-b border-zinc-800 last:border-b-0"
                    >
                      <img
                        src={app.icon}
                        alt={app.title}
                        className="w-14 h-14 rounded-xl"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl items-center justify-center text-2xl"
                        style={{ display: "none" }}
                      >
                        📱
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {app.title}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {app.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {app.installs}
                          </span>
                        </div>
                      </div>
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Analysis Loading */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 text-center shadow-2xl"
            >
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Analyzing Your App
              </h3>
              <p className="text-purple-300 text-lg mb-4">{loadingText}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <Clock className="w-4 h-4" />
                <span>This may take 1-2 minutes...</span>
              </div>
            </motion.div>
          )}

          {/* Analysis Complete */}
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center shadow-2xl"
            >
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Analysis Complete!
              </h3>
              <p className="text-green-300 text-lg">
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl text-center shadow-lg"
            >
              <p className="font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </p>
            </motion.div>
          )}

          {/* Feature Stats */}
          {!isAnalyzing && !analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
            >
            {[
              {
                // icon: Brain,
                label: "Sentiment Analysis",
                value: "AI-Powered",
                color: "from-purple-500 to-violet-500",
              },
              {
                // icon: Activity,
                label: "Growth Insights",
                value: "Real-time",
                color: "from-purple-500 to-violet-500",
              },
              {
                // icon: Clock,
                label: "Review Tracking",
                value: "24/7",
                color: "from-purple-500 to-violet-500",
              },
              {
                // icon: MessageCircle,
                label: "User Feedback",
                value: "Instant",
                color: "from-purple-500 to-violet-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                ></div>
                <div className="relative p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-lg">
                  {/* <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div> */}
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          )}

          {/* Quick Tips */}
          {!isAnalyzing && !analysisComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center max-w-2xl mx-auto"
            >
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-white">Pro tip:</span> Start typing an app name
                to see real-time search results from Play Store
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzeApp;
