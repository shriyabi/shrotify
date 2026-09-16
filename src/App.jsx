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
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col md:flex-row text-white font-sans selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-white/10 bg-slate-950/60 backdrop-blur-xl md:h-screen md:w-72 md:border-b-0 md:border-r">
        {/* Scrollable inner container for desktop */}
        <div className="flex h-full w-full flex-col md:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          
          {/* TOP HEADER: Neat flex row on mobile, standard header on desktop */}
          <div className="flex w-full items-center justify-between px-4 py-3 md:px-6 md:py-6">
            <h1
              className="flex cursor-pointer items-center gap-3 font-mono text-lg font-black tracking-tight text-indigo-300 sm:text-xl md:text-2xl"
              onClick={() => setView('dashboard')}
            >
              <Disc3 className="h-5 w-5 animate-[spin_3s_linear_infinite] text-indigo-400 sm:h-6 sm:w-6" />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                ~/shrotify
              </span>
            </h1>

            {/* MOBILE PROFILE (Hidden on desktop, keeps top row neat on phones) */}
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
                    <div className="absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
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
            
            {/* Navigation Links + Mobile CTA (All in one horizontal scrolling row on mobile) */}
            <div className="flex shrink-0 flex-row items-center gap-2 w-max md:w-full md:flex-col md:gap-3">
              <button
                onClick={() => setView('dashboard')}
                className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                  view === 'dashboard' ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              {user && (
                <button
                  onClick={() => setView('my-prs')}
                  className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                    view === 'my-prs' ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  My PRs
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setView('admin')}
                  className={`shrink-0 rounded-full md:rounded-lg px-4 py-1.5 text-xs font-bold transition-all sm:text-sm md:w-full md:text-left md:py-2.5 ${
                    view === 'admin' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-indigo-200 hover:bg-indigo-500/10 hover:text-white'
                  }`}
                >
                  Admin Panel
                </button>
              )}
              
              {/* MOBILE AD PILL (Only visible on mobile, part of scrollable row) */}
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
                className="md:hidden flex shrink-0 items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 text-xs font-bold text-indigo-200 transition-colors hover:bg-indigo-500/30"
              >
                Request Music 
              </a>
            </div>

            {/* DESKTOP EXCLUSIVES */}
            <div className="hidden md:flex md:flex-col md:flex-1 w-full">
              
              {/* Centered Song of the Day Turntable */}
              <div className="flex-1 flex flex-col justify-center min-h-[2rem] py-4">
                <Turntable songData={songData} />
              </div>

              {/* DESKTOP AD CARD */}
              <div className="mb-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 p-4 text-center">
                <p className="mb-3 text-xs font-medium text-indigo-200">Want to request more music?</p>
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
                  className="inline-block w-full rounded-lg border border-indigo-500/30 bg-indigo-500/20 py-2 text-xs font-bold text-indigo-100 transition-colors hover:bg-indigo-500/40 hover:text-white"
                >
                  Submit a PR ↓
                </a>
              </div>

              {/* DESKTOP PROFILE AT BOTTOM */}
              <div className="mt-auto w-full pb-2">
                {!user ? (
                  <GoogleLogin onSuccess={(res) => setUser(jwtDecode(res.credential))} shape="rectangular" theme="filled_black" width="100%" />
                ) : (
                  <div className="relative w-full">
                    {/* DROPDOWN POPPING UP OVER THE BUTTON */}
                    {isProfileOpen && (
                      <div className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-indigo-950/30">
                        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-2 transition-all hover:border-indigo-400/50 hover:bg-slate-800"
                    >
                      <img src={user.picture} alt="Profile" className="h-10 w-10 rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate text-sm font-bold text-slate-100">{user.name}</span>
                        <span className="text-[10px] text-slate-400">View Profile</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Added min-w-0 to allow child components to compress instead of overflowing out of bounds */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden max-w-full px-4 py-5 sm:px-6 md:px-8 md:py-8">
        {view === 'admin' && isAdmin && (
          <div className="mx-auto max-w-7xl min-w-0">
            <AdminPanel songData={songData} playlists={playlists} playlistMeta={playlistMeta} activePRs={activePRs} onUpdate={loadData} />
          </div>
        )}

        {view === 'my-prs' && user && <UserPRs activePRs={activePRs} user={user} playlists={playlists} />}

        {view === 'dashboard' && (
          <div className="h-full w-full flex flex-col min-w-0">
            
            {/* MOBILE ONLY TURNTABLE (Hidden on desktop) */}
            <div className="block md:hidden w-full flex justify-center mb-6 overflow-hidden min-w-0">
              <Turntable songData={songData} />
            </div>

            <div className="h-full w-full min-w-0">
              <div className="h-full w-full min-w-0">
                <Playlists
                  playlists={playlists}
                  playlistMeta={playlistMeta}
                  user={user}
                  userFavs={userFavs}
                  userExp={userExp}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && <PullRequest user={user} playlists={playlists} onUpdate={loadData} bruteOpen={prBruteOpen} id={prId} /> }
      </main>
    </div>
  );
}