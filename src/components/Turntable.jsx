import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Headphones } from 'lucide-react';

export default function Turntable({ songData }) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [playerTarget, setPlayerTarget] = useState(null);
  const [audioTarget, setAudioTarget] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!songData?.song) return;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(songData.song + " " + songData.artist)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => { if (data.results[0]) setMeta(data.results[0]); });
  }, [songData]);

  if (!songData) return <div className="text-white">Loading record...</div>;

  const togglePreview = () => {
    if (isPlayingFull) { playerTarget?.pauseVideo(); setIsPlayingFull(false); }
    if (!audioTarget) {
      const audio = new Audio(meta?.previewUrl);
      audio.onended = () => setIsPlayingPreview(false);
      setAudioTarget(audio);
      audio.play();
      setIsPlayingPreview(true);
    } else {
      isPlayingPreview ? audioTarget.pause() : audioTarget.play();
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  const toggleFullSong = () => {
    if (!songData.youtubeId) return; // Safeguard if no YouTube ID exists
    if (isPlayingPreview) { audioTarget?.pause(); setIsPlayingPreview(false); }
    if (!playerTarget) return;
    isPlayingFull ? playerTarget.pauseVideo() : playerTarget.playVideo();
    setIsPlayingFull(!isPlayingFull);
  };

  const opts = { height: '10', width: '10', host: 'https://www.youtube.com', playerVars: { autoplay: 0, controls: 0, enablejsapi: 1, origin: window.location.origin } };
  const spinning = isPlayingPreview || isPlayingFull;

  return (
    <section className="bg-gray-900 p-8 rounded-3xl border border-gray-800 flex flex-col items-center shadow-2xl">
      <h2 className="text-xl font-bold mb-8 text-gray-400 tracking-widest uppercase text-xs">Now Spinning</h2>
      
      {songData.youtubeId && (
        <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden -z-10">
          <YouTube videoId={songData.youtubeId} opts={opts} onReady={(e) => setPlayerTarget(e.target)} onEnd={() => setIsPlayingFull(false)} />
        </div>
      )}

      <div className={`relative flex items-center justify-center w-72 h-72 mb-8 rounded-full bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-gray-800 ${spinning ? 'animate-spin-slow' : ''}`}>
        <div className="absolute inset-2 rounded-full border border-gray-800/30"></div>
        <div className="absolute inset-6 rounded-full border border-gray-800/30"></div>
        <div className="absolute inset-10 rounded-full border border-gray-800/30"></div>
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-900 z-10 flex items-center justify-center bg-gray-800">
           <img src={meta?.artworkUrl100?.replace('100x100', '400x400') || songData.coverUrl || '/api/placeholder/400/400'} className="w-full h-full object-cover" alt="Album" />
           <div className="absolute w-3 h-3 bg-black rounded-full z-20"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-1">{songData.song}</h3>
        <p className="text-indigo-400 font-mono text-sm">{songData.artist || 'Unknown Artist'}</p>
      </div>

      <div className="flex gap-4 w-full">
        <button onClick={togglePreview} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all border border-gray-700">
          {isPlayingPreview ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>} 30s Sample
        </button>
        {songData.youtubeId && (
          <button onClick={toggleFullSong} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            {isPlayingFull ? <Pause className="w-5 h-5"/> : <Headphones className="w-5 h-5"/>} Full Track
          </button>
        )}
      </div>
    </section>
  );
}