# 📔 デコ手帳アプリ：実装・運用・収益化 究極チェックリスト

## 0. 共通・アーキテクチャ（壊さないための掟）
- [ ] 環境分離（dev / stg / prod）のCDK定義
- [ ] Secrets管理（AWS Secrets Manager / SSM）の徹底
- [ ] 全ログの構造化（JSON）および相関ID（request_id）の付与
- [-----] 破壊的変更の運用ルール（Expand/Contract戦略）のREADME記載

## A. フロントエンド（Frontend: Next.js + Vercel）
### A1. 型安全・OpenAPI連携
- [ok] `openapi.json` からの自動型生成（openapi-typescript）
- [ok] CIでの型不整合検知（型ズレ時にビルドを落とす）
- [backend_only] 破壊的変更が入った際のPR自動検知

### A2. 非同期ジョブUI/UX
- [ ] 画像処理（背景切り抜き）のプログレス表示（PENDING/RUNNING/SUCCESS）
- [ ] AI日記生成中のスケルトンスクリーン・キャプション出し分け
- [ ] ジョブ失敗時の再試行（Retry）UI

### A3. 課金（Stripe）
- [ ] Checkout Session開始（サブスク/単品）
- [ ] カスタマーポータル連携（解約・カード変更）
- [ ] Entitlement（権利）に応じた機能ロック（プレミアム限定テンプレート等）

## B. バックエンド（Backend: Django + App Runner）
### B1. OpenAPI & API設計
- [ok] `drf-spectacular` によるスキーマ出力の安定化
- [backend_only] breaking change（破壊的変更）検知CIの実装
- [ ] 冪等性キー（Idempotency-Key）によるリクエスト保証

### B2. 非同期ワーカー処理（SQS + ECS/Lambda）
- [ ] 背景切り抜き：ECS Fargate Spotでのモデルロード・高速演算
- [ ] AI日記生成：SQS (AI Queue) → API待ち（Lambda/Worker）
- [ ] DLQ（デッドレターキュー）による失敗ジョブの隔離と監視


### B3. Stripe Webhook（金銭の安全性）
- [ ] 署名検証（construct_event）の実装
- [ ] `stripe_event_id` によるDBレベルの冪等性処理（UNIQUE制約）
- [ ] 決済状態遷移（active/past_due/canceled）の完全同期

## C. インフラ・運用（Infrastructure: AWS CDK）
### C1. CI/CD (GitHub Actions)
- [ok] OIDCによる鍵なしデプロイ
- [ ] PR単位の静的解析（lint / test）



### C2. 非同期・ストレージ基盤
- [ ] S3ライフサイクルルール（中間生成物の自動削除）
- [ ] CloudFront + 署名URLによる高速・安全配信

### C3. 監視・アラート（1000万超えの差）
- [ ] SQS滞留時間（AgeOfOldestMessage）のアラート
- [ ] DLQにメッセージが入った際のSlack通知
- [ ] ジョブ成功率・APIレスポンスp95の可視化

## D. マーケティング・収益化（Business Logic）
- [ ] StickerLibrary：所有するステッカーを「資産」として見せるUI
- [ ] シェア用画像書き出し機能（SNS集客導線）
- [ ] AI生成の回数制限（Free/Premiumの切り替え）
- [ ] 「デコ再現」機能（他人のデコからステッカー購入ページへの導線）