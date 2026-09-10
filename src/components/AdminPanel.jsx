import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { updateSongOfTheDay } from '../api/sheets';

export default function AdminPanel({ onUpdate }) {
  const [title, setTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    if (!title || !youtubeId) return;
    setLoading(true);
    await updateSongOfTheDay(title, youtubeId, coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400');
    setTitle('');
    setYoutubeId('');
    setCoverUrl('');
    onUpdate(); // Refresh the parent state
    setLoading(false);
  };

  return (
    <div className="mb-8 bg-indigo-900/30 border border-indigo-500/50 p-6 rounded-xl">
      <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400 mb-4">
        <ShieldAlert /> Admin Dashboard
      </h2>
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Song Title & Artist" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1" />
        <input type="text" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1" />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <input type="text" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="Square Image URL (Optional)" className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1" />
        <button onClick={handleDeploy} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2 rounded-lg font-bold w-full md:w-auto">
          {loading ? 'Pushing...' : 'Deploy'}
        </button>
      </div>
    </div>
  );
}