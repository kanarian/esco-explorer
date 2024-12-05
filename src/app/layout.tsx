import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Lola's ESCO explorer",
  description:
    "Deze tool is gemaakt om de ESCO beroepen en skills database beter te verkennen.",
  icons: [{ rel: "icon", url: "/lola-logo-favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
