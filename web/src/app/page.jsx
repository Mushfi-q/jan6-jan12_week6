"use client";

import { useState } from "react";
import Link from "next/link";

async function searchCompanies(q) {
  const res = await fetch(`/api/search?q=${q}`, { cache: "no-store" });
  return res.json();
}

export default function Home() {
  const [query, setQuery] = useState("ai");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const data = await searchCompanies(query);
    setCompanies(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">YC Company Explorer</h1>
          <p className="text-gray-600">Search, analyze and explore Y Combinator companies</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, tag, description..."
            className="flex-1 p-3 rounded-xl border shadow-sm focus:outline-none"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600">Searching companies...</div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(c => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{c.name}</h2>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {c.batch}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  {c.stage}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                📍 {c.location || "Unknown"}
              </p>

              <p className="text-sm text-gray-500 line-clamp-3">
                {c.description || "No description available."}
              </p>

              {/* Scores */}
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-purple-600">⚡ Momentum: {c.momentum_score ?? "—"}</span>
                <span className="text-orange-600">🛡 Stability: {c.stability_score ?? "—"}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!loading && companies.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            No companies found. Try a different keyword.
          </div>
        )}

      </div>
    </main>
  );
}
