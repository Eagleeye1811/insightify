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
} from "lucide-react";
import { authenticatedFetch } from "../lib/authHelper";
import { useAuth } from "../context/AuthContext";
import "../pages/Landing.css";

const AnalyzeApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(
        "http://localhost:5001/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ term: searchTerm }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to analyze apps");
          navigate("/login");
          return;
        }
        throw new Error(data.error || "Failed to start analysis");
      }

      // Navigate to dashboard with appId
      navigate(`/dashboard?appId=${data.appId}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
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

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleAnalyze}
            className="relative group max-w-3xl mx-auto"
          >
            {/* Animated Glow Effect */}

            <div className="relative flex items-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="pl-6 text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter app name or Play Store URL..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-500 py-5 px-4 text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !user}
                className="m-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:scale-105 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : !user ? (
                  "Please Login"
                ) : (
                  <>
                    <span>Analyze Now</span>
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>

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

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-white">Pro tip:</span> You can paste
              the full Google Play Store URL or just the app name
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzeApp;
