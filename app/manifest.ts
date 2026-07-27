import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "hina — 5秒だけのSNS",
    short_name: "hina",
    description:
      "5秒の動画だけをスワイプするSNS。押した秒数に刻まれる「Pulse」体験。",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050507",
    theme_color: "#050507",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
