import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { AuthSessionProvider } from "@/components/session-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "미국 주식 리서치",
  description: "미국 주식 펀더멘털 분석 및 스크리너",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("dark", geistSans.variable, geistMono.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthSessionProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
