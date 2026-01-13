import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authenticatedFetch } from '../lib/authHelper';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function AppSelector() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [searchParams] = useSearchParams();
    const currentAppId = searchParams.get('appId');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await authenticatedFetch('http://localhost:5001/api/apps');
                if (res.ok) {
                    const data = await res.json();
                    setApps(data);
                }
            } catch (error) {
                console.error("Failed to fetch apps", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const handleSelect = (appId) => {
        setIsOpen(false);
        if (appId !== currentAppId) {
            navigate(`/dashboard?appId=${appId}`);
        }
    };

    const currentApp = apps.find(a => a.appId === currentAppId);

    if (loading) return <div className="w-32 h-8 bg-zinc-800 animate-pulse rounded" />;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
            >
                {currentApp ? (
                    <>
                        {currentApp.icon && <img src={currentApp.icon} className="w-5 h-5 rounded-sm" alt="" />}
                        <span className="font-medium text-sm text-zinc-200">{currentApp.title}</span>
                    </>
                ) : (
                    <span className="text-zinc-400 text-sm">Select App</span>
                )}
                <ChevronDown size={14} className="text-zinc-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {apps.map(app => (
                            <button
                                key={app.appId}
                                onClick={() => handleSelect(app.appId)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-zinc-800 transition-colors ${app.appId === currentAppId ? 'bg-zinc-800/50' : ''}`}
                            >
                                {app.icon ? (
                                    <img src={app.icon} className="w-8 h-8 rounded-md" alt="" />
                                ) : (
                                    <div className="w-8 h-8 bg-zinc-700 rounded-md flex items-center justify-center text-xs text-zinc-400">
                                        {app.title.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-medium text-zinc-200 truncate">{app.title}</div>
                                    <div className="text-xs text-zinc-500 truncate">{app.appId}</div>
                                </div>
                            </button>
                        ))}
                        {apps.length === 0 && (
                            <div className="px-3 py-2 text-xs text-zinc-500 text-center">No apps found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
