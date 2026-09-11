import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function Turntable({ songData }) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioTarget, setAudioTarget] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!songData?.song || !songData?.artist) return;
    
    // NEW: Safely builds query using the flat database object format
    const query = `${songData.song} ${songData.artist}`;
    
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => { if (data.results[0]) setMeta(data.results[0]); })
      .catch(err => console.error("iTunes fetch error:", err));
  }, [songData]);

  if (!songData?.song) {
    return <div className="text-gray-500 font-mono animate-pulse text-center p-12 bg-gray-900 rounded-3xl border border-gray-800">Loading Record...</div>;
  }

  const togglePreview = () => {
    if (!audioTarget && meta?.previewUrl) {
      const audio = new Audio(meta.previewUrl);
      audio.onended = () => setIsPlayingPreview(false);
      setAudioTarget(audio);
      audio.play();
      setIsPlayingPreview(true);
    } else if (audioTarget) {
      isPlayingPreview ? audioTarget.pause() : audioTarget.play();
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  return (
    <section className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 flex flex-col items-center shadow-2xl">
      <h2 className="text-xl font-bold mb-8 text-gray-400 tracking-widest uppercase text-xs">Now Spinning</h2>

      <div className={`relative flex items-center justify-center w-72 h-72 mb-8 rounded-full bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-gray-800 ${isPlayingPreview ? 'animate-spin-slow' : ''}`}>
        <div className="absolute inset-2 rounded-full border border-gray-800/30"></div>
        <div className="absolute inset-6 rounded-full border border-gray-800/30"></div>
        <div className="absolute inset-10 rounded-full border border-gray-800/30"></div>
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-900 z-10 flex items-center justify-center bg-gray-800">
           <img src={meta?.artworkUrl100?.replace('100x100', '400x400') || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400'} className="w-full h-full object-cover" alt="Album" />
           <div className="absolute w-3 h-3 bg-black rounded-full z-20"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-1">{songData.song}</h3>
        <p className="text-indigo-400 font-mono text-sm">{songData.artist}</p>
      </div>

      <button onClick={togglePreview} disabled={!meta?.previewUrl} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
        {isPlayingPreview ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>} 30s Sample
      </button>
    </section>
  );
}