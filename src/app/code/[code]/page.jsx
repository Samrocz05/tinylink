"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  if (isNaN(d)) return "Invalid date";
  return d.toLocaleString();
}

export default function CodeStatsPage() {
  const params = useParams();
  const code = params.code;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/links/${code}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Short link not found.");
          } else {
            setError("Failed to load stats.");
          }
        } else {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error(err);
        setError("Network error while loading stats.");
      } finally {
        setLoading(false);
      }
    };

    if (code) load();
  }, [code]);

  const fullShortUrl = `${BASE_URL}/${code}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold">TinyLink · Stats</h1>
          <a
            href="/"
            className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            ← Back to dashboard
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading stats…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-950/40">
              <h2 className="text-lg font-semibold mb-3">
                Short link:{" "}
                <span className="font-mono text-sky-300">{data.code}</span>
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs uppercase mb-1">
                    Short URL
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono break-all">{fullShortUrl}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(fullShortUrl);
                          alert("Copied short URL!");
                        } catch {
                          alert("Failed to copy.");
                        }
                      }}
                      className="text-xs rounded-lg border border-sky-500/60 px-3 py-1 text-sky-300 hover:bg-sky-500/10"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase mb-1">
                    Target URL
                  </p>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sky-300 hover:text-sky-200 underline underline-offset-2"
                  >
                    {data.url}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Total clicks
                    </p>
                    <p className="text-xl font-semibold">{data.clicks}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Last clicked
                    </p>
                    <p>{formatDate(data.last_clicked_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Created at
                    </p>
                    <p>{formatDate(data.created_at)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="text-xs text-slate-500">
              <p>
                Tip: Hit <span className="font-mono">{fullShortUrl}</span> in a
                new tab to increment the click count and refresh this page.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
