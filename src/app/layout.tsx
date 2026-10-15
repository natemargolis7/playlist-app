import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const heading = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Playlist: live music gigs",
  description: "Connect live musicians with paid gigs at venues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
