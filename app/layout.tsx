import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spam / Ham Email Checker",
  description: "Check whether an email is SPAM or HAM using your Naive Bayes API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Theme is toggled by adding/removing the `dark` class on <html> in app/page.tsx
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
