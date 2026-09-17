import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronDown, Star, LayoutGrid, Plus, Check } from 'lucide-react';

function TrackItem({ track, activeUrl, setActiveUrl }) {
  const [meta, setMeta] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);

  const songName = track?.song || 'Unknown Song';
  const artistName = track?.artist || 'Unknown Artist';
  const genreName = track?.genre || '';
  const searchQuery = `${songName} ${artistName}`.trim();

  useEffect(() => {
    if (!searchQuery || searchQuery === 'Unknown Song Unknown Artist') return;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => { if (data.results[0]) setMeta(data.results[0]); })
      .catch(err => console.error("iTunes fetch error:", err));
  }, [searchQuery]);

  useEffect(() => {
    if (activeUrl !== meta?.previewUrl && playing && audio) {
      audio.pause();
      setPlaying(false);
    }
  }, [activeUrl, meta?.previewUrl, playing, audio]);

  const toggle = () => {
    if (!audio && meta?.previewUrl) {
      const a = new Audio(meta.previewUrl);
      a.onended = () => { setPlaying(false); setActiveUrl(null); };
      setAudio(a);
      a.play();
      setPlaying(true);
      setActiveUrl(meta.previewUrl);
    } else if (audio) {
      if (playing) { audio.pause(); setPlaying(false); setActiveUrl(null); } 
      else { audio.play(); setPlaying(true); setActiveUrl(meta.previewUrl); }
    }
  };

  return (
    // Liquid glass track item
    <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 p-2.5 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all duration-300 group w-full min-w-0 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
      <img src={meta?.artworkUrl100 || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=100&h=100'} className="w-12 h-12 shrink-0 rounded-xl object-cover shadow-md border border-white/5" alt="Album" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate drop-shadow-md">{meta?.trackName || songName}</p>
        <div className="flex items-center gap-2 mt-0.5 min-w-0">
          <p className="text-xs text-indigo-100/70 truncate">{meta?.artistName || artistName}</p>
          {genreName && <span className="shrink-0 bg-black/20 border border-white/5 text-indigo-200/80 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider whitespace-nowrap shadow-inner">{genreName}</span>}
        </div>
      </div>
      {meta?.previewUrl && (
        <button onClick={toggle} className="shrink-0 p-2.5 text-white hover:text-indigo-200 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)] md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          {playing ? <Pause className="w-4 h-4 fill-current"/> : <Play className="w-4 h-4 ml-0.5 fill-current"/>}
        </button>
      )}
    </div>
  );
}

function PlaylistCard({ playlistTitle, tracks, activeUrl, setActiveUrl }) {
  return (
    // Liquid Glass Card Wrapper
    <div className="relative bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-[1.3] border border-white/10 rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full min-w-0 overflow-hidden group hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500">
      
      {/* Glare/Sheen highlight to sell the "glass" look */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60 pointer-events-none rounded-[32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-5 border-b border-white/10 pb-4 min-w-0 gap-3">
        <h3 className="text-xl lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-fuchsia-100 truncate drop-shadow-sm">{playlistTitle}</h3>
        <span className="shrink-0 text-xs font-mono text-indigo-100/80 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shadow-inner backdrop-blur-md">{tracks?.length || 0} tracks</span>
      </div>
      
      <div className="relative z-10 space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {tracks && tracks.map((track, i) => (
          <TrackItem key={i} track={track} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
        ))}
        {(!tracks || tracks.length === 0) && <p className="text-white/40 text-sm italic py-4 text-center">Empty playlist.</p>}
      </div>
    </div>
  );
}

