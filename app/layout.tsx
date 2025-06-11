import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { auth } from "@/auth";
import Navbar from "@/app/components/navbar";
import ObserverProvider from "./components/ObserverPovider";
import Footer from "./components/footer";
import NextTopLoader from "nextjs-toploader";
import PlayerContextProvider from "./context/playerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guhuza Quiz",
  description: "Learn and test your knowledge with Guhuza Quiz",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/favicon.ico" }
    ],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth()

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <NextTopLoader />
        <SessionProvider session={session}>
        <ObserverProvider>
          <PlayerContextProvider>
            <Navbar />
            {children}
            <Footer />
          </PlayerContextProvider>
        </ObserverProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
