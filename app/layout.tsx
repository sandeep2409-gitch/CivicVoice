import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Citizen Voice — Community Issue Reporting",
  description:
    "Empowering communities to report, verify, and resolve civic issues using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          {/* Main content area adjusts for sidebar on desktop and bottom nav on mobile */}
          <main className="flex-1 min-w-0 md:ml-[244px] pb-12 md:pb-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
