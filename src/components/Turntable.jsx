import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function Turntable({ songData }) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioTarget, setAudioTarget] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!songData?.song || !songData?.artist) return;

    const query = `${songData.song} ${songData.artist}`;

    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results[0]) setMeta(data.results[0]);
      })
      .catch((err) => console.error('iTunes fetch error:', err));
  }, [songData]);

  if (!songData?.song) {
    return (
      <div className="rounded-[28px] border border-indigo-500/20 bg-slate-900/70 p-8 text-center font-mono text-sm text-slate-400 shadow-[0_0_35px_rgba(79,70,229,0.15)] backdrop-blur-sm" aria-live="polite">
        Loading record...
      </div>
    );
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
    <section className="group relative overflow-hidden rounded-[30px] border border-white/15 bg-white/5 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.85)] backdrop-blur-xl backdrop-saturate-150 sm:p-5 md:p-6 lg:p-7">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_30%,rgba(99,102,241,0.08)_70%,rgba(168,85,247,0.12))]" />
      <div className="absolute inset-[1px] rounded-[29px] border border-white/10 bg-slate-900/35" />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200/90">Now Spinning</span>
          <span className="rounded-full border border-indigo-300/30 bg-indigo-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-100">Live</span>
        </div>

        {/* Layout wrapper: Horizontal on mobile, vertical on desktop */}
        <div className="flex flex-row items-center gap-20 md:flex-col md:gap-0">
          
          {/* Record Section */}
          <div className="relative flex shrink-0 items-center justify-center md:py-3">
            <div className="absolute inset-x-4 top-5 h-16 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className={`relative flex h-24 w-24 sm:h-28 sm:w-28 md:h-40 md:w-40 lg:h-48 lg:w-48 items-center justify-center rounded-full border-[8px] border-slate-800/80 bg-[radial-gradient(circle,_#0f172a_0%,_#020617_58%,_#000_100%)] shadow-[0_0_40px_rgba(15,23,42,0.9)] aspect-square ${isPlayingPreview ? 'animate-spin-slow' : ''}`}>
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-5 rounded-full border border-white/5" />
              <div className="absolute inset-10 rounded-full border border-white/5" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_transparent_0%,_transparent_58%,_rgba(15,23,42,0.9)_60%,_rgba(15,23,42,1)_100%)]" />
              <div className="absolute inset-0 rounded-full opacity-80 [background-image:repeating-radial-gradient(circle,_rgba(255,255,255,0.12)_0_1.2px,_transparent_1.3px_11px)]" />

              <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 md:h-20 md:w-20 items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800 shadow-[0_0_25px_rgba(15,23,42,0.8)] aspect-square">
                <img
                  src={meta?.artworkUrl100?.replace('100x100', '400x400') || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400'}
                  className="h-full w-full object-cover"
                  alt="Album artwork"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
                <div className="absolute h-2 w-2 md:h-3 md:w-3 rounded-full border border-slate-700 bg-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" />
              </div>
            </div>
          </div>

          {/* Text and Button Section */}
          <div className="flex min-w-0 flex-1 flex-col justify-center md:mt-6 md:w-full md:block">
            <div className="text-left md:text-center">
              <h3 className="truncate text-lg font-black tracking-tight text-white sm:text-xl md:text-2xl">{songData.song}</h3>
              <p className="mt-0.5 truncate font-mono text-xs text-indigo-200 sm:text-sm md:mt-1">{songData.artist}</p>
            </div>

            <button
              onClick={togglePreview}
              disabled={!meta?.previewUrl}
              className="mt-3 md:mt-6 flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-fuchsia-500/90 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-bold text-white shadow-[0_0_25px_rgba(99,102,241,0.32)] backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              {isPlayingPreview ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />} 30s Sample
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}