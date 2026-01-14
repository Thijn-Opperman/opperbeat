import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import DynamicTitle from "./components/DynamicTitle";

export const metadata: Metadata = {
  title: "Opperbeat - Dashboard",
  description: "DJ analytics and performance dashboard",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <DynamicTitle />
          {children}
        </Providers>
      </body>
    </html>
  );
}
