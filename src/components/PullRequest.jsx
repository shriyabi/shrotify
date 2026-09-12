import { useState } from 'react';
import { GitPullRequest, Loader2, CheckCircle2, Music } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

// NEW: Accept onUpdate prop
export default function PullRequest({ user, onUpdate }) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [playlist, setPlaylist] = useState('');
  const [status, setStatus] = useState('idle'); 

  if (!user) {
    return (
      <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 text-center shadow-lg backdrop-blur-sm">
        <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitPullRequest className="w-8 h-8 text-indigo-500/50" />
        </div>
        <h3 className="text-lg font-bold text-gray-300 mb-1">Join the Curation</h3>
        <p className="text-gray-500 text-sm">Sign in to submit a track request to the repository.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song || !artist || !genre) return alert("Please fill out required fields.");
    
    setStatus('loading');
    
    await submitPullRequest(user.name, user.email, song, artist, playlist, genre);
    
    // NEW: Re-fetch the dashboard data so the new PR and its ID instantly populate in "My PRs"!
    if (onUpdate) await onUpdate();
    
    setStatus('success');
    setSong('');
    setArtist('');
    setGenre('');
    setPlaylist('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
          <GitPullRequest className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-200">Open a PR</h2>
          <p className="text-xs text-gray-500 mt-0.5">Suggest a track for the repository</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Song Title *</label>
            <div className="relative">
              <Music className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={song} onChange={e=>setSong(e.target.value)} required placeholder="e.g. Pink + White" className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700" />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Artist *</label>
            <input type="text" value={artist} onChange={e=>setArtist(e.target.value)} required placeholder="e.g. Frank Ocean" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Suggested Genre *</label>
            <input type="text" value={genre} onChange={e=>setGenre(e.target.value)} required placeholder="e.g. R&B" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block flex justify-between">
              Target Playlist <span className="text-gray-600 font-normal normal-case">Optional</span>
            </label>
            <input type="text" value={playlist} onChange={e=>setPlaylist(e.target.value)} placeholder="e.g. Late Night Drive" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status !== 'idle' || !song || !artist || !genre} 
          className="w-full mt-2 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
        >
          {status === 'loading' && <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>}
          {status === 'success' && <><CheckCircle2 className="w-5 h-5 text-green-400" /> Submitted!</>}
          {status === 'idle' && 'Submit PR'}
        </button>
      </form>
    </div>
  );
}