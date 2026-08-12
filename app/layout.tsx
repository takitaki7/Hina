import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Hina — a calm new tab";
const description =
  "A calm, private new tab with a Liquid Glass design: clock, daily focus with streaks, to-dos, a Pomodoro timer, quick links and search. 100% on-device.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Hina",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hina",
  },
  openGraph: {
    title,
    description,
    siteName: "Hina",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7db9f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
