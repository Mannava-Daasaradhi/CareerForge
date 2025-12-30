import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 1. Configure Fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap",
});

// 2. SEO Metadata
export const metadata: Metadata = {
  title: "CareerForge | AI Career Command Center",
  description: "Autonomous agents for job hunting, interview prep, and salary negotiation. Stop applying, start commanding.",
  icons: {
    icon: "/favicon.ico",
  },
};

// 3. Root Layout Wrapper
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-black text-white antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}