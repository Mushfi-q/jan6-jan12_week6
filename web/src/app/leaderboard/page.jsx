import Link from "next/link";

async function getLeaderboard() {
  const res = await fetch("http://localhost:3000/api/leaderboard", {
    cache: "no-store",
  });
  return res.json();
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-500 text-xl">🥇</span>;
  if (rank === 2) return <span className="text-gray-400 text-xl">🥈</span>;
  if (rank === 3) return <span className="text-amber-700 text-xl">🥉</span>;
  return <span className="font-mono text-sm">#{rank}</span>;
}

function Table({ title, icon, headers, rows, renderRow }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              {headers.map((h) => (
                <th key={h} className="p-3 text-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🏆 Company Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ranking YC companies by momentum, stability, and recent activity.
        </p>
      </div>

      {/* Top Momentum */}
      <Table
        title="Top Momentum Companies"
        icon="🚀"
        headers={["Rank", "Company", "Momentum Score"]}
        rows={data.top_momentum}
        renderRow={(c, i) => (
          <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-3"><RankBadge rank={i + 1} /></td>
            <td className="p-3">
              <Link
                href={`/companies/${c.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {c.name}
              </Link>
            </td>
            <td className="p-3 font-mono">{Number(c.momentum_score).toFixed(2)}</td>
          </tr>
        )}
      />

      {/* Most Stable */}
      <Table
        title="Most Stable Companies"
        icon="🧱"
        headers={["Rank", "Company", "Stability Score"]}
        rows={data.most_stable}
        renderRow={(c, i) => (
          <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-3"><RankBadge rank={i + 1} /></td>
            <td className="p-3">
              <Link
                href={`/companies/${c.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {c.name}
              </Link>
            </td>
            <td className="p-3 font-mono">{Number(c.stability_score).toFixed(2)}</td>
          </tr>
        )}
      />

      {/* Recently Changed */}
      <Table
        title="Recently Changed Companies"
        icon="🕒"
        headers={["Company", "Last Change Detected"]}
        rows={data.recently_changed}
        renderRow={(c) => (
          <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-3">
              <Link
                href={`/companies/${c.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {c.name}
              </Link>
            </td>
            <td className="p-3 text-sm text-gray-600">
              {new Date(c.detected_at).toLocaleString()}
            </td>
          </tr>
        )}
      />
    </main>
  );
}
