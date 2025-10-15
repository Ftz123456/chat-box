import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "易旅AI - 智能占卜助手",
  description: "基于传统易学理论的AI智能占卜分析平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
