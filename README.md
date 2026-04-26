# Prompt Engineering Tool

チームでプロンプトエンジニアリングを効率的に行うための Web ベースの管理ツールです。

## これは何？

LLM（大規模言語モデル）に与えるプロンプトの**作成・テスト・バージョン管理**をチーム単位で行うためのツールです。

プロンプトの品質はLLMの出力品質に直結します。しかし、プロンプトの改善作業は属人化しやすく、「誰がいつどんな変更をしたか」「どのバージョンが最も効果的だったか」が把握しにくいという課題があります。本ツールはこれらの課題を解決します。

## 主な機能

### プロンプト一覧 (`/prompts`)
- 登録されたプロンプトをカード形式で一覧表示
- プロンプト名・説明・使用モデル・バージョン・ステータスを一目で確認
- 検索・ステータスフィルター（公開中 / 下書き / アーカイブ）によるプロンプトの絞り込み
- 各プロンプトから「検証する」ボタンで検証ページへ直接遷移

### プロンプト検証 (`/prompts/verify`)
- プロンプトの作成・編集
- `{{変数名}}` 形式のプレースホルダーによるテンプレート化
- 変数の自動検出・可視化

### 適用テキスト入力 & 実行
- プロンプトを適用する対象テキストの入力
- ワンクリックでの実行とリアルタイムな結果表示
- トークン使用量の表示

### バージョン履歴管理
- プロンプトの変更履歴を時系列で管理
- 過去バージョンの内容確認とワンクリック復元
- 誰がいつ変更したかの記録

### LLMモデル選択
- Groq・OpenAI の計4モデルに対応
- モデルごとの特性（コンテキスト長・用途）を確認しながら選択
- モデルを切り替えてプロンプトの出力品質を比較

| モデル名 | プロバイダー | 特徴 |
|---|---|---|
| GPT-OSS 20B | Groq | 高速軽量オープンウェイトモデル |
| GPT-OSS 120B | Groq | 高性能オープンウェイトモデル |
| GPT-5.4 Mini | OpenAI | レイテンシ・コスト重視の高速処理 |
| GPT-5.4 Nano | OpenAI | 大量処理・単純タスク・低コスト最優先 |

### プロンプト一括検証 (`/prompts/batch-verify`)
- 複数の対象テキストに対してプロンプトを一括実行
- 結果を一覧表示し、CSV ダウンロード可能
- 保存済みテキストセットの読み込みに対応

### 適用テキストJSON作成 (`/prompts/build-json`)
- 対象テキストセットを JSON 形式で作成・編集
- 一括検証やプロンプト検証で使用するテキストの事前準備

### 保存済みテキスト一覧 (`/prompts/target-texts`)
- 作成した対象テキストセットの一覧表示・管理
- テキストセットの編集・削除

### ユーザ管理 (`/users`) ※管理者のみ
- 登録済みユーザーの一覧表示
- ユーザー名・メールアドレスによる検索
- ロール・登録状態の確認

### チーム管理 (`/teams`) ※管理者のみ
- チームの作成・編集・削除
- チームへのパスワード設定

### チーム向け機能
- Microsoft Entra ID によるシングルサインオン
- サインアップ → 登録完了フロー（未登録ユーザーはダッシュボードにアクセス不可）
- ロールベースのアクセス管理（admin / member / viewer）
- 管理者以外はユーザ管理・チーム管理ページにアクセス不可（サイドバーにも非表示）
- サイドバー + ヘッダーによるSaaS型の操作画面

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16.2.4 (App Router) |
| 言語 | TypeScript 5 |
| UIライブラリ | MUI (Material UI) v9 |
| スタイリング | Emotion (CSS-in-JS) |
| 認証 | NextAuth.js v5 (beta) + Microsoft Entra ID |
| ORM | Prisma v7 |
| データベース | PostgreSQL (Azure Cosmos DB for PostgreSQL) |
| LLM | OpenAI API / Groq API |
| デプロイ | Azure Web Apps (GitHub Actions による自動デプロイ) |

## セットアップ

### 前提条件

- Node.js 20+
- PostgreSQL データベース
- Microsoft Entra ID アプリ登録（[手順](#entra-id-アプリ登録)を参照）

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を参考に `.env` ファイルを作成し、値を設定します。

```bash
cp .env.local.example .env
```

```env
AZURE_AD_CLIENT_ID=<クライアントID>
AZURE_AD_CLIENT_SECRET=<クライアントシークレット値（シークレットIDではない）>
AZURE_AD_TENANT_ID=<テナントID>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<テナントID>/v2.0
AUTH_SECRET=<npx auth secret で生成>
AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/prompt_tool
# LLM API Keys
OPENAI_API_KEY=<OpenAI APIキー>
GROQ_API_KEY=<Groq APIキー>
```

### 3. Prisma クライアント生成 & DB マイグレーション

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. （任意）シードデータの投入

```bash
npx prisma db seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセスするとログイン画面が表示されます。

#### 初回利用（サインアップ）
1. `/signup` にアクセス → 「Microsoft アカウントで登録」
2. Microsoft 認証後、`/signup/complete` で表示名を入力 → 「登録を完了」
3. 自動的に再ログインされ `/prompts` にリダイレクト

#### 2回目以降（ログイン）
- `/login` → 「Microsoft アカウントでログイン」 → `/prompts`
- 未登録ユーザーは自動的に `/signup/complete` にリダイレクトされます

## Entra ID アプリ登録

1. [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **アプリの登録** → **新規登録**
2. リダイレクト URI に以下を設定（種類: Web）:
   - 開発: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - 本番: `https://<your-domain>/api/auth/callback/microsoft-entra-id`
3. **証明書とシークレット** → クライアントシークレットを作成
4. 取得した **アプリケーション (クライアント) ID**、**ディレクトリ (テナント) ID**、**シークレット値** を `.env.local` に設定

## プロジェクト構成

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── auth/               # NextAuth API ルート + 登録API
│   │   ├── execute/            # プロンプト実行API
│   │   ├── prompts/            # プロンプトCRUD・バージョン管理API
│   │   ├── target-text-sets/   # 対象テキストセットAPI
│   │   ├── teams/              # チーム管理API
│   │   └── users/              # ユーザ管理API
│   ├── (auth)/
│   │   ├── login/              # ログイン画面
│   │   └── signup/             # サインアップ・登録完了画面
│   └── (dashboard)/
│       ├── prompts/            # プロンプト一覧
│       │   ├── batch-verify/   # 一括検証
│       │   ├── build-json/     # 適用テキストJSON作成
│       │   ├── target-texts/   # 保存済みテキスト一覧
│       │   └── verify/         # プロンプト検証
│       ├── teams/              # チーム管理 (admin のみ)
│       └── users/              # ユーザ管理 (admin のみ)
├── components/
│   ├── layout/                 # ヘッダー・サイドバー
│   ├── prompts/                # プロンプト関連コンポーネント
│   └── providers/              # ThemeRegistry・SessionProvider
├── constants/                  # LLMモデル定義
├── generated/prisma/           # Prisma 自動生成クライアント
├── hooks/                      # カスタムフック
├── lib/                        # auth.config.ts・auth.ts・prisma.ts・llm.ts
├── theme/                      # MUIテーマ設定
└── types/                      # TypeScript型定義
prisma/
└── schema.prisma               # DB スキーマ定義
```
