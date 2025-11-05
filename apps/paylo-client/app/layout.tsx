import "./globals.css";
import { Providers } from "../providers";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { JSX } from "react";
import { AppbarClient } from "../components/AppbarClient";

export const metadata: Metadata = {
  title: "Client",
  description: "This is the Client facing App",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
          <div className="min-w-screen min-h-screen bg-[#ebe6e6]">
            <AppbarClient />
            {children}
          </div>
        </body>
      </Providers>
    </html>
  );
}
