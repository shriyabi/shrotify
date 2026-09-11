import { useState } from 'react';
import { GitPullRequest, Send, Lock, Info, Loader2 } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

export default function PullRequest({ user }) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [playlist, setPlaylist] = useState(''); 
  const [genre, setGenre] = useState('');       
  const [loading, setLoading] = useState(false);

  const submitPR = async (e) => {
    e.preventDefault();
    if (!song || !artist || !playlist || !genre) return alert("Fill out all fields!");
    setLoading(true);
    await submitPullRequest(user.name, song, artist, playlist, genre);
    alert(`PR submitted! Track it in the 'My PRs' tab.`);
    setSong(''); setArtist(''); setPlaylist(''); setGenre('');
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="mt-8 bg-gray-900/50 p-6 rounded-3xl border border-gray-800 text-center shadow-xl">
        <Lock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-400 mb-2">Want to suggest a track?</h3>
        <p className="text-sm text-gray-500">Sign in with Google using the button at the top to open a Pull Request.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <GitPullRequest className="text-green-500" /> Open a PR
        </h3>
        <div className="relative group cursor-help">
          <Info className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-gray-800 text-xs text-gray-300 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
            <strong>Artist:</strong> Usually the artist's name or YouTube channel.<br/><br/>
            <strong>Playlist:</strong> Make sure this exactly matches an existing playlist on the right!<br/><br/>
            <strong>Genre:</strong> The musical style of the track (e.g. Synth-pop, Alt-Rock).
          </div>
        </div>
      </div>

      <form onSubmit={submitPR} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input type="text" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Song Name" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-3">
          <input type="text" value={playlist} onChange={(e) => setPlaylist(e.target.value)} placeholder="Target Playlist" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Song Genre" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
        </div>
        
        {/* UPDATED SUBMIT BUTTON WITH LOADER */}
        <button disabled={loading} type="submit" className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-2 mt-2 transition-colors">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Committing Track...</>
          ) : (
            <><Send className="w-4 h-4" /> Commit Track</>
          )}
        </button>
      </form>
    </div>
  );
}