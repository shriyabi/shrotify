import { useState } from 'react';
import { GitPullRequest, Send } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

export default function PullRequest({ user }) {
  const [song, setSong] = useState('');
  const [loading, setLoading] = useState(false);

  const submitPR = async (e) => {
    e.preventDefault();
    setLoading(true);
    await submitPullRequest(user.name, song);
    alert(`PR submitted! Added to the review queue.`);
    setSong('');
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <GitPullRequest className="text-green-500" /> Open a PR (Suggest Music)
      </h3>
      <form onSubmit={submitPR} className="flex gap-2">
        <input 
          type="text" 
          value={song}
          onChange={(e) => setSong(e.target.value)}
          placeholder="e.g., 'Diet Mountain Dew'" 
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
        />
        <button disabled={loading} type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Send className="w-4 h-4" /> Commit
        </button>
      </form>
    </div>
  );
}