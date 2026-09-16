import { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Plus, Trash2, PlayCircle, Loader2, BookOpen, ChevronDown, Pencil } from 'lucide-react';
import { updateSongOfTheDay, savePlaylists, updatePRQueue } from '../api/sheets';

export default function AdminPanel({ songData, playlists, playlistMeta, activePRs, onUpdate, defaultTab = 'song' }) {
  const [tab, setTab] = useState(defaultTab); 
  
  const [sotdSong, setSotdSong] = useState('');
  const [sotdArtist, setSotdArtist] = useState('');
  const [sotdLoading, setSotdLoading] = useState(false);
  
  const [localPlaylists, setLocalPlaylists] = useState(playlists || {});
  const [localMeta, setLocalMeta] = useState(playlistMeta || {});
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImage, setNewPlaylistImage] = useState('');
  const [newTrackInputs, setNewTrackInputs] = useState({});
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');

  const [localPRs, setLocalPRs] = useState(activePRs || []);
  const [prLoading, setPrLoading] = useState({}); 
  const [previewAudio, setPreviewAudio] = useState(null);
  
  // State to track which playlist the admin selects for each PR (overrides user suggestion)
  const [prPlaylists, setPrPlaylists] = useState({});

  useEffect(() => {
    if (songData) {
      setSotdSong(songData.song || '');
      setSotdArtist(songData.artist || '');
    }
  }, [songData]);

  useEffect(() => { if (playlists) setLocalPlaylists(playlists); }, [playlists]);
  useEffect(() => { if (playlistMeta) setLocalMeta(playlistMeta); }, [playlistMeta]);
  useEffect(() => { if (activePRs) setLocalPRs(activePRs); }, [activePRs]);

  const handleDeploySong = async () => {
    if (!sotdSong || !sotdArtist) return alert("Please fill out Song and Artist");
    setSotdLoading(true);
    await updateSongOfTheDay(sotdSong, sotdArtist); 
    onUpdate(); 
    setSotdLoading(false);
    setSotdSong('');
    setSotdArtist('');
  };

  const addPlaylist = async () => {
    if (!newPlaylistName) return;
    const updatedPlaylists = { ...localPlaylists, [newPlaylistName]: [] };
    const metaData = { url: newPlaylistImage, pinned: false };
    const updatedMeta = { ...localMeta, [newPlaylistName]: metaData };
    
    setLocalPlaylists(updatedPlaylists);
    setLocalMeta(updatedMeta);
    setNewPlaylistName('');
    setNewPlaylistImage('');
    setExpandedPlaylist(newPlaylistName);
    await savePlaylists(updatedPlaylists, updatedMeta);
    onUpdate();
  };

  const renamePlaylist = async (oldName) => {
    if (!editPlaylistName || editPlaylistName === oldName) { setEditingPlaylist(null); return; }
    const updatedPlaylists = { ...localPlaylists };
    const updatedMeta = { ...localMeta };
    
    updatedPlaylists[editPlaylistName] = updatedPlaylists[oldName];
    updatedMeta[editPlaylistName] = updatedMeta[oldName];
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
    if (!track?.song || !track?.artist) return alert("Fill out Song and Artist");
    
    const updatedPlaylists = { ...localPlaylists };
    updatedPlaylists[playlistName] = [...(updatedPlaylists[playlistName] || []), { song: track.song, artist: track.artist, genre: track.genre || '' }];
    
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

  const handleResolvePR = async (index, approved) => {
    const pr = localPRs[index];
    
    // Determine the target playlist: either Admin override, or User's suggestion
    const targetPlaylist = prPlaylists[index] !== undefined 
      ? prPlaylists[index] 
      : (Object.keys(localPlaylists).includes(pr.playlist) ? pr.playlist : null);

    if (approved && !targetPlaylist) {
      return alert("Please select a destination playlist before merging!");
    }

    setPrLoading(prev => ({ ...prev, [index]: true }));
    const newQueue = localPRs.filter((_, i) => i !== index);
    
    if (approved) {
      const updatedPlaylists = { ...localPlaylists };
      if (!updatedPlaylists[targetPlaylist]) updatedPlaylists[targetPlaylist] = [];
      
      updatedPlaylists[targetPlaylist].push({ song: pr.song, artist: pr.artist, genre: pr.genre });
      setLocalPlaylists(updatedPlaylists);
      await savePlaylists(updatedPlaylists, localMeta);
    }
    
    await updatePRQueue(newQueue);
    setLocalPRs(newQueue);
    
    const newPrPlaylists = { ...prPlaylists };
    delete newPrPlaylists[index];
    setPrPlaylists(newPrPlaylists);
    
    setPrLoading(prev => ({ ...prev, [index]: false }));
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

  return (
    <div className="bg-gray-950 text-white rounded-3xl border border-gray-800 shadow-2xl p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold font-mono text-indigo-500 flex items-center gap-3">
            <ShieldAlert /> Admin Dashboard
          </h1>
        </header>

        <div className="flex items-center justify-center flex-wrap gap-2 mb-8 bg-gray-900 p-2 rounded-xl w-fit">
          <button onClick={() => setTab('song')} className={`px-6 py-2 rounded-lg w-full md:w-auto font-bold transition-all ${tab === 'song' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>Song of the Day</button>
          <button onClick={() => setTab('playlists')} className={`px-6 py-2 rounded-lg w-full md:w-auto font-bold transition-all ${tab === 'playlists' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>Manage Playlists</button>
          <button onClick={() => setTab('prs')} className={`px-6 py-2 rounded-lg text-center items-center justify-center font-bold w-full md:w-auto flex  gap-2 transition-all ${tab === 'prs' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white'}`}>
            Pull Requests {localPRs.length > 0 && <span className="bg-red-500 text-center text-white text-xs px-2 py-0.5 rounded-full">{localPRs.length}</span>}
          </button>
        </div>

        {tab === 'song' && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Song Name</label>
                <input type="text" value={sotdSong} onChange={e => setSotdSong(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Artist</label>
                <input type="text" value={sotdArtist} onChange={e => setSotdArtist(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <button 
              onClick={handleDeploySong} 
              disabled={sotdLoading || !sotdSong || !sotdArtist} 
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {sotdLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</> : 'Push to Production'}
            </button>
          </div>
        )}

        {tab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Playlist Name</label>
                <input type="text" value={newPlaylistName} onChange={e=>setNewPlaylistName(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-1">Picture URL (Optional)</label>
                <input type="text" value={newPlaylistImage} onChange={e=>setNewPlaylistImage(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-end">
                <button onClick={addPlaylist} disabled={!newPlaylistName} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 h-[42px] px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"><Plus className="w-5 h-5"/> Create</button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 mt-6">
              {Object.entries(localPlaylists).map(([playlistName, tracks]) => {
                const isExpanded = expandedPlaylist === playlistName;
                const isEditing = editingPlaylist === playlistName;

                return (
                  <div key={playlistName} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all group">
                    <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => !isEditing && setExpandedPlaylist(isExpanded ? null : playlistName)}>
                      
                      <div className="flex items-center gap-3">
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isEditing ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input type="text" value={editPlaylistName} onChange={e => setEditPlaylistName(e.target.value)} className="bg-gray-950 border border-indigo-500 rounded px-2 py-1 text-indigo-400 font-bold focus:outline-none" autoFocus />
                            <button onClick={() => renamePlaylist(playlistName)} className="text-green-500 hover:bg-green-500/20 p-1 rounded transition-colors"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingPlaylist(null)} className="text-gray-500 hover:bg-gray-800 p-1 rounded transition-colors"><X className="w-4 h-4"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-indigo-400">{playlistName} <span className="text-gray-500 text-sm ml-2">({tracks.length} tracks)</span></h3>
                            <button onClick={(e) => { e.stopPropagation(); setEditingPlaylist(playlistName); setEditPlaylistName(playlistName); }} className="text-gray-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1" title="Rename Playlist"><Pencil className="w-4 h-4"/></button>
                          </div>
                        )}
                      </div>

                      <button onClick={(e) => { e.stopPropagation(); deletePlaylist(playlistName); }} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Delete entire playlist"><Trash2 className="w-5 h-5"/></button>
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
                        
                        <div className="flex flex-col sm:flex-row gap-2 items-end">
                          <div className="flex-1 w-full">
                            <label className="text-xs text-gray-400 mb-1 block">Song Title</label>
                            <input type="text" value={newTrackInputs[playlistName]?.song || ''} onChange={(e) => updateTrackInput(playlistName, 'song', e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                          </div>
                          <div className="flex-1 w-full">
                            <label className="text-xs text-gray-400 mb-1 block">Artist</label>
                            <input type="text" value={newTrackInputs[playlistName]?.artist || ''} onChange={(e) => updateTrackInput(playlistName, 'artist', e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                          </div>
                          <div className="flex-1 w-full">
                            <label className="text-xs text-gray-400 mb-1 block">Genre (Optional)</label>
                            <input type="text" value={newTrackInputs[playlistName]?.genre || ''} onChange={(e) => updateTrackInput(playlistName, 'genre', e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                          </div>
                          <button onClick={() => addTrackToPlaylist(playlistName)} disabled={!newTrackInputs[playlistName]?.song || !newTrackInputs[playlistName]?.artist} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 h-[38px] rounded-lg text-sm font-bold transition-colors">Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRs TAB - UPDATED TO SHOW EMAIL, DATE, ID, AND SUGGESTED PLAYLIST */}
        {tab === 'prs' && (
          <div className="space-y-4">
            {localPRs.length === 0 ? <p className="text-gray-500">No pending pull requests.</p> : localPRs.map((pr, i) => {
              
              // Smart defaulting: If admin hasn't selected an override, check if the user's suggestion is a valid playlist
              const defaultSelected = prPlaylists[i] !== undefined 
                ? prPlaylists[i] 
                : (Object.keys(localPlaylists).includes(pr.playlist) ? pr.playlist : '');

              return (
                <div key={i} className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
                  {prLoading[i] && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                  )}

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative z-0 min-w-0 flex-1">
                      <p className="mb-1 flex flex-wrap items-center gap-2 text-base font-bold text-white sm:text-lg">
                        <span className="break-words">{pr.song} - {pr.artist}</span>
                        <button onClick={() => playPreview(pr.song, pr.artist)} className="text-indigo-400 transition-colors hover:text-white">
                          <PlayCircle className="h-5 w-5" />
                        </button>
                      </p>

                      <p className="mb-1 text-sm text-gray-400">
                        Suggested Genre: <span className="font-bold text-gray-300">{pr.genre}</span> |
                        Suggested Playlist: <span className="font-bold text-gray-300">{pr.playlist || 'None'}</span>
                      </p>

                      <p className="mb-4 text-xs text-gray-500">
                        By: <span className="text-gray-400">{pr.user} ({pr.email || 'No email'})</span> on {pr.date ? new Date(pr.date).toLocaleDateString() : 'Unknown'}
                      </p>

                      <div className="flex w-full flex-col gap-2 rounded-lg border border-gray-800 bg-gray-950 p-2.5 sm:flex-row sm:items-center sm:gap-3 md:w-fit">
                        <label className="pl-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Assign to:</label>
                        <select
                          value={defaultSelected}
                          onChange={(e) => setPrPlaylists({ ...prPlaylists, [i]: e.target.value })}
                          className="w-full rounded-md border border-gray-800 bg-black px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
                        >
                          <option value="" disabled>Select Playlist...</option>
                          {Object.keys(localPlaylists).map(pName => (
                            <option key={pName} value={pName}>{pName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative z-0 flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleResolvePR(i, false)} disabled={prLoading[i]} className="rounded-lg bg-gray-800 p-3 text-red-500 transition-colors hover:bg-red-900/50 disabled:opacity-50"><X /></button>
                        <button onClick={() => handleResolvePR(i, true)} disabled={prLoading[i] || !defaultSelected} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"><Check /> Merge</button>
                      </div>
                      {pr.id && <span className="text-right text-[10px] font-mono text-gray-700 md:pr-1">ID: {pr.id.split('-')[0]}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}