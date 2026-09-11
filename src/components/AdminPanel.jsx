import { useState } from 'react';
import { ShieldAlert, Check, X, Plus, Trash2, PlayCircle, Loader2 } from 'lucide-react';
import { updateSongOfTheDay, savePlaylists, updatePRQueue } from '../api/sheets';

export default function AdminPanel({ songData, playlists, activePRs, onUpdate }) {
  const [tab, setTab] = useState('song'); 
  const [title, setTitle] = useState(songData?.title || '');
  const [youtubeId, setYoutubeId] = useState(songData?.youtubeId || '');
  const [loading, setLoading] = useState(false);
  const [localPlaylists, setLocalPlaylists] = useState(playlists);
  const [newGenre, setNewGenre] = useState('');
  const [previewAudio, setPreviewAudio] = useState(null);

  const handleDeploySong = async () => {
    setLoading(true);
    await updateSongOfTheDay(title, youtubeId, ""); 
    onUpdate(); 
    setLoading(false);
  };

  const handleResolvePR = async (pr, approved) => {
    const queue = activePRs.filter(p => p !== pr);
    if (approved) {
      const updated = { ...localPlaylists };
      if (!updated[pr.genre]) updated[pr.genre] = [];
      updated[pr.genre].push(`${pr.song} - ${pr.artist}`);
      setLocalPlaylists(updated);
      await savePlaylists(updated);
    }
    await updatePRQueue(queue);
    onUpdate();
  };

  const playPreview = async (song, artist) => {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song + ' ' + artist)}&entity=song&limit=1`);
    const data = await res.json();
    if (data.results[0]?.previewUrl) {
      if (previewAudio) previewAudio.pause();
      const audio = new Audio(data.results[0].previewUrl);
      audio.play();
      setPreviewAudio(audio);
    } else {
      alert("No preview found!");
    }
  };

  const addPlaylist = () => {
    if (!newGenre) return;
    setLocalPlaylists({ ...localPlaylists, [newGenre]: [] });
    setNewGenre('');
  };

  const deletePlaylist = async (genre) => {
    const updated = { ...localPlaylists };
    delete updated[genre];
    setLocalPlaylists(updated);
    await savePlaylists(updated);
    onUpdate();
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white rounded-3xl border border-gray-800 shadow-2xl p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold font-mono text-indigo-500 flex items-center gap-3">
            <ShieldAlert /> Admin Control
          </h1>
        </header>

        <div className="flex gap-2 mb-8 bg-gray-900 p-2 rounded-xl w-fit">
          <button onClick={() => setTab('song')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'song' ? 'bg-indigo-600' : 'text-gray-400'}`}>Song of the Day</button>
          <button onClick={() => setTab('playlists')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'playlists' ? 'bg-indigo-600' : 'text-gray-400'}`}>Manage Playlists</button>
          <button onClick={() => setTab('prs')} className={`px-6 py-2 rounded-lg font-bold flex gap-2 ${tab === 'prs' ? 'bg-indigo-600' : 'text-gray-400'}`}>
            Pull Requests {activePRs.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{activePRs.length}</span>}
          </button>
        </div>

        {tab === 'song' && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Song & Artist (e.g. Espresso - Sabrina Carpenter)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">YouTube Video ID (e.g. eVli-tstM5E)</label>
              <input type="text" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
            </div>
            <button 
              onClick={handleDeploySong} 
              disabled={loading} 
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Push to Production'
              )}
            </button>
          </div>
        )}

        {tab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input type="text" value={newGenre} onChange={e=>setNewGenre(e.target.value)} placeholder="New Genre Name" className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-indigo-500" />
              <button onClick={addPlaylist} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"><Plus/> Create</button>
            </div>
            {Object.entries(localPlaylists).map(([genre, tracks]) => (
              <div key={genre} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{genre} ({tracks.length} tracks)</h3>
                  <button onClick={() => deletePlaylist(genre)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'prs' && (
          <div className="space-y-4">
            {activePRs.length === 0 ? <p className="text-gray-500">No pending pull requests.</p> : activePRs.map((pr, i) => (
              <div key={i} className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg flex items-center gap-2">{pr.song} - {pr.artist} 
                    <button onClick={() => playPreview(pr.song, pr.artist)} className="text-indigo-400 hover:text-white transition-colors"><PlayCircle className="w-5 h-5" /></button>
                  </p>
                  <p className="text-sm text-gray-400">Target: {pr.genre} | Suggested by: {pr.user}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleResolvePR(pr, false)} className="bg-gray-800 hover:bg-red-900/50 text-red-500 p-3 rounded-lg transition-colors"><X/></button>
                  <button onClick={() => handleResolvePR(pr, true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"><Check/> Merge</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}