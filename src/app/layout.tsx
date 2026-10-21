import type { Metadata } from "next";
import { Zilla_Slab } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import "./globals.css";

const zilla = Zilla_Slab({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-zilla" });

export const metadata: Metadata = {
  title: "Playlist: paid gigs for live musicians",
  description: "Venues post paid gigs with the fee up front. Musicians pitch with a profile that sounds like them.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={zilla.variable}>
      <body className="flex min-h-svh flex-col font-sans antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <Footer />
        <Reveal />
      </body>
    </html>
  );
}
