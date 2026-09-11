import { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Plus, Trash2, PlayCircle, Loader2, BookOpen, ChevronDown, Pencil } from 'lucide-react';
import { updateSongOfTheDay, savePlaylists, updatePRQueue } from '../api/sheets';

export default function AdminPanel({ songData, playlists, playlistMeta, activePRs, onUpdate }) {
  const [tab, setTab] = useState('song'); 
  const [songTitle, setSongTitle] = useState(songData?.song || '');
  const [songArtist, setSongArtist] = useState(songData?.artist || '');
  const [loading, setLoading] = useState(false);
  
  const [localPlaylists, setLocalPlaylists] = useState(playlists);
  const [localMeta, setLocalMeta] = useState(playlistMeta || {});
  const [localPRs, setLocalPRs] = useState(activePRs);
  
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImage, setNewPlaylistImage] = useState('');
  const [newTrackInputs, setNewTrackInputs] = useState({});
  const [previewAudio, setPreviewAudio] = useState(null);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);

  // --- NEW: Rename Playlist State ---
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');

  const [testUrl, setTestUrl] = useState(localStorage.getItem('shrotify_test_db') || '');
  const [dbStatus, setDbStatus] = useState('idle');

  useEffect(() => { setLocalPRs(activePRs); }, [activePRs]);

  const handleDeploySong = async () => {
    setLoading(true);
    await updateSongOfTheDay(songTitle, songArtist); 
    onUpdate(); 
    setLoading(false);
  };

  const handleResolvePR = async (index, approved) => {
    const pr = localPRs[index];
    const newQueue = localPRs.filter((_, i) => i !== index);
    setLocalPRs(newQueue);

    if (approved) {
      const updatedPlaylists = { ...localPlaylists };
      if (!updatedPlaylists[pr.playlist]) updatedPlaylists[pr.playlist] = [];
      updatedPlaylists[pr.playlist].push({ song: pr.song, artist: pr.artist, genre: pr.genre });
      setLocalPlaylists(updatedPlaylists);
      await savePlaylists(updatedPlaylists, localMeta);
    }
    await updatePRQueue(newQueue);
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

  const addPlaylist = async () => {
    if (!newPlaylistName) return;
    const updatedPlaylists = { ...localPlaylists, [newPlaylistName]: [] };
    const updatedMeta = { ...localMeta, [newPlaylistName]: newPlaylistImage };
    
    setLocalPlaylists(updatedPlaylists);
    setLocalMeta(updatedMeta);
    setNewPlaylistName('');
    setNewPlaylistImage('');
    setExpandedPlaylist(newPlaylistName);
    
    await savePlaylists(updatedPlaylists, updatedMeta);
    onUpdate();
  };

  // --- NEW: Rename Playlist Logic ---
  const renamePlaylist = async (oldName) => {
    if (!editPlaylistName || editPlaylistName === oldName) {
      setEditingPlaylist(null);
      return;
    }
    
    const updatedPlaylists = { ...localPlaylists };
    const updatedMeta = { ...localMeta };
    
    // Copy data to new key
    updatedPlaylists[editPlaylistName] = updatedPlaylists[oldName];
    updatedMeta[editPlaylistName] = updatedMeta[oldName];
    
    // Delete old key
    delete updatedPlaylists[oldName];
    delete updatedMeta[oldName];
    
    setLocalPlaylists(updatedPlaylists);
    setLocalMeta(updatedMeta);
    setEditingPlaylist(null);
    if (expandedPlaylist === oldName) setExpandedPlaylist(editPlaylistName);
    
    await savePlaylists(updatedPlaylists, updatedMeta);
    onUpdate();
  };

  const deletePlaylist = async (playlistName) => {
    const updatedPlaylists = { ...localPlaylists };
    const updatedMeta = { ...localMeta };
    delete updatedPlaylists[playlistName];
    delete updatedMeta[playlistName];
    
    setLocalPlaylists(updatedPlaylists);
    setLocalMeta(updatedMeta);
    if (expandedPlaylist === playlistName) setExpandedPlaylist(null);
    await savePlaylists(updatedPlaylists, updatedMeta);
    onUpdate();
  };

  const addTrackToPlaylist = async (playlistName) => {
    const track = newTrackInputs[playlistName];
    if (!track?.song || !track?.artist || !track?.genre) return alert("Fill out Song, Artist, and Genre");
    
    const updatedPlaylists = { ...localPlaylists };
    updatedPlaylists[playlistName] = [...updatedPlaylists[playlistName], track];
    
    setLocalPlaylists(updatedPlaylists);
    setNewTrackInputs({ ...newTrackInputs, [playlistName]: { song: '', artist: '', genre: '' } });
    
    await savePlaylists(updatedPlaylists, localMeta);
    onUpdate();
  };

  const deleteTrackFromPlaylist = async (playlistName, trackIndex) => {
    const updatedPlaylists = { ...localPlaylists };
    updatedPlaylists[playlistName] = updatedPlaylists[playlistName].filter((_, idx) => idx !== trackIndex);
    
    setLocalPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists, localMeta);
    onUpdate();
  };

  const updateTrackInput = (playlistName, field, value) => {
    const current = newTrackInputs[playlistName] || { song: '', artist: '', genre: '' };
    setNewTrackInputs({ ...newTrackInputs, [playlistName]: { ...current, [field]: value } });
  };

  const testDatabaseConnection = async () => {
    if (!testUrl.includes('script.google.com')) return alert("Must be a valid Google Apps Script Web App URL");
    setDbStatus('testing');
    try {
      const res = await fetch(testUrl, { method: 'GET', redirect: 'follow' });
      const data = await res.json();
      if (data.songOfTheDay) {
        setDbStatus('success');
        localStorage.setItem('shrotify_test_db', testUrl);
        onUpdate();
      } else { setDbStatus('error'); }
    } catch (e) { setDbStatus('error'); }
  };

  const clearTestDb = () => {
    localStorage.removeItem('shrotify_test_db');
    setTestUrl('');
    setDbStatus('idle');
    window.location.reload();
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white rounded-3xl border border-gray-800 shadow-2xl p-4 md:p-8 mb-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold font-mono text-indigo-500 flex items-center gap-3">
            <ShieldAlert /> Admin Control
          </h1>
        </header>

        <div className="flex flex-wrap gap-2 mb-8 bg-gray-900 p-2 rounded-xl w-fit">
          <button onClick={() => setTab('song')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'song' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>Song of the Day</button>
          <button onClick={() => setTab('playlists')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'playlists' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>Manage Playlists</button>
          <button onClick={() => setTab('prs')} className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${tab === 'prs' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>
            Pull Requests {localPRs.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{localPRs.length}</span>}
          </button>
          <button onClick={() => setTab('guide')} className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${tab === 'guide' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>
            <BookOpen className="w-4 h-4" /> Getting Started
          </button>
        </div>

        {tab === 'song' && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Song Name</label>
                <input type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Artist</label>
                <input type="text" value={songArtist} onChange={e => setSongArtist(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <button onClick={handleDeploySong} disabled={loading || !songTitle} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</> : 'Push to Production'}
            </button>
          </div>
        )}

        {tab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-2">
              <input type="text" value={newPlaylistName} onChange={e=>setNewPlaylistName(e.target.value)} placeholder="New Playlist Name" className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-indigo-500" />
              <input type="text" value={newPlaylistImage} onChange={e=>setNewPlaylistImage(e.target.value)} placeholder="Cover Image URL" className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-indigo-500" />
              <button onClick={addPlaylist} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"><Plus className="w-5 h-5"/> Create</button>
            </div>
            
            <div className="flex flex-col gap-4 mt-6">
              {Object.entries(localPlaylists).map(([playlistName, tracks]) => {
                const isExpanded = expandedPlaylist === playlistName;
                const isEditing = editingPlaylist === playlistName;

                return (
                  <div key={playlistName} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all group">
                    <div 
                      className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-800/50 transition-colors" 
                      onClick={() => !isEditing && setExpandedPlaylist(isExpanded ? null : playlistName)}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        
                        {/* --- NEW: Inline Playlist Renaming UI --- */}
                        {isEditing ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={editPlaylistName} 
                              onChange={e => setEditPlaylistName(e.target.value)}
                              className="bg-gray-950 border border-indigo-500 rounded px-2 py-1 text-indigo-400 font-bold focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => renamePlaylist(playlistName)} className="text-green-500 hover:bg-green-500/20 p-1 rounded transition-colors"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingPlaylist(null)} className="text-gray-500 hover:bg-gray-800 p-1 rounded transition-colors"><X className="w-4 h-4"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-indigo-400">{playlistName} <span className="text-gray-500 text-sm ml-2">({tracks.length} tracks)</span></h3>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingPlaylist(playlistName); setEditPlaylistName(playlistName); }} 
                              className="text-gray-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1"
                              title="Rename Playlist"
                            >
                              <Pencil className="w-4 h-4"/>
                            </button>
                          </div>
                        )}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deletePlaylist(playlistName); }} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Delete entire playlist">
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </div>

                    {isExpanded && !isEditing && (
                      <div className="p-5 pt-0 border-t border-gray-800/50 bg-gray-900/50">
                        <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 mt-4 mb-4">
                          {tracks.length === 0 && <p className="text-gray-500 text-sm italic">No tracks yet.</p>}
                          {tracks.map((track, i) => (
                            <li key={i} className="flex justify-between items-center bg-gray-950 px-3 py-2 rounded-lg text-sm group/track border border-transparent hover:border-gray-800">
                              <span className="truncate text-gray-300 pr-2">
                                {track.song} <span className="text-gray-500">- {track.artist}</span>
                                {track.genre && <span className="ml-2 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs">{track.genre}</span>}
                              </span>
                              <button onClick={() => deleteTrackFromPlaylist(playlistName, i)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover/track:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></button>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="text" placeholder="Song Name" value={newTrackInputs[playlistName]?.song || ''} onChange={(e) => updateTrackInput(playlistName, 'song', e.target.value)} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:border-indigo-500" />
                          <input type="text" placeholder="Artist" value={newTrackInputs[playlistName]?.artist || ''} onChange={(e) => updateTrackInput(playlistName, 'artist', e.target.value)} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:border-indigo-500" />
                          <input type="text" placeholder="Genre" value={newTrackInputs[playlistName]?.genre || ''} onChange={(e) => updateTrackInput(playlistName, 'genre', e.target.value)} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:border-indigo-500" />
                          <button onClick={() => addTrackToPlaylist(playlistName)} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRs AND GETTING STARTED TABS */}
        {tab === 'prs' && (
          <div className="space-y-4">
            {localPRs.length === 0 ? <p className="text-gray-500">No pending pull requests.</p> : localPRs.map((pr, i) => (
              <div key={i} className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg flex items-center gap-2">{pr.song} - {pr.artist} 
                    <button onClick={() => playPreview(pr.song, pr.artist)} className="text-indigo-400 hover:text-white transition-colors"><PlayCircle className="w-5 h-5" /></button>
                  </p>
                  <p className="text-sm text-gray-400">Target: {pr.playlist} | Style: {pr.genre} | Suggested by: {pr.user}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleResolvePR(i, false)} className="bg-gray-800 hover:bg-red-900/50 text-red-500 p-3 rounded-lg transition-colors"><X/></button>
                  <button onClick={() => handleResolvePR(i, true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"><Check/> Merge</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Getting Started Guide
              </h2>
              <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-4 mb-8">
                <p>Welcome! To set up a fresh database for this dashboard, follow these steps:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-400">
                  <li>
                    Make a copy of the <a href="YOUR_TEMPLATE_LINK_HERE" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-bold">Master Google Sheet Template</a>.
                  </li>
                  <li>In your new sheet, click on <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Paste the backend script provided in the documentation into the editor.</li>
                  <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                  <li>Set <strong>Execute as: Me</strong> and crucially, set <strong>Who has access: Anyone</strong>.</li>
                  <li>Copy the resulting <em>Web App URL</em> and paste it below to test the connection.</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3 p-5 bg-gray-950 rounded-xl border border-gray-800">
                <label className="text-sm text-gray-400 font-bold">Test Your Apps Script Web App URL:</label>
                <div className="flex gap-2">
                  <input type="text" value={testUrl} onChange={e => setTestUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:border-indigo-500 font-mono text-sm" />
                  <button onClick={testDatabaseConnection} disabled={dbStatus === 'testing' || !testUrl} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                    {dbStatus === 'testing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Test Connection'}
                  </button>
                </div>
              </div>

              {dbStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Connection Failed:</strong> Could not read the database. Ensure you selected "Who has access: Anyone" (NOT "Anyone with a Google Account") when deploying.
                  </div>
                </div>
              )}

              {dbStatus === 'success' && (
                <div className="mt-6 p-5 bg-green-900/20 border border-green-500/50 rounded-xl">
                  <h3 className="text-green-400 font-bold flex items-center gap-2 mb-2"><Check className="w-5 h-5" /> Connection Successful!</h3>
                  <p className="text-sm text-gray-300 mb-4">Your browser is now using this database temporarily. To make this the official database for all public visitors, update your environment variables:</p>
                  <div className="bg-black p-4 rounded-lg font-mono text-xs text-gray-400 border border-gray-800 relative select-all overflow-x-auto">
                    VITE_GAS_URL={testUrl}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Paste this into your `.env` file, commit your changes, and run `npm run deploy` to push to GitHub Pages.</p>
                  <button onClick={clearTestDb} className="mt-6 text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-2">
                    <X className="w-4 h-4" /> Clear local test and revert to public database
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}