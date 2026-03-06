import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Iuran Lebaran Keluarga",
  description: "Kelola dana iuran keluarga untuk Lebaran / Reuni secara transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
