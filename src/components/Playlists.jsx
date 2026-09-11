import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

function TrackItem({ query }) {
  const [meta, setMeta] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => { if (data.results[0]) setMeta(data.results[0]); });
  }, [query]);

  const toggle = () => {
    if (!audio && meta?.previewUrl) {
      const a = new Audio(meta.previewUrl);
      a.onended = () => setPlaying(false);
      setAudio(a);
      a.play();
      setPlaying(true);
    } else if (audio) {
      playing ? audio.pause() : audio.play();
      setPlaying(!playing);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700 transition-colors group">
      <img src={meta?.artworkUrl100 || '/api/placeholder/40/40'} className="w-12 h-12 rounded-md object-cover shadow-md" alt="Album" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-200 truncate">{meta?.trackName || query.split('-')[0]}</p>
        <p className="text-xs text-gray-400 truncate">{meta?.artistName || query.split('-')[1] || 'Loading...'}</p>
      </div>
      {meta?.previewUrl && (
        <button onClick={toggle} className="p-2 text-indigo-400 hover:text-white bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-all">
          {playing ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4 ml-0.5"/>}
        </button>
      )}
    </div>
  );
}

export default function Playlists({ playlists }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Object.entries(playlists).map(([genre, tracks]) => (
        <div key={genre} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <h3 className="text-xl font-bold text-indigo-400">{genre}</h3>
            <span className="text-xs font-mono text-gray-500">{tracks.length} tracks</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {tracks.map((track, i) => <TrackItem key={i} query={track} />)}
          </div>
        </div>
      ))}
    </div>
  );
}