import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Hina",
  description:
    "Hina keeps all of your data on your own device. No account, no tracking, no servers.",
};

const updated = "August 13, 2026";

export default function Privacy() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "64px 24px 96px",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#16283c",
        lineHeight: 1.65,
      }}
    >
      <a
        href="/"
        style={{
          display: "inline-block",
          marginBottom: 32,
          color: "#2f7fd6",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ← Hina
      </a>

      <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 8px" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#5a6b7d", margin: "0 0 40px" }}>
        Last updated: {updated}
      </p>

      <p>
        Hina is a New Tab page extension for Google Chrome. It is designed
        around a single principle: your data belongs to you and never leaves
        your device.
      </p>

      <h2 style={h2}>What Hina stores</h2>
      <p>
        Hina saves the content and preferences you create so they persist across
        new tabs and browser sessions. This includes your display name, your
        daily focus, your to-do items, your quick links, and your appearance
        settings (background, clock format, and sound). All of this is stored
        locally on your computer using the browser&rsquo;s{" "}
        <code>chrome.storage.local</code> API.
      </p>

      <h2 style={h2}>What Hina does not do</h2>
      <ul>
        <li>Hina does not have an account system or require any sign-in.</li>
        <li>Hina does not send your data to any server. There is no backend.</li>
        <li>
          Hina does not use analytics, advertising, tracking pixels, or
          cookies.
        </li>
        <li>
          Hina does not collect, sell, or share any personal or sensitive
          information with anyone.
        </li>
        <li>
          Hina does not load or execute any remote code. All code ships inside
          the extension package.
        </li>
      </ul>

      <h2 style={h2}>Search</h2>
      <p>
        When you use the search box, your query is sent directly to the search
        engine you selected (for example Google, Bing, or DuckDuckGo) so it can
        return results. Hina does not see, log, or store your searches. Your use
        of that search engine is governed by its own privacy policy.
      </p>

      <h2 style={h2}>Permissions</h2>
      <p>
        Hina requests a single Chrome permission, <code>storage</code>, which is
        used only to save your settings and content locally as described above.
      </p>

      <h2 style={h2}>Your control</h2>
      <p>
        Because everything is stored on your device, you can remove all of your
        data at any time by clearing the extension&rsquo;s storage or by
        removing Hina from Chrome.
      </p>

      <h2 style={h2}>Changes</h2>
      <p>
        If this policy changes, the updated version will be posted on this page
        with a new date.
      </p>

      <h2 style={h2}>Contact</h2>
      <p>
        Questions about this policy can be sent to the developer through the
        Chrome Web Store listing&rsquo;s support channel.
      </p>
    </main>
  );
}

const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: "36px 0 8px",
};
