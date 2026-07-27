import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hina — 5秒だけのSNS",
  description:
    "5秒の動画だけをスワイプするSNS。リアクションは押した秒数に固定され、みんなの盛り上がりが再生に同期して蘇る「Pulse」体験。",
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
