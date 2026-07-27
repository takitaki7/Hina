import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "hina — 5秒だけのSNS";
const description =
  "5秒の動画だけをスワイプするSNS。リアクションは押した秒数に固定され、みんなの盛り上がりが再生に同期して蘇る「Pulse」体験。";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "hina",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "hina",
  },
  openGraph: {
    title,
    description,
    siteName: "hina",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
