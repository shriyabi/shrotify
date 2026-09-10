const GAS_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT;

export const fetchDashboardData = async () => {
  try {
    const res = await fetch(GAS_URL, { 
      method: 'GET',
      redirect: 'follow' 
    });
    
    // Check if the response is actually JSON before parsing
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       throw new Error("Apps Script did not return JSON. Check the deployment URL.");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const updateSongOfTheDay = async (title, youtubeId, coverUrl) => {
  await fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors', // Write-only bypass
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'updateSong', title, youtubeId, coverUrl })
  });
};

export const submitPullRequest = async (user, song) => {
  await fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors', // Write-only bypass
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'submitPR', user, song })
  });
};