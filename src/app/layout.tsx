import type { Metadata } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Poppins,
  Inter,
  Caveat,
  Dancing_Script,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "LoveWith Dhyey | Create Cinematic Memory Stories",
  description:
    "Create beautiful, animated, and cinematic greeting websites for Father's Day and special occasions. Reconnect and share memories completely free.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${poppins.variable} ${inter.variable} ${caveat.variable} ${dancing.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFCFC] text-[#2d2d2d] selection:bg-[#F8D7DA]">
        {children}
      </body>
    </html>
  );
}
