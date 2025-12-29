# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

シャイニーカラーズの楽曲検索アプリケーション。Next.js 16（App Router）、React 19、Tailwind CSS 4、Supabaseを使用。

## コマンド

```bash
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npm run start    # プロダクションサーバー起動

supabase start   # ローカルSupabase起動
supabase stop    # ローカルSupabase停止
supabase db reset # DBリセット（マイグレーション再実行）
```

## 技術スタック

- Next.js 16.1.1（App Router）
- React 19.2.3
- Tailwind CSS 4
- TypeScript 5（strict mode）
- ESLint 9（eslint-config-next）
- TanStack Query 5（データフェッチ・キャッシュ）
- Supabase（PostgreSQL + Auth）
- @supabase/ssr（SSR対応クライアント）

## アーキテクチャ

```
app/                      # Next.js App Router
  admin/                  # 管理画面（認証必須）
    [resource]/actions.ts # Server Actions
  api/auth/               # 認証API
  auth/callback/          # OAuth/Magic Linkコールバック
components/               # 共通UIコンポーネント
lib/
  auth/                   # 認証ヘルパー（isAdmin, rateLimit）
  hooks/                  # カスタムフック
    useFilterState.ts     # URLパラメータ連携フィルタ状態
    useSongsQuery.ts      # TanStack Query楽曲取得フック
  supabase/               # Supabaseクライアント
    admin.ts              # Service Roleクライアント（RLSバイパス）
    server.ts             # サーバーサイドクライアント
    middleware.ts         # セッション更新用
  types/                  # 型定義
  queries.ts              # 公開データ取得用クエリ
middleware.ts             # 認証・認可ミドルウェア
supabase/
  migrations/             # DBマイグレーション
  seed.sql                # 初期データ
  config.toml             # Supabase設定
```

## 認証・認可

- Magic Link認証（Supabase Auth）
- admin_emailsテーブルで管理者メール許可リスト管理
- /admin配下はMiddlewareで認可チェック（非認可は403）
- RLSポリシーで全テーブルのアクセス制御
- Server ActionsはService Roleクライアントを使用

## Supabaseクライアントの使い分け

- `lib/supabase.ts` - 公開データ読み取り用（RLS適用）
- `lib/supabase/server.ts` - サーバーコンポーネント用（ユーザーセッション付き）
- `lib/supabase/admin.ts` - 管理操作用（RLSバイパス、Server Actions専用）

## コーディング規約

- コミットはgit-cz形式（prefix以外は日本語、絵文字なし）
- 極めて高頻度のコミットを行う
- 不要なコメントは避け、Whyを示す場合のみコメントを使用
- 既存コードの形式に従う
