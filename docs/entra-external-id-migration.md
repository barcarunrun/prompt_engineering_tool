# External Entra ID（Microsoft Entra External ID / CIAM）移行手順

## 概要

現在のコードはすでに `next-auth` の `MicrosoftEntraID` プロバイダーを使用していますが、これは**組織テナント（Workforce）向け**です。  
**External Entra ID** は外部ユーザー（顧客・パートナー等）向けの CIAM（Customer Identity and Access Management）専用テナントであり、issuer URL や設定が異なります。

---

## 1. Azure Portal での作業

### 1-1. External Entra ID テナントの作成

1. [Azure Portal](https://portal.azure.com) にサインイン
2. 「Microsoft Entra ID」→「概要」→「テナントの管理」→「作成」
3. テナントの種類で **「顧客（External）」** を選択
4. テナント名・初期ドメイン名・リージョンを設定して作成
5. 作成後、新しいテナントに切り替える

### 1-2. アプリの登録

1. 「アプリの登録」→「新規登録」
2. 名前を入力（例: `prompt-engineering-tool`）
3. サポートされるアカウントの種類：**「この組織ディレクトリのみ（シングルテナント）」**  
   ※ External Entra ID テナント内に閉じた設定
4. リダイレクト URI を追加（種類: Web）：
   - 開発環境: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - 本番環境: `https://<your-domain>/api/auth/callback/microsoft-entra-id`
5. 登録後、**アプリケーション（クライアント）ID** をコピー
6. 「証明書とシークレット」→「新しいクライアントシークレット」を作成し、値をコピー

### 1-3. API アクセス許可の設定

1. 「API のアクセス許可」→「アクセス許可の追加」→「Microsoft Graph」
2. 「委任されたアクセス許可」から以下を追加：
   - `openid`
   - `profile`
   - `email`
   - `offline_access`
3. 「管理者の同意を与える」をクリック

### 1-4. ユーザーフロー（サインアップ・サインイン）の設定

1. 「ユーザーフロー」→「新しいユーザーフロー」
2. 「サインアップとサインイン（推奨）」を選択
3. ID プロバイダーとして **「メール + パスワード」** または **「メール ワンタイムパスコード」** を選択
4. 収集する属性として `表示名`・`メールアドレス` を選択
5. フロー名（例: `B2C_1_signupsignin`）を確認
6. 「作成」

### 1-5. issuer URL の確認

External Entra ID の issuer URL は以下の形式：

```
https://<tenant-subdomain>.ciamlogin.com/<tenant-id>/v2.0
```

- `<tenant-subdomain>`: テナント作成時に設定した初期ドメインのサブドメイン部分
- `<tenant-id>`: テナントの「概要」画面に表示されるディレクトリ（テナント）ID

---

## 2. 環境変数の更新

`.env.local`（または本番環境の設定）を以下のように更新します。

```env
# 現在の設定（組織テナント）→ 新テナントの値に置き換え
AZURE_AD_CLIENT_ID=<新テナントのクライアントID>
AZURE_AD_CLIENT_SECRET=<新テナントのクライアントシークレット>
AZURE_AD_TENANT_ID=<新テナントのテナントID>

# External Entra ID 用の issuer URL（新規追加）
AZURE_AD_ISSUER=https://<tenant-subdomain>.ciamlogin.com/<tenant-id>/v2.0
```

---

## 3. コードの変更

### 3-1. `src/lib/auth.config.ts` の変更

`MicrosoftEntraID` プロバイダーに `issuer` オプションを追加します。

**変更前:**
```typescript
MicrosoftEntraID({
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  tenantId: process.env.AZURE_AD_TENANT_ID!,
}),
```

**変更後:**
```typescript
MicrosoftEntraID({
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  tenantId: process.env.AZURE_AD_TENANT_ID!,
  issuer: process.env.AZURE_AD_ISSUER, // External Entra ID 用
}),
```

> **補足**: `tenantId` のみを指定した場合、next-auth は `https://login.microsoftonline.com/<tenantId>/v2.0` を issuer として使用します。External Entra ID テナントの issuer は `ciamlogin.com` ドメインになるため、明示的に `issuer` を指定する必要があります。

### 3-2. `src/app/(auth)/login/page.tsx` の確認

現在のログインページはチームIDを入力してから Microsoft でサインインする設計になっています。  
External Entra ID ではサインアップ自体をユーザーフロー側が担うため、以下の点を検討してください。

**選択肢A（現状維持）**: チームIDを `sessionStorage` に保存してサインイン → `/login/verify` でチームに割り当て  
→ 追加のコード変更は不要。現在の `src/app/(auth)/login/verify/page.tsx` のロジックをそのまま利用可能。

**選択肢B（サインアップフロー分離）**: 初回ユーザーは External Entra ID のユーザーフロー画面でメール登録 → サインイン後にチーム選択画面に誘導  
→ `/login/verify` でユーザーの `isRegistered` フラグを確認し、未登録の場合は `/signup/complete` にリダイレクトする処理が必要。

---

## 4. 既存ユーザーの移行対応

現在 DB の `Account` テーブルには `provider = 'microsoft-entra-id'` で旧テナントの `providerAccountId` が保存されています。  
テナントを変更すると **既存レコードは無効** になります。

### 移行方法

1. **再ログイン促進**: 既存ユーザーに新テナントでの再ログインを依頼し、新しい `Account` レコードを自動生成させる
2. **旧レコードの削除（任意）**: 移行完了後、旧 `providerAccountId` の `Account` レコードをクリーンアップ

```sql
-- 旧テナントの Account レコードを削除する場合（移行完了後）
DELETE FROM "Account" WHERE provider = 'microsoft-entra-id';
```

> ⚠️ ユーザーの `User` レコード自体（メールアドレスベース）は維持されるため、データは失われません。`auth.ts` の `signIn` コールバックの `upsert` 処理により、再ログイン時に自動的に紐付けされます。

---

## 5. 動作確認チェックリスト

- [ ] Azure Portal で External Entra ID テナントを作成済み
- [ ] アプリ登録・クライアントシークレット発行済み
- [ ] リダイレクト URI を登録済み（開発・本番）
- [ ] ユーザーフロー（サインアップ・サインイン）を作成済み
- [ ] `.env.local` の環境変数を更新済み
- [ ] `auth.config.ts` の `issuer` オプションを追加済み
- [ ] `npm run dev` でローカル動作確認
  - [ ] サインインボタン押下で External Entra ID のサインイン画面にリダイレクトされる
  - [ ] サインアップ後にアプリに戻り、DB に `User` レコードが作成される
  - [ ] `/prompts` など保護ルートに未認証でアクセスした場合、ログイン画面にリダイレクトされる
- [ ] 本番環境の環境変数を更新済み

---

## 6. 参考リンク

- [Microsoft Entra External ID ドキュメント](https://learn.microsoft.com/ja-jp/entra/external-id/)
- [クイックスタート: External Entra ID テナントの作成](https://learn.microsoft.com/ja-jp/entra/external-id/customers/quickstart-tenant-setup)
- [next-auth MicrosoftEntraID プロバイダー](https://authjs.dev/reference/core/providers/microsoft-entra-id)
- [next-auth v5 移行ガイド](https://authjs.dev/getting-started/migrating-to-v5)

---

## 7. 新認証フロー対応（Team 登録必須）

本プロジェクトでは、認証を以下の 2 段階にしています。

1. **Microsoft Entra External ID で本人認証**
2. **アプリ側で Team ID / Team Password を照合**

### 7-1. 画面遷移

- **新規ユーザー（チーム未作成）**
  - `/signup`（`Team Name` / `Team ID` / `Team Password` 入力）
  - Microsoft サインイン
  - `/signup/complete`（表示名入力→登録確定）
  - `/prompts`

- **既存ユーザー（チーム登録済み）**
  - `/login`（`Team ID` / `Team Password` 入力）
  - Microsoft サインイン
  - `/login/verify`（Team 認証）
  - `/prompts`

### 7-2. DB 前提

`Team` モデルに以下が必要です。

- `teamLoginId`（一意）
- `teamPasswordHash`（ハッシュ）

未適用の場合は先にマイグレーションを実行します。

```bash
npx prisma migrate deploy
npx prisma generate
```

### 7-3. API の役割

- `POST /api/auth/register`
  - 新規チーム作成
  - `teamPassword` をハッシュ化して保存
  - ユーザーへ `teamId` を紐付け、`isRegistered=true`

- `POST /api/auth/verify-team`
  - 既存ユーザーの `teamLoginId` / `teamPassword` を照合
  - 成功時に `isRegistered=true`

### 7-4. 実運用時の注意

- `/signup/complete` は `sessionStorage` 前提のため、**直接アクセス不可**
- `middleware`（`authorized`）では、未ログイン遮断を中心に管理する
- 登録状態（`isRegistered` / `teamId`）による分岐は画面側ロジックで制御する

### 7-5. 既存ユーザー移行ポリシー

- 方針: **初回再ログイン時に再登録必須（Option A）**
- 事前にユーザーへ以下を告知
  - 新しい Team ID / Team Password 入力が必要
  - Microsoft サインイン後に Team 認証画面を経由する

### 7-6. 最終チェックリスト（新フロー）

- [ ] `/signup` から登録し、`Team.teamLoginId` と `teamPasswordHash` が保存される
- [ ] `/login` → Microsoft 認証 → `/login/verify` → `/prompts` へ遷移できる
- [ ] 誤った Team Password で `/api/auth/verify-team` が 403 を返す
- [ ] 未認証で `/prompts` にアクセスすると `/login` へリダイレクトされる
- [ ] `ciamlogin.com` ドメインの認証画面へ遷移する
