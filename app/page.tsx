import { redirect } from "next/navigation";

// The root URL is rewritten to the Dawn demo (see next.config.mjs). This page
// is only a fallback for any path that reaches the app router directly.
export default function Home() {
  redirect("/dawn");
}