export default function Playlists({ playlists, playlistMeta }) {
  const [activeUrl, setActiveUrl] = useState(null);
  
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('shrotify_favs')) || []);
  const [explore, setExplore] = useState(() => JSON.parse(localStorage.getItem('shrotify_exp')) || []);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPlaylist, setHoveredPlaylist] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFavorite = (playlist) => {
    let newFavs;
    if (favorites.includes(playlist)) {
      newFavs = favorites.filter(p => p !== playlist);
    } else {
      newFavs = [...favorites, playlist];
      if (explore.includes(playlist)) toggleExplore(playlist);
    }
    setFavorites(newFavs);
    localStorage.setItem('shrotify_favs', JSON.stringify(newFavs));
  };

  const toggleExplore = (playlist) => {
    let newExp;
    if (explore.includes(playlist)) {
      newExp = explore.filter(p => p !== playlist);
    } else {
      newExp = [...explore, playlist];
      if (favorites.includes(playlist)) toggleFavorite(playlist);
    }
    setExplore(newExp);
    localStorage.setItem('shrotify_exp', JSON.stringify(newExp));
  };

  const allPlaylistsList = Object.keys(playlists || {});
  
  const validFavorites = favorites.filter(p => allPlaylistsList.includes(p));
  const validExplore = explore.filter(p => allPlaylistsList.includes(p));

  return (
    <div className="space-y-12 pb-12 w-full min-w-0">
      
      {/* HEADER WITH DROPDOWN */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-50 min-w-0 gap-4" ref={dropdownRef}>
        <h2 className="text-xl md:text-3xl font-black text-white flex items-center gap-3 truncate drop-shadow-lg">
          Repositories
        </h2>
        
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white/5 text-white border border-white/20 hover:bg-white/10 backdrop-blur-md px-3 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            All Playlists <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-14 flex bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-4">
              
              {/* Left Side: Playlist List */}
              <div className="flex flex-col sm:w-64 w-[85vw] max-w-[280px] max-h-[400px] overflow-y-auto custom-scrollbar p-3 bg-black/20">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 px-2 mt-1">Select Sections</p>
                {allPlaylistsList.length === 0 && <p className="text-white/40 text-sm p-2">No playlists exist.</p>}
                
                {allPlaylistsList.map(playlist => {
                  const isFav = favorites.includes(playlist);
                  const isExp = explore.includes(playlist);
                  
                  return (
                    <div 
                      key={playlist}
                      onMouseEnter={() => setHoveredPlaylist(playlist)}
                      onMouseLeave={() => setHoveredPlaylist(null)}
                      className="flex items-center justify-between p-2.5 hover:bg-white/10 rounded-xl group transition-colors min-w-0"
                    >
                      <span className="text-sm font-bold text-white/90 truncate pr-2">{playlist}</span>
                      
                      <div className="flex items-center gap-1.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleExplore(playlist)}
                          title={isExp ? "Remove from Explore" : "Add to Explore"}
                          className={`p-1.5 rounded-lg transition-colors border ${isExp ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-black/20 text-white/40 border-white/5 hover:text-white hover:bg-white/10'}`}
                        >
                          {isExp ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => toggleFavorite(playlist)}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                          className={`p-1.5 rounded-lg transition-colors border ${isFav ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-black/20 text-white/40 border-white/5 hover:text-yellow-400 hover:bg-white/10'}`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Hover Image Display */}
              <div className="hidden sm:flex w-56 bg-black/40 relative items-center justify-center border-l border-white/10">
                {hoveredPlaylist && playlistMeta[hoveredPlaylist]?.url ? (
                  <img src={playlistMeta[hoveredPlaylist].url} alt={hoveredPlaylist} className="w-full h-full object-cover max-w-full max-h-[16rem] animate-in fade-in duration-500" />
                ) : (
                  <div className="text-center p-4">
                    <LayoutGrid className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <span className="text-white/40 text-xs font-mono block">Hover a playlist<br/>to preview</span>
                  </div>
                )}
                {hoveredPlaylist && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-5">
                    <span className="text-white font-bold text-sm drop-shadow-xl truncate">{hoveredPlaylist}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAVORITES SECTION */}
      <div className="w-full min-w-0">
        <div className="flex items-center gap-3 mb-6">
          {/* Glassy icon wrapper */}
          <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.2)]">
             <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
          </div>
          <h2 className="text-2xl font-bold text-white truncate drop-shadow-md">Favorites</h2>
        </div>
        
        {validFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full min-w-0">
            {/* 1 col mobile, 2 cols small/tablet, 3 cols large/desktop */}
            {validFavorites.map(playlist => (
              <PlaylistCard key={playlist} playlistTitle={playlist} tracks={playlists[playlist]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 border-dashed rounded-[32px] p-8 text-center text-white/40 text-sm w-full shadow-inner">
            Use the "All Playlists" menu to pin your favorites here.
          </div>
        )}
      </div>

      {/* EXPLORE SECTION */}
      <div className="w-full min-w-0">
        <div className="flex items-center gap-3 mb-6 mt-14">
           {/* Glassy icon wrapper */}
          <div className="p-2 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <LayoutGrid className="w-5 h-5 text-fuchsia-300 shrink-0" />
          </div>
          <h2 className="text-2xl font-bold text-white truncate drop-shadow-md">Explore</h2>
        </div>
        
        {validExplore.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full min-w-0">
            {/* 1 col mobile, 2 cols small/tablet, 3 cols large/desktop */}
            {validExplore.map(playlist => (
              <PlaylistCard key={playlist} playlistTitle={playlist} tracks={playlists[playlist]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 border-dashed rounded-[32px] p-8 text-center text-white/40 text-sm w-full shadow-inner">
            Add playlists from the dropdown to start exploring.
          </div>
        )}
      </div>

    </div>
  );
}