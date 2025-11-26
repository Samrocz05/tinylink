"use client";

import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  if (isNaN(d)) return "Invalid date";
  return d.toLocaleString();
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ url: "", code: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  const loadLinks = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/links");
      if (!res.ok) {
        setFetchError("Failed to load links.");
        setLinks([]);
      } else {
        const data = await res.json();
        setLinks(data);
      }
    } catch (err) {
      console.error(err);
      setFetchError("Network error while loading links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleChange = (e) => {
    setFormError("");
    setFormSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.url.trim()) {
      setFormError("URL is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url.trim(),
          code: form.code.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create link.");
      } else {
        setFormSuccess(`Short link created: ${data.code}`);
        setForm({ url: "", code: "" });
        loadLinks();
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error while creating link.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm(`Delete link ${code}?`)) return;

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        alert("Failed to delete link.");
      } else {
        setLinks((prev) => prev.filter((l) => l.code !== code));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting.");
    }
  };

  const handleCopy = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("Copied to clipboard!");
    } catch {
      alert("Failed to copy.");
    }
  };

  const filteredLinks = links.filter((link) => {
    const q = search.toLowerCase();
    return (
      link.code.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">
            TinyLink <span className="text-sky-400 text-sm">by Sam</span>
          </h1>
          <span className="text-xs text-slate-400">
            Candidate ID: <span className="font-mono">Naukri1125</span>
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Create form */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-950/40">
          <h2 className="text-lg font-semibold mb-2">Create a short link</h2>
          <p className="text-sm text-slate-400 mb-4">
            Enter a long URL and optionally a custom code (6–8 characters,
            letters and digits).
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:items-end"
          >
            <div className="flex-1 space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Target URL
              </label>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="https://example.com/my/very/long/url"
                required
              />
            </div>

            <div className="sm:w-48 space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Custom code (optional)
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="myDocs1"
                maxLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="sm:w-32 inline-flex justify-center items-center rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-700 px-4 py-2 text-sm font-semibold shadow-md shadow-sky-500/30 transition"
            >
              {submitting ? "Creating..." : "Shorten"}
            </button>
          </form>

          <div className="mt-3 text-sm">
            {formError && (
              <p className="text-red-400 font-medium">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-emerald-400 font-medium">{formSuccess}</p>
            )}
          </div>
        </section>

        {/* Search + table */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-950/40 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold">Your links</h2>
            <input
              type="text"
              placeholder="Search by code or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading links…</p>
          ) : fetchError ? (
            <p className="text-sm text-red-400">{fetchError}</p>
          ) : filteredLinks.length === 0 ? (
            <p className="text-sm text-slate-400">
              No links yet. Create your first short link above.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                    <th className="text-left py-2 px-2">Code</th>
                    <th className="text-left py-2 px-2 w-1/2">Target URL</th>
                    <th className="text-left py-2 px-2">Clicks</th>
                    <th className="text-left py-2 px-2">Last clicked</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => {
                    const shortUrl = `${BASE_URL}/${link.code}`;
                    return (
                      <tr
                        key={link.code}
                        className="border-b border-slate-900/60 hover:bg-slate-900/70"
                      >
                        <td className="py-2 px-2 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-sky-300">
                              {link.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(shortUrl)}
                              className="text-xs text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
                            >
                              Copy {shortUrl}
                            </button>
                            <a
                              href={`/code/${link.code}`}
                              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
                            >
                              View stats
                            </a>
                          </div>
                        </td>
                        <td className="py-2 px-2 align-top max-w-xs">
                          <div
                            className="truncate"
                            title={link.url}
                          >
                            {link.url}
                          </div>
                        </td>
                        <td className="py-2 px-2 align-top">{link.clicks}</td>
                        <td className="py-2 px-2 align-top">
                          {formatDate(link.last_clicked_at)}
                        </td>
                        <td className="py-2 px-2 align-top text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(link.code)}
                            className="text-xs rounded-lg border border-red-500/60 px-3 py-1 text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/70">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex flex-col sm:flex-row gap-1 justify-between">
          <span>Aganitha TinyLink take-home · Built with Next.js + Postgres</span>
          <span>Health: <a href="/healthz" className="underline">/healthz</a></span>
        </div>
      </footer>
    </main>
  );
}
