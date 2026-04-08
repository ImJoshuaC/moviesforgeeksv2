import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "MoviesForGeeks",
  description: "Your go-to site for film and TV reviews, watchlists, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased flex flex-col min-h-screen"
      >
        <TooltipProvider>
        <Navbar />
        {children}
        <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
