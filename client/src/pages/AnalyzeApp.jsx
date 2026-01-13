import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'lucide-react'; // Assuming lucide-react is installed, if not we can fail gracefully or use text
import { Search, Loader2, Play } from 'lucide-react';
import { authenticatedFetch } from '../lib/authHelper';
import { useAuth } from '../context/AuthContext';

const AnalyzeApp = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await authenticatedFetch('http://localhost:5001/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ term: searchTerm }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Please log in to analyze apps');
                    navigate('/login');
                    return;
                }
                throw new Error(data.error || 'Failed to start analysis');
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
        <div className="min-h-screen bg-[#0f1014] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
                        <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Insightify
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Analyze any Google Play Store app instantly.
                    </p>
                </div>

                <form onSubmit={handleAnalyze} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                    <div className="relative flex items-center bg-[#1a1b26] rounded-xl overflow-hidden">
                        <Search className="w-5 h-5 text-gray-500 ml-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter App Name or Play Store URL..."
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-4 px-3"
                        />
                        <button
                            type="submit"
                            disabled={loading || !user}
                            className="mr-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing
                                </>
                            ) : !user ? (
                                'Please Login'
                            ) : (
                                'Analyze'
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {!user && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-xl text-sm text-center">
                        Please log in to analyze apps
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-[#1a1b26] border border-gray-800">
                        <div className="text-2xl font-bold text-white mb-1">300+</div>
                        <div className="text-sm text-gray-400">Reviews Analyzed</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#1a1b26] border border-gray-800">
                        <div className="text-2xl font-bold text-white mb-1">Detailed</div>
                        <div className="text-sm text-gray-400">Sentiment Analysis</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyzeApp;
