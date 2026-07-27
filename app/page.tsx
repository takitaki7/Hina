import Header from "@/components/Header";
import Feed from "@/components/Feed";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Feed />
      </main>
      <BottomNav />
    </div>
  );
}
