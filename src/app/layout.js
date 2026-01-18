// src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkullFire",
  description: "SkullFire practice project — auth, dashboard, and daily builds.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-zinc-950">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "min-h-screen bg-zinc-950 text-white",
        ].join(" ")}
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}