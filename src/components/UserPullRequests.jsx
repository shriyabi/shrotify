import { GitPullRequest, Clock } from 'lucide-react';

export default function UserPRs({ activePRs, user }) {
  const myPendingPRs = activePRs.filter(pr => pr.user === user.name);

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <GitPullRequest className="w-8 h-8 text-indigo-500" />
        <h2 className="text-3xl font-bold">My Pull Requests</h2>
      </div>

      {myPendingPRs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">You have no pending pull requests.</p>
          <p className="text-gray-500 text-sm mt-2">Go to the dashboard to suggest a track!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPendingPRs.map((pr, i) => (
            <div key={i} className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex justify-between items-center hover:border-indigo-500/50 transition-colors">
              <div>
                <p className="font-bold text-lg text-white">{pr.song}</p>
                <p className="text-sm text-gray-400">
                  by {pr.artist} <span className="mx-2">•</span> Target: <span className="text-indigo-400 font-mono">{pr.playlist}</span> <span className="mx-2">•</span> Genre: <span className="text-gray-300">{pr.genre}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Pending Review</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}