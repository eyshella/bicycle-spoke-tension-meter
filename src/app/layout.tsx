import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/styling/global.scss";

const font = Roboto({ subsets: ["latin"], weight: ['100', '300', '400', '500', '700', '900'] });

export const metadata: Metadata = {
  title: "BST",
  description: "Bike Spoke Tension",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <title>Bike Spoke Tension</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      <link rel="manifest" href="/site.webmanifest"/>
    </head>
    <body className={font.className}>{children}</body>
    </html>
  );
}
