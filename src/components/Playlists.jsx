import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Star, ChevronDown, Plus } from 'lucide-react';

// --- TRACK ITEM COMPONENT ---
function TrackItem({ query, activeUrl, setActiveUrl }) {
  const [meta, setMeta] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => { if (data.results[0]) setMeta(data.results[0]); });
  }, [query]);

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
    <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700 transition-colors group">
      <img src={meta?.artworkUrl100 || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=100&h=100'} className="w-12 h-12 rounded-md object-cover shadow-md" alt="Album" />
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

// --- PLAYLIST CARD COMPONENT ---
function PlaylistCard({ genre, tracks, activeUrl, setActiveUrl }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2 relative z-10">
        <h3 className="text-xl font-bold text-indigo-400">{genre}</h3>
        <span className="text-xs font-mono text-gray-500 bg-gray-950 px-2 py-1 rounded-full">{tracks.length} tracks</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {tracks.map((track, i) => (
          <TrackItem key={i} query={track} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
        ))}
      </div>
    </div>
  );
}

// --- MAIN PLAYLISTS DASHBOARD ---
export default function Playlists({ playlists }) {
  const [activeUrl, setActiveUrl] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredGenre, setHoveredGenre] = useState(null);
  const [playlistImages, setPlaylistImages] = useState({});
  const dropdownRef = useRef(null);

  // Load pinned playlists from local storage (or default to empty array)
  const [pinned, setPinned] = useState(() => {
    const saved = localStorage.getItem('shrotify_pinned');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch cover art for the *first* track of each playlist to use as the playlist cover
  useEffect(() => {
    Object.entries(playlists).forEach(async ([genre, tracks]) => {
      if (tracks.length > 0 && !playlistImages[genre]) {
        try {
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(tracks[0])}&entity=song&limit=1`);
          const data = await res.json();
          if (data.results[0]) {
            setPlaylistImages(prev => ({ ...prev, [genre]: data.results[0].artworkUrl100.replace('100x100', '400x400') }));
          }
        } catch (e) {
          console.error("Failed to fetch image for", genre);
        }
      }
    });
  }, [playlists]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePin = (genre) => {
    const newPinned = pinned.includes(genre) ? pinned.filter(p => p !== genre) : [...pinned, genre];
    setPinned(newPinned);
    localStorage.setItem('shrotify_pinned', JSON.stringify(newPinned));
  };

  const pinnedGenres = Object.keys(playlists).filter(g => pinned.includes(g));
  const unpinnedGenres = Object.keys(playlists).filter(g => !pinned.includes(g));

  return (
    <div className="space-y-10">
      
      {/* Pinned Playlists Header & Custom Dropdown */}
      <div className="flex items-center justify-between relative" ref={dropdownRef}>
        <div className="flex items-center gap-3 border-b border-yellow-500/30 pb-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-200">Your Favorites</h2>
        </div>

        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-all text-gray-300"
        >
          <Plus className="w-4 h-4" /> Edit Pins <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Custom Multi-Select Hover Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 z-50 flex bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            
            {/* Left Column: The Checkbox List */}
            <div className="flex flex-col w-48 max-h-64 overflow-y-auto custom-scrollbar p-2 bg-gray-950">
              <p className="text-xs font-mono text-gray-500 mb-2 px-2">Select to pin</p>
              {Object.keys(playlists).map(genre => (
                <label 
                  key={genre}
                  onMouseEnter={() => setHoveredGenre(genre)}
                  onMouseLeave={() => setHoveredGenre(null)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <input 
                    type="checkbox" 
                    checked={pinned.includes(genre)} 
                    onChange={() => togglePin(genre)}
                    className="w-4 h-4 accent-indigo-500 rounded bg-gray-800 border-gray-700"
                  />
                  <span className={`text-sm font-bold ${pinned.includes(genre) ? 'text-white' : 'text-gray-400'}`}>{genre}</span>
                </label>
              ))}
            </div>

            {/* Right Column: The Hover Image Reveal */}
            <div className="w-48 bg-black relative flex items-center justify-center border-l border-gray-800">
              {hoveredGenre && playlistImages[hoveredGenre] ? (
                <img 
                  src={playlistImages[hoveredGenre]} 
                  alt={hoveredGenre} 
                  className="w-full h-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <div className="text-center p-4">
                  <Star className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                  <span className="text-gray-600 text-xs font-mono block">Hover a genre<br/>to preview</span>
                </div>
              )}
              {hoveredGenre && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-sm drop-shadow-md">{hoveredGenre}</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Render Favorites */}
      {pinnedGenres.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {pinnedGenres.map(genre => (
            <PlaylistCard key={genre} genre={genre} tracks={playlists[genre]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl p-8 text-center">
          <p className="text-gray-500">No playlists pinned yet.</p>
          <p className="text-sm text-gray-600 mt-1">Use the "Edit Pins" button to customize your dashboard.</p>
        </div>
      )}

      {/* Standard Playlists Header */}
      {unpinnedGenres.length > 0 && (
        <>
          <div className="border-b border-gray-800 pb-2 mt-12">
            <h2 className="text-2xl font-bold text-gray-200">Library</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {unpinnedGenres.map(genre => (
              <PlaylistCard key={genre} genre={genre} tracks={playlists[genre]} activeUrl={activeUrl} setActiveUrl={setActiveUrl} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}