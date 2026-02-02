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

  const pillClass =
    result?.is_spam
      ? "bg-red-50 text-red-700 border-red-200"
      : result
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Spam / Ham Email Checker</h1>
            <p className="mt-2 text-sm text-slate-600">
              Paste your email content, then click <span className="font-medium">Check</span>.
            </p>
          </div>

          {badge && (
            <div className={"shrink-0 rounded-full border px-3 py-1 text-sm font-semibold " + pillClass}>
              {badge}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">Subject (optional)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., promo, invoice, meeting..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />

          <label className="mt-5 block text-sm font-medium text-slate-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the email body here..."
            rows={9}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onCheck}
              disabled={!canSubmit || loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              onClick={fillDemoSpam}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Demo SPAM
            </button>

            <button
              onClick={fillDemoHam}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Demo HAM
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-600">Result</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{badge}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Confidence</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{confidence?.toFixed(4)}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-600">Spam probability</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {result.spam_probability.toFixed(6)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-600">Ham probability</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {result.ham_probability.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Calls <code className="rounded bg-white px-1 py-0.5 border border-slate-200">POST /predict</code> via a Next.js
                proxy route to avoid CORS.
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 text-xs text-slate-500">
          If you deploy this UI separately from the API, set{" "}
          <code className="rounded bg-white px-1 py-0.5 border border-slate-200">SPAM_API_URL</code> in Railway Variables.
        </footer>
      </div>
    </main>
  );
}
