export const getGasUrl = () => {
  return localStorage.getItem('shrotify_test_db') || import.meta.env.VITE_GAS_URL;
};

export const fetchDashboardData = async () => {
  const url = getGasUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const updateSongOfTheDay = async (song, artist) => {
  await fetch(getGasUrl(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateSong', song, artist }) });
};

export const submitPullRequest = async (user, song, artist, playlist, genre) => {
  await fetch(getGasUrl(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'submitPR', user, song, artist, playlist, genre }) });
};

export const savePlaylists = async (playlists, playlistMeta) => {
  await fetch(getGasUrl(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'overwritePlaylists', playlists, playlistMeta }) });
};

export const updatePRQueue = async (remainingPRs) => {
  await fetch(getGasUrl(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'resolvePR', remainingPRs }) });
};