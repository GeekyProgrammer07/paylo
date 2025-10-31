import './globals.css';
import { Providers } from "./providers"
import localFont from "next/font/local";

export const metadata = {
  title: "Client",
  description: "This is the Client facing App",
}

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <body className={geistMono.className}>{children}</body>
      </Providers>
    </html>
  );
}
