import { useState, useMemo, useEffect } from 'react';
import { GitPullRequest, Loader2, CheckCircle2, Music, ChevronDown } from 'lucide-react';
import { submitPullRequest } from '../api/sheets';

export default function PullRequest({ user, playlists = {}, onUpdate, id = 'pr-form', bruteOpen = false }) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [playlist, setPlaylist] = useState('');
  const [customPlaylist, setCustomPlaylist] = useState('');
  const [status, setStatus] = useState('idle');
  const [isOpen, setIsOpen] = useState(false);

  // Open the form if parent requests a brute open (e.g., clicking a nav CTA)
  useEffect(() => {
    if (bruteOpen) {
      setIsOpen(true);
      // scroll into view if an element id is provided
      try {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        // ignore
      }
    }
  }, [bruteOpen, id]);

  const playlistOptions = useMemo(() => Object.keys(playlists || {}), [playlists]);

  if (!user) {
    return (
      <div className="rounded-[30px] border border-white/10 bg-slate-900/50 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
          <GitPullRequest className="h-8 w-8 text-indigo-300/80" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-slate-100">Join the curation</h3>
        <p className="text-sm text-slate-400">Sign in to submit a track suggestion for the repository.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song || !artist || !genre) return alert('Please fill out the required fields.');

    const suggestedPlaylist = customPlaylist.trim() || playlist;

    setStatus('loading');

    await submitPullRequest(user.name, user.email, song, artist, suggestedPlaylist, genre);

    if (onUpdate) await onUpdate();

    setStatus('success');
    setSong('');
    setArtist('');
    setGenre('');
    setPlaylist('');
    setCustomPlaylist('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div id={id} className="flex bottom-1 mt-20 items-center justify-center">
        <div className="w-[90vw] md:w-4/5 relative overflow-hidden  rounded-[30px] border border-white/15 bg-white/5 shadow-[0_25px_80px_rgba(15,23,42,0.8)] backdrop-blur-xl backdrop-saturate-150">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_28%,rgba(99,102,241,0.12)_55%,rgba(168,85,247,0.12))]" />
      <div className="absolute inset-[1px] rounded-[29px] border border-white/10 bg-slate-900/30" />
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-[50px]" />

      <div className="relative z-10 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-indigo-300/20 bg-slate-950/40 px-3 py-3 text-left transition-colors hover:border-indigo-400/30 hover:bg-slate-900/60 sm:px-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/15 p-2 text-indigo-200 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100 sm:text-base">Want to suggest music, open a PR</p>
              <p className="mt-0.5 text-[11px] text-slate-300/80">Drop a track into the curation queue</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'mt-4 max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300/80">Song title</label>
                  <div className="relative">
                    <Music className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={song}
                      onChange={e => setSong(e.target.value)}
                      required
                      placeholder="Pink + White"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300/80">Artist</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    required
                    placeholder="Frank Ocean"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
               
                <div className="flex-1 w-1/2">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300/80">Target playlist</label>
                  <select
                    value={playlist}
                    onChange={e => setPlaylist(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">No preference</option>
                    {playlistOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <h1 className="font-mono"> -OR- </h1>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300/80"> suggest a new playlist</label>
                 
                <input
                  type="text"
                  value={customPlaylist}
                  onChange={e => setCustomPlaylist(e.target.value)}
                  placeholder="e.g. night drives, afterhours, winter mix"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              </div>

<div className="flex flex-col gap-4 sm:flex-row">
 <div className="rounded-xl border flex-1 border-white/10 bg-slate-950/40 p-3">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300/80">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    required
                    placeholder="R&B"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
             

<div className="flex-1 flex items-center justify-center">
              <button
                type="submit"
                disabled={status !== 'idle' || !song || !artist}
                className="flex text-white items-center justify-center gap-2 h-10 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {status === 'loading' && <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</>}
                {status === 'success' && <><CheckCircle2 className="h-5 w-5 text-green-300" /> Sent to queue</>}
                {status === 'idle' && 'Send to curation'}
              </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}