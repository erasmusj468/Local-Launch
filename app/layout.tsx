import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LocalLaunch",
  description: "Manage your local business presence and microsites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
