const GAS_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT;

export const fetchDashboardData = async () => {
  try {
    const res = await fetch(GAS_URL, { method: 'GET', redirect: 'follow' });
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const updateSongOfTheDay = async (title, youtubeId, coverUrl) => {
  await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateSong', title, youtubeId, coverUrl }) });
};

export const submitPullRequest = async (user, song, artist, genre) => {
  await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'submitPR', user, song, artist, genre }) });
};

export const savePlaylists = async (playlists) => {
  await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'overwritePlaylists', playlists }) });
};

export const updatePRQueue = async (remainingPRs) => {
  await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'resolvePR', remainingPRs }) });
};