import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Import Navbar

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CareerForge | The Agentic Career OS",
  description: "AI-powered career optimization platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} antialiased bg-black text-white`}>
        {/* The Navigation Bar */}
        <Navbar />
        
        {/* Main Content (with padding for the fixed navbar) */}
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}