import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundBridge — Where startups meet funding and talent",
  description:
    "Startups publish funding campaigns and post projects. Investors back ideas they believe in. Freelancers bid on real work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
