import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Hub — Personal Life Management Platform",
  description: "Manage money, savings, goals, tasks, daily living, and office workspace from one app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
