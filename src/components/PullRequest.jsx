import { useState } from 'react';
import { GitPullRequest, Loader2, CheckCircle2 } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

export default function PullRequest({ user }) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song || !artist || !genre) return alert("Please fill out all fields.");
    
    setStatus('loading');
    
    // We send an empty string "" for the playlist argument so the Admin can assign it later!
    await submitPullRequest(user.name, song, artist, "", genre);
    
    setStatus('success');
    setSong('');
    setArtist('');
    setGenre('');
    
    // Reset back to idle after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  };

  if (!user) {
    return (
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center shadow-lg">
        <GitPullRequest className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Sign in to submit a track request.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <GitPullRequest className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold">Open a PR</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Song Title</label>
          <input type="text" value={song} onChange={e=>setSong(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Artist</label>
          <input type="text" value={artist} onChange={e=>setArtist(e.target.value)} required className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Suggested Genre/Vibe</label>
          <input type="text" value={genre} onChange={e=>setGenre(e.target.value)} required placeholder="e.g. Dream Pop, Late Night Drive" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        <button 
          type="submit" 
          disabled={status !== 'idle' || !song || !artist || !genre} 
          className="w-full mt-2 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-80"
        >
          {status === 'loading' && <><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> Submitting...</>}
          {status === 'success' && <><CheckCircle2 className="w-5 h-5 text-green-400" /> Submitted!</>}
          {status === 'idle' && 'Submit PR'}
        </button>
      </form>
    </div>
  );
}