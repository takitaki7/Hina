# Hina 🫧

きみの *vibe* を置いていく、シンプルでかわいいZ世代向けSNS。
今の気分をワンタップでシェアして、絵文字でリアクションし合うだけ。

## 特徴

- **超シンプルな構造** — 投稿・vibeタグ・絵文字リアクションだけ
- **Z世代UI** — モバイルファースト / ダークネオン / グラデ / ストーリーバー / マイクロインタラクション
- **ゼロコンフィグ** — バックエンドもDBも不要。`localStorage` に保存するので、そのままVercelにデプロイして動く

## 技術構成

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- TypeScript
- Tailwind CSS v4

```
app/            画面（layout / page / globals.css）
components/     UI（Header / StoryBar / Composer / PostCard / Feed / BottomNav）
lib/            データ層（types / seed / store / time）
```

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
```

## Vercel へのデプロイ

このリポジトリをVercelに import するだけ。環境変数もビルド設定も不要。

1. [vercel.com/new](https://vercel.com/new) でこのリポジトリを選択
2. フレームワークは自動で **Next.js** が検出される
3. **Deploy** を押すだけ

## データについて

現在は端末内（`localStorage`）に保存するデモ構成です。
複数人でタイムラインを共有したくなったら、`lib/store.ts` の読み書き部分を
`fetch("/api/posts")` などに差し替え、Vercel Postgres / KV などに繋ぐだけで
本番SNSに拡張できます。
