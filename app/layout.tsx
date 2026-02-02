import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spam / Ham Email Checker",
  description: "Check whether an email is SPAM or HAM using your Naive Bayes API."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
