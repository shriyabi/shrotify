import { useState, useEffect } from 'react';
import { GitPullRequest, Clock, Music, CheckCircle2, XCircle } from 'lucide-react';

export default function UserPullRequests({ activePRs, user, playlists }) {
  const [history, setHistory] = useState([]);

  // 1. Build and cache the PR History
  useEffect(() => {
    if (!user) return;
    
    // Pull any past PRs this user submitted on this device
    const storageKey = `shrotify_pr_history_${user.email}`;
    const storedHistory = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Get their currently active PRs from the database
    const myActive = activePRs.filter(pr => pr.email === user.email);

    // Merge them together (This captures newly generated IDs from the backend!)
    const historyMap = new Map();
    storedHistory.forEach(pr => historyMap.set(pr.id, pr));
    myActive.forEach(pr => historyMap.set(pr.id, pr));

    // Sort by date (newest first)
    const updatedHistory = Array.from(historyMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

    setHistory(updatedHistory);
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  }, [activePRs, user]);

  // 2. Helper function to check if the Admin merged the song into a playlist
  const checkIfMerged = (song, artist) => {
    if (!playlists) return false;
    const searchSong = song.toLowerCase().trim();
    const searchArtist = artist.toLowerCase().trim();
    
    for (const tracks of Object.values(playlists)) {
      // We use toLowerCase just in case the Admin corrected a typo when merging!
      if (tracks.some(t => t.song.toLowerCase().trim() === searchSong && t.artist.toLowerCase().trim() === searchArtist)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
        <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
          <GitPullRequest className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-200">My Pull Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of your submitted repository requests.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl p-12 text-center shadow-lg">
          <Music className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No submission history</h3>
          <p className="text-gray-600">When you submit a track from the dashboard, its status will be tracked here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((pr) => {
            // 3. Determine the live status of the PR
            const isPending = activePRs.some(active => active.id === pr.id);
            const isMerged = !isPending && checkIfMerged(pr.song, pr.artist);
            const isDeclined = !isPending && !isMerged;

            return (
              <div key={pr.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-lg transition-all hover:border-gray-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-200">{pr.song}</h3>
                  <p className="text-indigo-400 font-mono text-sm">{pr.artist}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {pr.genre}
                    </span>
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      {new Date(pr.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {/* Dynamic Status Badges */}
                  {isPending && (
                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                      Pending Review
                    </span>
                  )}
                  {isMerged && (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Merged
                    </span>
                  )}
                  {isDeclined && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      <XCircle className="w-3.5 h-3.5" />
                      Declined
                    </span>
                  )}

                  <span className="text-gray-700 font-mono text-[10px] mt-1">ID: {pr.id?.split('-')[0] || 'Unknown'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}