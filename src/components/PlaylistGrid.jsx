export default function PlaylistGrid({ playlists }) {
  return (
    <section className="grid grid-cols-2 gap-4">
      {Object.entries(playlists).map(([genre, tracks]) => (
        <div key={genre} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer group">
          <div className="h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center group-hover:bg-indigo-900/50 transition-colors">
            <h3 className="text-2xl font-bold text-gray-300 group-hover:text-white">{genre}</h3>
          </div>
          <p className="text-sm text-gray-400 text-center">{tracks.length} tracks</p>
        </div>
      ))}
    </section>
  );
}