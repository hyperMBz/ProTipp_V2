import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ProTipp V2 - Sports Arbitrage & Expected Value Betting",
  description: "Professional sports arbitrage and expected value betting platform. Find profitable opportunities across multiple sportsbooks with real-time odds.",
  keywords: "arbitrage, sports betting, expected value, EV betting, odds comparison",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark">
      <body className={`${inter.variable} antialiased font-sans`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
