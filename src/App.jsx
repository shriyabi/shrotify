import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Turntable from './components/Turntable';
import PlaylistGrid from './components/PlaylistGrid';
import PullRequest from './components/PullRequest';
import AdminPanel from './components/AdminPanel';
import { fetchDashboardData } from './api/sheets';

export default function App() {
  const [user, setUser] = useState(null);
  const [songData, setSongData] = useState(null);
  const [playlists, setPlaylists] = useState({});

  const loadData = async () => {
    const data = await fetchDashboardData();
    setSongData(data.songOfTheDay);
    setPlaylists(data.playlists);
  };

  useEffect(() => { loadData(); }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-8">Music Dashboard</h1>
        <GoogleLogin 
          onSuccess={res => setUser(jwtDecode(res.credential))}
          onError={() => console.log('Login Failed')}
        />
      </div>
    );
  }

  const isAdmin = user.email === 'shriyarbiddala@gmail.com';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold font-mono text-indigo-400">~/shrotify</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{user.email}</span>
            <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer"  />
          </div>
        </header>

        {isAdmin && <AdminPanel onUpdate={loadData} />}

        <div className="grid md:grid-cols-[400px_1fr] gap-8">
          <Turntable songData={songData} />
          <div>
            <h2 className="text-2xl font-bold mb-6">Repositories (Playlists)</h2>
            <PlaylistGrid playlists={playlists} />
            <PullRequest user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}