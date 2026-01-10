// client/src/pages/Profile.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth(); // <--- Get REAL user data here
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Send them back to home after logging out
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // If page loads but user isn't logged in yet (rare split-second case)
  if (!user) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Your Profile</h2>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="flex items-center gap-6 mb-8">
          {/* REAL User Profile Pic from Google */}
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-4 border-blue-50"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.displayName?.charAt(0) || "U"}
            </div>
          )}

          <div>
            {/* REAL User Name & Email */}
            <h3 className="text-xl font-semibold text-gray-900">{user.displayName}</h3>
            <p className="text-gray-500">{user.email}</p>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">
              Verified Analyst
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h4>
          <div className="space-y-3">
             {/* We will eventually pull this from the Database! */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="font-medium text-gray-900">Account Created</p>
              <p className="text-sm text-gray-500">Welcome to Insightify!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;