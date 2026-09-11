import { useState, useEffect, useRef } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Turntable from './components/Turntable';
import Playlists from './components/Playlists';
import PullRequest from './components/PullRequest';
import AdminPanel from './components/AdminPanel';
import UserPRs from './components/UserPullRequests';
import { fetchDashboardData } from './api/sheets';
import { Disc3, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [songData, setSongData] = useState(null);
  const [playlists, setPlaylists] = useState({});
  const [playlistMeta, setPlaylistMeta] = useState({});
  const [activePRs, setActivePRs] = useState([]);
  const [view, setView] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadData = async () => {
    const data = await fetchDashboardData();
    if (data) {
      setSongData(data.songOfTheDay);
      setPlaylists(data.playlists);
      setPlaylistMeta(data.playlistMeta || {});
      setActivePRs(data.activePRs || []);
    }
  };

  const handleLogout = () => { 
    googleLogout(); 
    setUser(null); 
    setIsProfileOpen(false); 
    setView('dashboard'); 
  };

  useEffect(() => { loadData(); }, []);

  // Set the admin email to match your Google account
  const isAdmin = user?.email === 'shriyarbiddala@gmail.com';

  return (
    // NEW: Tame, dark purple radial background
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-gray-950 to-gray-950 text-white font-sans selection:bg-indigo-500/30">
      
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold font-mono text-indigo-400 flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <Disc3 className="w-6 h-6 animate-spin-slow text-indigo-500" /> 
              ~/shrotify
            </h1>
            
            <div className="hidden md:flex gap-1">
              <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>Dashboard</button>
              {user && <button onClick={() => setView('my-prs')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'my-prs' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>My PRs</button>}
              {isAdmin && <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-900/30'}`}>Admin Panel</button>}
            </div>
          </div>

          <div>
            {!user ? (
              <div className="scale-90 origin-right">
                 <GoogleLogin onSuccess={res => setUser(jwtDecode(res.credential))} shape="pill" theme="filled_black" />
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 pr-4 rounded-full border border-gray-800 transition-colors"
                >
                  <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                  <span className="text-sm font-bold hidden sm:block">{user.name}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 font-bold flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 mt-4">
        {view === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto">
            <AdminPanel songData={songData} playlists={playlists} playlistMeta={playlistMeta} activePRs={activePRs} onUpdate={loadData} />
          </div>
        )}

        {view === 'my-prs' && user && (
          <UserPRs activePRs={activePRs} user={user} />
        )}

        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[400px_1fr] gap-12 relative items-start">
            <div className="space-y-8 sticky top-28">
              <Turntable songData={songData} />
              <PullRequest user={user} />
            </div>
            <div>
              <Playlists playlists={playlists} playlistMeta={playlistMeta} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}