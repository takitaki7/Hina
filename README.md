# hina — 5秒だけのSNS 🎬

TikTokを「5秒だけ」に振り切った、縦スワイプの動画SNS。
撮るのは5秒。観るのも5秒。だから、ぜんぶ一瞬で伝わる。

## コンセプト

- **5秒の縦動画だけ** — 撮影は自動で5秒ストップ。フィードは上下スワイプの全画面
- **バックエンド不要** — 動画は端末内（IndexedDB）に保存。Vercelにそのままデプロイして動く

## 新要素：Pulse（5秒シンク・リアクション）

すべてのクリップが**きっかり5秒**という制約を逆手に取った仕組み。

- いいね（ダブルタップ）は**押した瞬間の秒数（0〜5秒）に刻まれる**
- みんなの反応が**再生位置に同期して蘇る**（絵文字が当時のタイミングで舞う）
- 5秒シークバー上に**盛り上がりピーク**が光り、「みんながどこで沸いたか」が見える

## 機能（TikTok準拠）

- **フィード**：おすすめ / フォロー中（フォローした人だけ表示）
- **撮影**：カメラ録画（5秒自動停止）＋ 動画アップロード
- **いいね / コメント / 保存 / シェア**（Web Share ＋ リンクコピー）
- **フォロー / フォロー解除**
- **プロフィール**：自分・他人、統計（フォロー/フォロワー/いいね）、投稿・保存グリッド、プロフィール編集
- **さがす**：ユーザー・キャプション検索、急上昇グリッド
- **受信箱**：いいね/コメント/フォローの通知
- 下部タブバーで各画面を行き来（TikTokの二色＋ボタンで撮影）

## 実機・品質

- モバイルファースト、セーフエリア（ノッチ/ホームバー）対応
- `prefers-reduced-motion` 尊重、PWA manifest / アイコン / OGメタ
- 保存先：メタデータは `localStorage`、動画Blobは IndexedDB

## 技術構成

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 / TypeScript / Tailwind CSS v4
- 録画は **MediaRecorder**、永続化は **IndexedDB + localStorage**

```
app/          layout / page / globals.css / manifest / icon
components/   HinaApp(ルート) / Feed / ClipCard / Recorder / CommentsSheet
              Profile / Discover / Inbox / BottomNav
lib/          types / seed / store / db(IndexedDB) / time
```

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
```

> カメラ録画は https 環境（Vercel など）と `http://localhost` で動作します。

## Vercel へのデプロイ

このリポジトリを import するだけ（`vercel.json` で Next.js を明示済み）。
環境変数・DB設定は不要です。
