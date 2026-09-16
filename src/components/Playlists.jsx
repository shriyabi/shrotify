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
    // Added w-full and min-w-0 to prevent horizontal blowout
    <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700 transition-colors group w-full min-w-0">
      {/* Added shrink-0 so the image doesn't get crushed */}
      <img src={meta?.artworkUrl100 || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=100&h=100'} className="w-12 h-12 shrink-0 rounded-md object-cover shadow-md" alt="Album" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-200 truncate">{meta?.trackName || songName}</p>
        <div className="flex items-center gap-2 mt-0.5 min-w-0">
          <p className="text-xs text-gray-400 truncate">{meta?.artistName || artistName}</p>
          {genreName && <span className="shrink-0 bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">{genreName}</span>}
        </div>
      </div>
      {meta?.previewUrl && (
        // Added shrink-0 to button
        <button onClick={toggle} className="shrink-0 p-2 text-indigo-400 hover:text-white bg-gray-900 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all">
          {playing ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4 ml-0.5"/>}
        </button>
      )}
    </div>
  );
}

function PlaylistCard({ playlistTitle, tracks, activeUrl, setActiveUrl }) {
  return (
    // Added min-w-0 and overflow-hidden to ensure the card respects grid boundaries
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 shadow-lg w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2 min-w-0 gap-2">
        {/* Added truncate so long playlist titles don't push the bounds */}
        <h3 className="text-xl font-bold text-indigo-400 truncate">{playlistTitle}</h3>
        <span className="shrink-0 text-xs font-mono text-gray-500 bg-gray-950 px-2 py-1 rounded-full">{tracks?.length || 0} tracks</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {tracks && tracks.map((track, i) => (
          <TrackItem key={i} track={track} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
        ))}
        {(!tracks || tracks.length === 0) && <p className="text-gray-500 text-sm italic">Empty playlist.</p>}
      </div>
    </div>
  );
}

export default function Playlists({ playlists, playlistMeta }) {
  const [activeUrl, setActiveUrl] = useState(null);
  
  // Storage states for user's personal view
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('shrotify_favs')) || []);
  const [explore, setExplore] = useState(() => JSON.parse(localStorage.getItem('shrotify_exp')) || []);
  
  // Dropdown states
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
    // Added w-full and min-w-0 to parent wrapper
    <div className="space-y-12 pb-12 w-full min-w-0">
      
      {/* HEADER WITH DROPDOWN */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 relative z-50 min-w-0 gap-4" ref={dropdownRef}>
        <h2 className="text-xl md:text-2xl font-bold text-gray-200 flex items-center gap-3 truncate">
          Repositories
        </h2>
        
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap"
          >
            All Playlists <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 flex bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              
              {/* Left Side: Playlist List */}
              {/* FIXED MOBILE OVERFLOW: Replaced w-[calc(100vw-2rem)] with w-[85vw] max-w-[280px] sm:w-56 */}
              <div className="flex flex-col sm:w-56 w-[85vw] max-w-[280px] max-h-[350px] overflow-y-auto custom-scrollbar p-2 bg-gray-950">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-1">Select Sections</p>
                {allPlaylistsList.length === 0 && <p className="text-gray-500 text-sm p-2">No playlists exist.</p>}
                
                {allPlaylistsList.map(playlist => {
                  const isFav = favorites.includes(playlist);
                  const isExp = explore.includes(playlist);
                  
                  return (
                    <div 
                      key={playlist}
                      onMouseEnter={() => setHoveredPlaylist(playlist)}
                      onMouseLeave={() => setHoveredPlaylist(null)}
                      className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg group transition-colors min-w-0"
                    >
                      <span className="text-sm font-bold text-gray-300 truncate pr-2">{playlist}</span>
                      
                      <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleExplore(playlist)}
                          title={isExp ? "Remove from Explore" : "Add to Explore"}
                          className={`p-1.5 rounded-md transition-colors ${isExp ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                        >
                          {isExp ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => toggleFavorite(playlist)}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                          className={`p-1.5 rounded-md transition-colors ${isFav ? 'bg-yellow-500/20 text-yellow-500' : 'text-gray-500 hover:text-yellow-500 hover:bg-gray-700'}`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Hover Image Display */}
              <div className="hidden sm:flex w-48 bg-black relative items-center justify-center border-l border-gray-800">
                {hoveredPlaylist && playlistMeta[hoveredPlaylist]?.url ? (
                  <img src={playlistMeta[hoveredPlaylist].url} alt={hoveredPlaylist} className="w-full h-full object-cover max-w-full max-h-[14rem] animate-in fade-in duration-300" />
                ) : (
                  <div className="text-center p-4">
                    <LayoutGrid className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                    <span className="text-gray-600 text-xs font-mono block">Hover a playlist<br/>to preview</span>
                  </div>
                )}
                {hoveredPlaylist && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-sm drop-shadow-md truncate">{hoveredPlaylist}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAVORITES SECTION */}
      <div className="w-full min-w-0">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
          <h2 className="text-xl font-bold text-gray-300 truncate">Favorites</h2>
        </div>
        
        {validFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
            {validFavorites.map(playlist => (
              <PlaylistCard key={playlist} playlistTitle={playlist} tracks={playlists[playlist]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl p-6 text-center text-gray-500 text-sm w-full">
            Use the "All Playlists" menu to pin your favorites here.
          </div>
        )}
      </div>

      {/* EXPLORE SECTION */}
      <div className="w-full min-w-0">
        <div className="flex items-center gap-2 mb-6 mt-12">
          <LayoutGrid className="w-5 h-5 text-indigo-400 shrink-0" />
          <h2 className="text-xl font-bold text-gray-300 truncate">Explore</h2>
        </div>
        
        {validExplore.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
            {validExplore.map(playlist => (
              <PlaylistCard key={playlist} playlistTitle={playlist} tracks={playlists[playlist]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl p-6 text-center text-gray-500 text-sm w-full">
            Add playlists from the dropdown to start exploring.
          </div>
        )}
      </div>

    </div>
  );
}