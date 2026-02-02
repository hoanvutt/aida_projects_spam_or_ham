"use client";

import { useMemo, useState } from "react";

type ApiResult = {
  label: "spam" | "ham";
  is_spam: boolean;
  spam_probability: number;
  ham_probability: number;
};

export default function HomePage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return subject.trim().length > 0 || message.trim().length > 0;
  }, [subject, message]);

  async function onCheck() {
    setError(null);
    setResult(null);

    if (!canSubmit) {
      setError("Please enter Subject or Message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Request failed.");
      }

      setResult(data as ApiResult);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemoSpam() {
    setSubject("promo");
    setMessage("Congratulations! You won $1000 gift card. Click now.");
  }
  function fillDemoHam() {
    setSubject("Meeting notes");
    setMessage("Hi team, attached are the notes from today's meeting. Thanks!");
  }

  const badge = result?.is_spam ? "SPAM" : result ? "HAM" : null;
  const confidence = result
    ? Math.max(result.spam_probability, result.ham_probability)
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Spam / Ham Email Checker</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Paste your email content, then click <span className="font-medium">Check</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow">
          <label className="block text-sm font-medium text-zinc-200">Subject (optional)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., promo, invoice, meeting..."
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-600"
          />

          <label className="mt-5 block text-sm font-medium text-zinc-200">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the email body here..."
            rows={9}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-600"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onCheck}
              disabled={!canSubmit || loading}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check"}
            </button>

            <button
              onClick={() => {
                setSubject("");
                setMessage("");
                setError(null);
                setResult(null);
              }}
              className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-200 hover:border-zinc-700"
            >
              Clear
            </button>

            <button
              onClick={fillDemoSpam}
              className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-200 hover:border-zinc-700"
            >
              Demo SPAM
            </button>

            <button
              onClick={fillDemoHam}
              className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-200 hover:border-zinc-700"
            >
              Demo HAM
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-zinc-300">Result</div>
                  <div className="mt-1 text-xl font-bold">{badge}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-300">Confidence</div>
                  <div className="mt-1 text-xl font-bold">{confidence?.toFixed(4)}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="text-sm text-zinc-300">Spam probability</div>
                  <div className="mt-1 text-lg font-semibold">{result.spam_probability.toFixed(6)}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="text-sm text-zinc-300">Ham probability</div>
                  <div className="mt-1 text-lg font-semibold">{result.ham_probability.toFixed(6)}</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-zinc-400">
                Calls <code className="rounded bg-zinc-900 px-1 py-0.5">POST /predict</code> via a Next.js proxy route
                to avoid CORS.
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 text-xs text-zinc-500">
          If you deploy this UI separately from the API, set{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5">SPAM_API_URL</code> in Railway Variables.
        </footer>
      </div>
    </main>
  );
}
