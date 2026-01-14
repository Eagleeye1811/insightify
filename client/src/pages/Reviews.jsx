import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { authenticatedFetch } from "../lib/authHelper";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  MessageSquare,
  User,
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus,
} from "lucide-react";
import AppSelector from "../components/AppSelector";

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get appId from URL params
  const selectedAppId = searchParams.get("appId") || "";

  // State Management
  const [appMetadata, setAppMetadata] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [hasCheckedForApps, setHasCheckedForApps] = useState(false);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 20;

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Auto-select first app from Firestore if no appId in URL
  useEffect(() => {
    const fetchAndSelectDefaultApp = async () => {
      if (!user || selectedAppId || hasCheckedForApps) return;

      try {
        setLoading(true);
        
        // Fetch user's apps from Firestore via API
        const res = await authenticatedFetch('http://localhost:5001/api/apps');
        
        if (res.ok) {
          const apps = await res.json();
          
          if (apps.length > 0) {
            // Auto-select the first app
            const firstAppId = apps[0].appId;
            console.log("📱 Auto-selecting default app from Firestore:", firstAppId);
            navigate(`/reviews?appId=${firstAppId}`, { replace: true });
          } else {
            console.log("No apps found in Firestore");
            setLoading(false);
          }
        } else {
          console.error("Failed to fetch apps");
          setLoading(false);
        }
        
        setHasCheckedForApps(true);
      } catch (err) {
        console.error("Error fetching default app:", err);
        setLoading(false);
        setHasCheckedForApps(true);
      }
    };

    fetchAndSelectDefaultApp();
  }, [user, selectedAppId, hasCheckedForApps, navigate]);

  // Fetch reviews when app is selected
  useEffect(() => {
    if (selectedAppId && user) {
      fetchReviews(selectedAppId);
    }
  }, [selectedAppId, user]);

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (review) =>
          review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rating filter
    if (selectedRating !== "all") {
      filtered = filtered.filter(
        (review) => review.score === parseInt(selectedRating)
      );
    }

    // Sentiment filter
    if (selectedSentiment !== "all") {
      filtered = filtered.filter((review) => {
        const sentiment = getSentiment(review.score);
        return sentiment === selectedSentiment;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date);
        case "oldest":
          return new Date(a.date) - new Date(b.date);
        case "highest":
          return b.score - a.score;
        case "lowest":
          return a.score - b.score;
        case "helpful":
          return (b.thumbsUpCount || 0) - (a.thumbsUpCount || 0);
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [reviews, searchQuery, selectedRating, selectedSentiment, sortBy]);

  const fetchReviews = async (appId) => {
    setLoading(true);
    setError(null);

    try {
      const userId = user.uid;
      const dataRef = collection(
        db,
        "users",
        userId,
        "apps",
        appId,
        "data"
      );

      // Fetch metadata and reviews in parallel
      const [metadataDoc, reviewsDoc] = await Promise.all([
        getDoc(doc(dataRef, "metadata")),
        getDoc(doc(dataRef, "reviews")),
      ]);

      if (!metadataDoc.exists()) {
        throw new Error("App metadata not found. Please analyze an app first.");
      }

      const metadata = metadataDoc.data();
      setAppMetadata(metadata);

      if (!reviewsDoc.exists()) {
        throw new Error("No reviews found for this app.");
      }

      const reviewsData = reviewsDoc.data();
      const reviewsList = reviewsData.list || [];

      setReviews(reviewsList);
      calculateStats(reviewsList);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList) => {
    const totalReviews = reviewsList.length;
    const totalRating = reviewsList.reduce(
      (sum, review) => sum + (review.score || 0),
      0
    );
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };

    reviewsList.forEach((review) => {
      const rating = review.score || 0;
      if (rating >= 1 && rating <= 5) {
        ratingBreakdown[rating]++;
      }

      const sentiment = getSentiment(rating);
      sentimentBreakdown[sentiment]++;
    });

    setStats({
      totalReviews,
      averageRating,
      sentimentBreakdown,
      ratingBreakdown,
    });
  };

  const getSentiment = (rating) => {
    if (rating >= 4) return "positive";
    if (rating >= 3) return "neutral";
    return "negative";
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "neutral":
        return <Minus className="w-4 h-4 text-yellow-400" />;
      case "negative":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "neutral":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      case "negative":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Rating", "User", "Review", "Thumbs Up"];
    const rows = filteredReviews.map((review) => [
      review.date || "",
      review.score || "",
      review.userName || "Anonymous",
      `"${(review.text || "").replace(/"/g, '""')}"`,
      review.thumbsUpCount || 0,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviews_${selectedAppId}_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Reviews Explorer
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Dive deep into user feedback and sentiment analysis
          </p>
        </div>

        {/* App Header with Metadata */}
        {appMetadata && (
          <div className="relative z-50 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              {appMetadata.icon && (
                <img
                  src={appMetadata.icon}
                  alt={appMetadata.title}
                  className="w-20 h-20 rounded-2xl border border-white/10"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{appMetadata.title}</h2>
                <p className="text-gray-400">{appMetadata.developer}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">
                      {appMetadata.score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    {appMetadata.installs || "N/A"} installs
                  </span>
                </div>
              </div>
              {/* App Selector on the right */}
              <div className="flex-shrink-0">
                <AppSelector />
              </div>
            </div>
          </div>
        )}

       
        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingBreakdown[rating];
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400 w-20 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        {reviews.length > 0 && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Sentiment Filter */}
              <div>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            {/* Sort & Export */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export CSV</span>
              </button>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-400">
              Showing {indexOfFirstReview + 1} -{" "}
              {Math.min(indexOfLastReview, filteredReviews.length)} of{" "}
              {filteredReviews.length} reviews
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-4 px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-300"
            >
              Analyze an App
            </button>
          </div>
        ) : currentReviews.length > 0 ? (
          <div className="space-y-4">
            {currentReviews.map((review, index) => {
              const sentiment = getSentiment(review.score);
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-white/20 transition-all duration-300"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white">
                        {(review.userName || "A")[0].toUpperCase()}
                      </div>

                      {/* User Info & Rating */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">
                            {review.userName || "Anonymous"}
                          </span>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${getSentimentColor(
                              sentiment
                            )}`}
                          >
                            {getSentimentIcon(sentiment)}
                            <span className="text-xs font-medium capitalize">
                              {sentiment}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.score
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-400 ml-2">
                            {review.score}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.date)}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {review.text || "No review text provided."}
                  </p>

                  {/* Review Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      {review.thumbsUpCount !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.thumbsUpCount}</span>
                        </div>
                      )}
                      {review.replyDate && (
                        <div className="flex items-center gap-1 text-sm text-green-400">
                          <MessageSquare className="w-4 h-4" />
                          <span>Developer Replied</span>
                        </div>
                      )}
                    </div>

                    {review.version && (
                      <div className="text-xs text-gray-500">
                        Version {review.version}
                      </div>
                    )}
                  </div>

                  {/* Developer Reply */}
                  {review.replyText && (
                    <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm">
                          Developer Response
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.replyDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 ml-10">
                        {review.replyText}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : !selectedAppId && !loading ? (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">
              No apps found. Please analyze an app first.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-300 font-medium"
            >
              Go to Analyze Page
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No reviews found matching your filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredReviews.length > reviewsPerPage && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === pageNumber
                          ? "bg-white text-black font-semibold"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span key={pageNumber} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
