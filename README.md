# シャイニーカラーズ楽曲検索

アイドルマスター シャイニーカラーズの楽曲を検索できるWebアプリケーション。

## 機能

- ユニット、属性、タグによる楽曲フィルタリング
- キーワード検索
- 管理者向けデータ管理機能（認証付き）

## 技術スタック

- Next.js 16（App Router）
- React 19
- TypeScript 5
- Tailwind CSS 4
- TanStack Query（データフェッチ・キャッシュ）
- Supabase（PostgreSQL + Auth）

## ローカル開発

### 前提条件

- Node.js 20以上
- Docker（Supabaseローカル環境用）

### セットアップ

```bash
# 依存パッケージのインストール
npm install

# Supabaseローカル環境の起動
supabase start

# 環境変数の設定（.env.localを作成）
cp .env.example .env.local

# 開発サーバーの起動
npm run dev
```

### 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase startで表示されるanon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase startで表示されるservice_role key>
```

## コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npm run start    # プロダクションサーバー起動
```

## ディレクトリ構成

```
app/                    # Next.js App Router
  admin/                # 管理画面
  api/                  # API Routes
  auth/                 # 認証コールバック
components/             # UIコンポーネント
lib/                    # ユーティリティ
  auth/                 # 認証ヘルパー
  supabase/             # Supabaseクライアント
  types/                # 型定義
supabase/
  migrations/           # DBマイグレーション
  seed.sql              # 初期データ
```

## 使用ライブラリ

- [shinycolors-icons](https://github.com/g-Ratie/shinycolors-icons) - シャイニーカラーズのアイコンセット
