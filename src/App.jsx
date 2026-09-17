import { useState, useEffect } from 'react';
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
  
  const [userFavs, setUserFavs] = useState([]);
  const [userExp, setUserExp] = useState([]);
  
  const [view, setView] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadData = async () => {
    const data = await fetchDashboardData(user?.email);
    if (data) {
      setSongData(data.songOfTheDay);
      setPlaylists(data.playlists);
      setPlaylistMeta(data.playlistMeta || {});
      setActivePRs(data.activePRs || []);
      setUserFavs(data.userFavs || []);
      setUserExp(data.userExp || []);
    }
  };

  const handleLogout = () => { 
    googleLogout(); 
    setUser(null); 
    setUserFavs([]); 
    setUserExp([]);  
    setIsProfileOpen(false); 
    setView('dashboard'); 
  };

  useEffect(() => { 
    loadData(); 
  }, [user]);

  const isAdmin = user?.email === 'shriyarbiddala@gmail.com';
  const [prBruteOpen, setPrBruteOpen] = useState(false);
  const prId = 'pr-form';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col md:flex-row text-white font-sans selection:bg-indigo-500/30 bg-[#070514]">
      
      {/* EXCITING DIAGONAL LIQUID BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep base with a vibrant diagonal color sweep */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#02000f_10%,rgba(109,40,217,0.25)_45%,rgba(217,70,239,0.15)_60%,#02000f_90%)]" />
        
        {/* Liquid glass light ray / diagonal highlight */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.03)_45%,rgba(255,255,255,0.08)_50%,transparent_55%)] mix-blend-overlay" />
        
        {/* Glowing atmospheric liquid blobs */}
        <div className="absolute top-[-10%] left-[-15%] w-[70%] h-[80%] rounded-full bg-violet-600/30 blur-[130px] mix-blend-screen" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[80%] rounded-[100%] bg-fuchsia-600/25 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen" />
      </div>

      <nav className="relative z-50 sticky top-0 flex w-full flex-col border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl md:h-screen md:w-72 md:border-b-0 md:border-r shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {/* Scrollable inner container for desktop */}
        <div className="flex h-full w-full flex-col md:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          
          <div className="flex w-full items-center justify-between px-4 py-3 md:px-6 md:py-6">
            <h1
              className="flex cursor-pointer items-center gap-3 font-mono text-lg font-black tracking-tight text-indigo-300 sm:text-xl md:text-2xl"
              onClick={() => setView('dashboard')}
            >
              <Disc3 className="h-5 w-5 animate-[spin_3s_linear_infinite] text-indigo-400 sm:h-6 sm:w-6" />
              <span className="shrotify-ombre bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                ~/shrotify
              </span>
            </h1>

            <div className="block md:hidden">
              {!user ? (
                <div className="scale-75 origin-right sm:scale-90">
                  <GoogleLogin onSuccess={(res) => setUser(jwtDecode(res.credential))} shape="pill" theme="filled_black" />
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center rounded-full border border-white/10 bg-slate-900/80 transition-all hover:border-indigo-400/50"
                  >
                    <img src={user.picture} alt="Profile" className="h-9 w-9 rounded-full" referrerPolicy="no-referrer" />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-400 hover:bg-red-500/10">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="flex flex-row items-center overflow-x-auto px-4 pb-3 md:flex-col md:items-stretch md:overflow-visible md:px-6 md:pb-6 md:h-full scrollbar-hide">
            
            <div className="flex shrink-0 flex-row items-center gap-2 w-max md:w-full md:flex-col md:gap-3">
              <button
                onClick={() => setView('dashboard')}
                className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                  view === 'dashboard' ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              {user && (
                <button
                  onClick={() => setView('my-prs')}
                  className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                    view === 'my-prs' ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  My PRs
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setView('admin')}
                  className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                    view === 'admin' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-indigo-200 hover:bg-indigo-500/10 hover:text-white'
                  }`}
                >
                  Admin Panel
                </button>
              )}
              
              <a
                href={`#${prId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setView('dashboard');
                  setPrBruteOpen(true);
                  setTimeout(() => setPrBruteOpen(false), 500);
                  const el = document.getElementById(prId);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="md:hidden flex shrink-0 items-center gap-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-4 py-1.5 text-xs font-bold text-violet-200 transition-colors hover:bg-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)] backdrop-blur-md"
              >
                Request Music 
              </a>
            </div>

            <div className="hidden md:flex md:flex-col md:flex-1 w-full">
              
              <div className="flex-1 flex flex-col justify-center min-h-[2rem] py-4">
                <Turntable songData={songData} />
              </div>

              <div className="mb-4 relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 pointer-events-none" />
                <p className="relative z-10 mb-3 text-xs font-medium text-violet-200">Want to request more music?</p>
                <a
                  href={`#${prId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setView('dashboard');
                    setPrBruteOpen(true);
                    setTimeout(() => setPrBruteOpen(false), 500);
                    const el = document.getElementById(prId);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="relative z-10 inline-block w-full rounded-lg border border-white/10 bg-black/20 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] backdrop-blur-md"
                >
                  Submit a PR ↓
                </a>
              </div>

              <div className="mt-auto w-full pb-2 relative z-20">
                {!user ? (
                  <GoogleLogin onSuccess={(res) => setUser(jwtDecode(res.credential))} shape="rectangular" theme="filled_black" width="100%" />
                ) : (
                  <div className="relative w-full">
                    {isProfileOpen && (
                      <div className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg p-2 transition-all hover:border-violet-400/50 hover:bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
                    >
                      <img src={user.picture} alt="Profile" className="h-10 w-10 rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate text-sm font-bold text-white">{user.name}</span>
                        <span className="text-[10px] text-slate-300">View Profile</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden max-w-full px-4 py-5 sm:px-6 md:px-8 md:py-8">
        {view === 'admin' && isAdmin && (
          <div className="mx-auto max-w-7xl min-w-0">
            <AdminPanel songData={songData} playlists={playlists} playlistMeta={playlistMeta} activePRs={activePRs} onUpdate={loadData} />
          </div>
        )}

        {view === 'my-prs' && user && <UserPRs activePRs={activePRs} user={user} playlists={playlists} />}

        {view === 'dashboard' && (
          <div className="w-full flex flex-col min-w-0 pb-12">
            
            <div className="flex md:hidden w-full justify-center mb-10 overflow-hidden min-w-0">
              <Turntable songData={songData} />
            </div>

            <div className="w-full min-w-0">
              <Playlists
                playlists={playlists}
                playlistMeta={playlistMeta}
                user={user}
                userFavs={userFavs}
                userExp={userExp}
              />
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="w-full min-w-0 mt-8 mb-12">
            <PullRequest user={user} playlists={playlists} onUpdate={loadData} bruteOpen={prBruteOpen} id={prId} /> 
          </div>
        )}
      </main>
    </div>
  );
}