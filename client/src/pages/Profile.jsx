// client/src/pages/Profile.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Download, 
  Settings, 
  X,
  User,
  Mail,
  Globe,
  Lock,
  Clock,
  Pencil,
  History,
  FolderOpen,
  File,
  TrendingUp,   
  AlertCircle,  
  Target,
  BarChart2 // Added for the graph icon
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null); // For graph tooltip

  // Mock data for past reports
  const pastReports = [
    { id: 1, name: "Q4 Market Analysis.pdf", date: "Jan 24, 2026", size: "2.4 MB" },
    { id: 2, name: "Instagram Competitor Audit.pdf", date: "Jan 18, 2026", size: "1.1 MB" },
    { id: 3, name: "User Retention Study.pdf", date: "Jan 10, 2026", size: "3.8 MB" },
    { id: 4, name: "Q3 Performance Review.pdf", date: "Dec 20, 2025", size: "2.2 MB" },
    { id: 5, name: "Spotify Feature Request Log.csv", date: "Dec 15, 2025", size: "850 KB" },
  ];

  // Mock Data for the Usage Graph (Last 14 days)
  // height represents percentage relative to max
  const activityData = [
    { day: "Mon", count: 2, height: "30%" },
    { day: "Tue", count: 5, height: "60%" },
    { day: "Wed", count: 8, height: "90%" },
    { day: "Thu", count: 3, height: "40%" },
    { day: "Fri", count: 6, height: "70%" },
    { day: "Sat", count: 1, height: "20%" },
    { day: "Sun", count: 0, height: "5%" },
    { day: "Mon", count: 4, height: "50%" },
    { day: "Tue", count: 7, height: "80%" },
    { day: "Wed", count: 9, height: "100%" }, // Peak
    { day: "Thu", count: 5, height: "60%" },
    { day: "Fri", count: 8, height: "90%" },
    { day: "Sat", count: 2, height: "30%" },
    { day: "Sun", count: 1, height: "15%" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      
      {/* --- TOP HEADER --- */}
      <div className="bg-black border-b border-white/10 pt-24 pb-12 px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative">
          
          {/* Sign Out Button */}
          <button 
            onClick={handleLogout}
            className="absolute top-0 right-0 md:top-2 md:right-2 flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg transition-all text-xs font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          {/* Profile Photo */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-black object-cover shadow-2xl z-10"
              />
            ) : (
              <div className="relative w-28 h-28 md:w-36 md:h-36 bg-zinc-900 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-black z-10 text-zinc-400">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-black rounded-full z-20"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2 pt-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">{user.displayName}</h1>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10"
                    title="Edit Profile"
                >
                    <Pencil size={14} />
                </button>
            </div>
            <p className="text-zinc-400 font-medium text-lg">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Online
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                <ShieldCheck size={12} /> Analyst Tier
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                <Zap size={12} /> Pro Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        
        {/* IMPACT STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="bg-[#09090b] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={60} className="text-blue-500"/>
                </div>
                <div className="flex items-center gap-3 text-blue-400 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"><TrendingUp size={18} /></div>
                    <span className="text-sm font-medium text-zinc-400">Total Scans</span>
                </div>
                <div>
                    <span className="text-3xl font-bold text-white">42</span>
                    <p className="text-xs text-zinc-500 mt-1">Lifetime reports generated</p>
                </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#09090b] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle size={60} className="text-orange-500"/>
                </div>
                <div className="flex items-center gap-3 text-orange-400 mb-2">
                     <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"><AlertCircle size={18} /></div>
                    <span className="text-sm font-medium text-zinc-400">Issues Detect</span>
                </div>
                <div>
                    <span className="text-3xl font-bold text-white">128</span>
                    <p className="text-xs text-zinc-500 mt-1">Potential bugs found</p>
                </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#09090b] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Clock size={60} className="text-emerald-500"/>
                </div>
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><Clock size={18} /></div>
                    <span className="text-sm font-medium text-zinc-400">Time Saved</span>
                </div>
                <div>
                    <span className="text-3xl font-bold text-white">~14h</span>
                    <p className="text-xs text-zinc-500 mt-1">Compared to manual</p>
                </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-[#09090b] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={60} className="text-purple-500"/>
                </div>
                <div className="flex items-center gap-3 text-purple-400 mb-2">
                     <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"><Target size={18} /></div>
                    <span className="text-sm font-medium text-zinc-400">Top Focus</span>
                </div>
                <div>
                    <span className="text-xl font-bold text-white truncate">Mobile Apps</span>
                    <p className="text-xs text-zinc-500 mt-1">Most frequent category</p>
                </div>
            </div>
        </div>

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Quick Actions */}
          <div className="bg-[#09090b] rounded-xl border border-white/10 p-8 shadow-sm flex flex-col h-full">
             <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} /> Quick Actions
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 border border-blue-500 text-sm">
                  <FileText size={18} /> 
                  <span>Generate New Report</span>
              </button>
              <button 
                onClick={() => setShowReports(true)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white py-3.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 text-sm group"
              >
                  <FolderOpen size={18} className="text-zinc-500 group-hover:text-blue-400 transition-colors"/> 
                  <span>View Past Reports</span>
              </button>
            </div>
          </div>

          {/* Card 2: Scan History */}
          <div className="bg-[#09090b] rounded-xl border border-white/10 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
              <h3 className="text-lg font-semibold text-white">Scan History</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">App Name</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-zinc-900/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-shadow"></div> Spotify
                    </td>
                    <td className="px-6 py-4 text-zinc-400">Deep Analysis</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Completed</span></td>
                  </tr>
                  <tr className="hover:bg-zinc-900/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-shadow"></div> Instagram
                    </td>
                    <td className="px-6 py-4 text-zinc-400">Quick Scan</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Archived</span></td>
                  </tr>
                  <tr className="hover:bg-zinc-900/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-shadow"></div> Uber
                    </td>
                    <td className="px-6 py-4 text-zinc-400">Bug Report</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- NEW: USAGE FREQUENCY GRAPH --- */}
        <div className="bg-[#09090b] rounded-xl border border-white/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart2 className="text-indigo-400" size={20} /> Analysis Frequency
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">Your usage activity over the last 14 days.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-white">61</span>
                        <span className="text-xs text-zinc-500">Scans in 14 days</span>
                    </div>
                </div>
            </div>

            {/* The Graph Container */}
            <div className="w-full h-40 flex items-end justify-between gap-2 md:gap-4 pt-4 border-t border-white/5">
                {activityData.map((data, index) => (
                    <div 
                        key={index} 
                        className="relative group flex-1 flex flex-col justify-end items-center h-full"
                        onMouseEnter={() => setHoveredDay(index)}
                        onMouseLeave={() => setHoveredDay(null)}
                    >
                        {/* Tooltip */}
                        <div className={`absolute -top-10 bg-zinc-800 text-white text-xs py-1 px-2 rounded-md border border-white/10 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${hoveredDay === index ? 'opacity-100' : 'opacity-0'}`}>
                            {data.count} Scans • {data.day}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-800"></div>
                        </div>

                        {/* The Bar */}
                        <div 
                            style={{ height: data.height }} 
                            className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out ${
                                hoveredDay === index 
                                ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' 
                                : 'bg-zinc-800 hover:bg-zinc-700'
                            } relative overflow-hidden`}
                        >
                             {/* Gradient Overlay for "Active" look */}
                             <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent"></div>
                        </div>

                        {/* X-Axis Label */}
                        <span className="text-[10px] text-zinc-600 mt-2 font-medium uppercase tracking-wider hidden sm:block">
                            {data.day}
                        </span>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* --- REPORT HISTORY MODAL --- */}
      {showReports && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowReports(false)}
            ></div>
            <div className="relative bg-[#09090b] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <History size={20} className="text-blue-400"/> Report Archive
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1">Access and download your previously generated reports.</p>
                    </div>
                    <button onClick={() => setShowReports(false)} className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
                    <div className="divide-y divide-white/5">
                        {pastReports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                                        <File size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">{report.name}</h4>
                                        <p className="text-zinc-500 text-xs mt-0.5">{report.date} • {report.size}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Download PDF">
                                    <Download size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 bg-zinc-900/30 rounded-b-2xl text-center">
                    <button onClick={() => setShowReports(false)} className="text-sm text-zinc-500 hover:text-white transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* --- ACCOUNT SETTINGS MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowSettings(false)}
          ></div>

          <div className="relative bg-[#09090b] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#09090b] rounded-t-2xl z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings size={20} className="text-blue-400"/> Account Settings
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">Update your personal preferences.</p>
                </div>
                <button 
                    onClick={() => setShowSettings(false)}
                    className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type="text" 
                            defaultValue={user.displayName || "Aditya"} 
                            className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type="email" 
                            defaultValue={user.email} 
                            disabled
                            className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-500 cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Language</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <select className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Timezone</label>
                    <div className="relative">
                         <Clock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                         <select className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option>UTC+0</option>
                            <option>IST (UTC+5:30)</option>
                            <option>PST (UTC-8:00)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type="password" 
                            defaultValue="......" 
                            className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            </div>
            
            <div className="p-6 bg-zinc-900/50 border-t border-white/10 flex justify-end gap-3 rounded-b-2xl">
                <button 
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2.5 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    className="bg-blue-600 text-white hover:bg-blue-500 px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                    onClick={() => setShowSettings(false)}
                >
                    Save Changes
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;