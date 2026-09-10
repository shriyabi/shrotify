import { useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause } from 'lucide-react';

export default function Turntable({ songData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerTarget, setPlayerTarget] = useState(null);

  if (!songData) return <div className="text-white">Loading record...</div>;

  const togglePlay = () => {
    if (!playerTarget) return;
    if (isPlaying) {
      playerTarget.pauseVideo();
      setIsPlaying(false);
    } else {
      playerTarget.playVideo();
      setIsPlaying(true);
    }
  };

  // YouTube Options
  const opts = {
   height: '10',
    width: '10',
    playerVars: { 
      autoplay: 0, 
      controls: 0,
      origin: window.location.origin, // Explicitly tells YouTube to trust your local/live URL
      enablejsapi: 1 // Forces the API to accept commands
    },
  };

  return (
    <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col items-center shadow-xl">
      <h2 className="text-2xl font-bold mb-8 text-gray-200 tracking-wider uppercase text-sm">Song of the Day</h2>
      
      {/* Hidden YouTube Player serving audio */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden -z-10">
        <YouTube 
          videoId={songData.youtubeId} 
          opts={opts} 
          onReady={(e) => setPlayerTarget(e.target)} 
          onEnd={() => setIsPlaying(false)} 
        />
      </div>

      <div className="relative w-64 h-64 mb-8 bg-gray-900 rounded-full flex items-center justify-center p-2 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-4 border-gray-950">
        <img 
          src={songData.coverUrl} 
          alt="Album Cover" 
          className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
        />
        <div className="absolute w-6 h-6 bg-gray-950 rounded-full border-2 border-gray-700 z-10"></div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">{songData.title}</h3>
      </div>

      <button 
        onClick={togglePlay}
        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-4 transition-transform hover:scale-105 active:scale-95 shadow-lg"
      >
        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
      </button>
    </section>
  );
}