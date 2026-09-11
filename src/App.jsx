import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Turntable from './components/Turntable';
import Playlists from './components/Playlists';
import PullRequest from './components/PullRequest';
import AdminPanel from './components/AdminPanel';
import UserPRs from './components/UserPullRequests';
import { fetchDashboardData } from './api/sheets';
import { Disc3 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [songData, setSongData] = useState(null);
  const [playlists, setPlaylists] = useState({});
  const [activePRs, setActivePRs] = useState([]);
  const [view, setView] = useState('dashboard');

  const loadData = async () => {
    const data = await fetchDashboardData();
    if (data) {
      setSongData(data.songOfTheDay);
      setPlaylists(data.playlists);
      setActivePRs(data.activePRs || []);
    }
  };

  useEffect(() => { loadData(); }, []);

  const isAdmin = user?.email === 'shriyarbiddala@gmail.com';

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30">
      
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
              <div className="flex items-center gap-3 bg-gray-900 pr-4 rounded-full border border-gray-800">
                <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-sm font-bold hidden sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 mt-4">
        {view === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto">
            <AdminPanel songData={songData} playlists={playlists} activePRs={activePRs} onUpdate={loadData} />
          </div>
        )}

        {view === 'my-prs' && user && (
          <UserPRs activePRs={activePRs} user={user} />
        )}

        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[400px_1fr] gap-12">
            <div className="space-y-8">
              <Turntable songData={songData} />
              <PullRequest user={user} playlists={playlists} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-800 pb-4">Repositories (Playlists)</h2>
              <Playlists playlists={playlists} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}