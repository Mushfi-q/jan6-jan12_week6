import ChatBox from "@/app/components/ChatBox";
import Link from "next/link";

async function getCompany(id) {
  const res = await fetch(`http://localhost:3000/api/companies/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch company");
  return res.json();
}

export default async function CompanyPage({ params }) {
  const { id } = await params;
  const company = await getCompany(id);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-gray-500 mt-1">YC Company Intelligence</p>
          </div>

          {company.domain && (
            <Link
              href={company.domain}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Visit Website
            </Link>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            Batch: {company.batch}
          </span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
            Stage: {company.stage}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">
            {company.location}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {company.description || "No description available."}
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Industries / Tags</h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(company.tags) && company.tags.length > 0 ? (
                company.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-zinc-800"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No tags available</span>
              )}
            </div>
          </div>

          {/* LLM Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">AI Insight</h2>
            <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
              {company.llm_summary || "LLM insight not available yet."}
            </p>
          </div>

          {/* Chatbot */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Ask Intelligence Bot</h2>
            <ChatBox companyId={id} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Scores */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Scores</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Momentum</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${Math.min(company.momentum_score * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">{company.momentum_score}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Stability</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.min(company.stability_score * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">{company.stability_score}</p>
              </div>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Facts</h2>
            <ul className="space-y-2 text-sm">
              <li><b>Batch:</b> {company.batch}</li>
              <li><b>Stage:</b> {company.stage}</li>
              <li><b>Location:</b> {company.location}</li>
              <li><b>Domain:</b> {company.domain || "—"}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
