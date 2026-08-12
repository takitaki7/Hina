import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hina — a calm new tab",
    short_name: "Hina",
    description:
      "A calm, private new tab with a Liquid Glass design. 100% on-device.",
    start_url: "/",
    display: "standalone",
    background_color: "#e9f6ff",
    theme_color: "#7db9f0",
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
