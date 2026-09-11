import { useState } from 'react';
import { GitPullRequest, Send, Lock } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

export default function PullRequest({ user }) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);

  const submitPR = async (e) => {
    e.preventDefault();
    if (!song || !artist || !genre) return alert("Fill out all fields!");
    setLoading(true);
    await submitPullRequest(user.name, song, artist, genre);
    alert(`PR submitted! Track it in the 'My PRs' tab.`);
    setSong(''); setArtist(''); setGenre('');
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
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <GitPullRequest className="text-green-500" /> Open a PR
      </h3>
      <form onSubmit={submitPR} className="flex flex-col gap-3">
        <input type="text" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Song Name" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
        <div className="flex gap-3">
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <button disabled={loading} type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-2 mt-2 transition-colors">
          <Send className="w-4 h-4" /> Commit Track
        </button>
      </form>
    </div>
  );
}