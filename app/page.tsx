"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResult = {
  label: "spam" | "ham";
  is_spam: boolean;
  spam_probability: number;
  ham_probability: number;
};

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return subject.trim().length > 0 || message.trim().length > 0;
  }, [subject, message]);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

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

  const pillClass = result?.is_spam
    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/25"
    : result
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25"
    : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/15";

  const heroGrad =
    "bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-500 dark:via-violet-500 dark:to-fuchsia-500";

  const pageBg =
    "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100";

  return (
    <main className={"min-h-screen " + pageBg}>
      {/* Top nav */}
      <header className="border-b border-slate-200/70 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className={"h-9 w-9 rounded-xl " + heroGrad} aria-hidden="true" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Spam/Ham</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Naive Bayes Email Checker
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://web-production-2c982.up.railway.app/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:inline-flex"
            >
              API Docs
            </a>

            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
              <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Build. Test. Deploy.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Paste an email subject and body, then run a quick SPAM/HAM check using your deployed Naive Bayes model.
              Great for demos, QA, and building an API-driven workflow.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onCheck}
                disabled={!canSubmit || loading}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {loading ? "Checking..." : "Check email"}
              </button>

              <button
                onClick={fillDemoSpam}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Demo SPAM
              </button>

              <button
                onClick={fillDemoHam}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Demo HAM
              </button>
            </div>

            {badge && (
              <div className="mt-6 flex items-center gap-3">
                <div className={"rounded-full border px-3 py-1 text-sm font-semibold " + pillClass}>
                  {badge}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Confidence: <span className="font-semibold text-slate-900 dark:text-slate-100">{confidence?.toFixed(4)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>

          {/* Decorative panel (inspired by the .NET hero image area) */}
          <div className="relative">
            <div className={"absolute inset-0 -z-10 rounded-3xl opacity-15 blur-3xl " + heroGrad} />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Email input</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Subject + Message</div>
                </div>
                {badge && (
                  <div className={"rounded-full border px-3 py-1 text-sm font-semibold " + pillClass}>
                    {badge}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., invoice, promo, meeting..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Paste the email body here..."
                    rows={7}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                  />
                </div>

                {result && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Spam probability</div>
                        <div className="mt-1 text-lg font-semibold">{result.spam_probability.toFixed(6)}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Ham probability</div>
                        <div className="mt-1 text-lg font-semibold">{result.ham_probability.toFixed(6)}</div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      Uses <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 dark:bg-white/10 dark:text-slate-200">POST /predict</code>{" "}
                      via a Next.js proxy route to avoid CORS.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
