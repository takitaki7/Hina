# hina — 5秒だけのSNS 🎬

TikTokを「5秒だけ」に振り切った、縦スワイプの動画SNS。
撮るのは5秒。観るのも5秒。だから、ぜんぶ一瞬で伝わる。

## コンセプト

- **5秒の縦動画だけ** — 撮影は自動で5秒ストップ。フィードは上下スワイプの全画面
- **構造はシンプル** — フィード / 撮影 / リアクション、それだけ

## 新要素：Pulse（5秒シンク・リアクション）

すべてのクリップが**きっかり5秒**という制約を逆手に取った仕組み。

- リアクションは**押した瞬間の秒数（0〜5秒）に固定**される
- みんなのリアクションが**再生位置に同期して蘇る** — 同じ0.0〜5.0秒を全員で共有
- 5秒バーの上に**盛り上がり曲線（ハイプカーブ）**が出て、
  「**みんながどの瞬間で沸いたか**」がひと目でわかる（ピークは白く発光）

単なるいいね数ではなく、"5秒のどこ"で心が動いたかが可視化される、hinaだけの体験。

## 使い方

1. 上下スワイプでクリップを切り替え（TikTok風）
2. 下のリアクションを押すと、その秒数に Pulse が刻まれる
3. 右上「🎬 とる」でカメラ録画（5秒で自動停止）or 動画アップロード

## 技術構成

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 / TypeScript / Tailwind CSS v4
- 動画は **MediaRecorder** で録画し **IndexedDB** に保存 → バックエンド不要
- クリップのメタデータは `localStorage`、実データ（動画Blob）は IndexedDB

```
app/          layout / page / globals.css
components/   Feed / ClipCard(=5秒ループ+Pulse) / Recorder(録画・アップロード)
lib/          types / seed / store / db(IndexedDB) / time
```

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
```

> カメラ録画は https 環境（Vercel など）でのみ動作します。ローカルの `http://localhost` は許可されます。

## Vercel へのデプロイ

このリポジトリを import するだけ（`vercel.json` で Next.js を明示指定済み）。
環境変数・DB設定は不要です。
