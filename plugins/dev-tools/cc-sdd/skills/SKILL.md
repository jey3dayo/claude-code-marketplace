---
name: cc-sdd
description: Claude Code Spec-Driven Development (cc-sdd) skill. Kiro形式のスペック駆動開発を実現する。Trigger when users mention "kiro", "spec-driven", "specification", "steering", kiro commands (/kiro:spec-init, /kiro:spec-design), "cc-sdd", or "スペック駆動開発". 新機能開発で仕様駆動アプローチが適切な場合に最適。プロジェクトガイダンス（Steering）、仕様作成（Specification）、進捗管理のワークフローを提供する。
---

# Claude Code Spec-Driven Development (cc-sdd)

## 概要

cc-sdd（Claude Code Spec-Driven Development）は、Kiro形式のスペック駆動開発を実現するスキルです。開発を始める前に仕様を定義し、段階的に承認を経ながら実装を進めることで、品質の高い開発プロセスを実現します。

### プロジェクト構成

- **Steering** (`.kiro/steering/`) - プロジェクト全体のガイドとコンテキスト
- **Specs** (`.kiro/specs/`) - 個別機能の開発プロセスを形式化
- **Commands** (`.claude/commands/kiro/`) - ワークフローを実行するコマンド群

### Steering vs Specification

**Steering** - AIをプロジェクト全体のルールとコンテキストでガイド
**Specs** - 個別機能の開発プロセスを形式化

## いつ使うか

以下のような場合にこのスキルを使用する：

- ユーザーが cc-sdd やスペック駆動開発のコマンドを要求した時
- `/kiro:` で始まるコマンドの実行時
- 新機能開発で仕様駆動アプローチが適切な場合
- プロジェクトのガイドラインや技術基準を整備したい時
- 要件定義から設計、実装までの一貫したワークフローが必要な時

## スキルの動作モード

このスキルは2つのモードで動作する：

### モード1: インテリジェント・ルーター（推奨）

ユーザーがcc-sddスキルを呼び出すと、以下を自動実行：

1. **プロジェクト状態の分析**
   - `.kiro/` ディレクトリの存在確認
   - 既存のspec一覧を確認
   - 最新のspec状態を判定

2. **適切なコマンドの自動選択**
   - ユーザーの意図を解析
   - プロジェクト状態に基づいて次のアクションを判定
   - 対応する `/kiro:` コマンドを実行

3. **ガイダンス提供**
   - 実行するコマンドとその理由を説明
   - 次のステップを提案

**使用例**：

```
User: "新機能の仕様を作りたい"
→ cc-sddが `/kiro:spec-init` を実行

User: "既存のauth-serviceの設計を見直したい"
→ cc-sddが `.kiro/specs/auth-service` を確認し、
   `/kiro:spec-design auth-service` を実行
```

### モード2: 直接コマンド実行（従来通り）

ユーザーが `/kiro:` コマンドを直接実行する場合：

- 各コマンドは独立して動作
- cc-sddスキルは参照されない
- 既存のワークフローと完全互換

## 基本ワークフロー

cc-sdd は 3つのフェーズで構成される：

### Phase 0: Steering（オプショナル）

プロジェクト全体のガイダンスを作成・更新

- `/kiro:steering` - ステアリングドキュメントの作成/更新
- `/kiro:steering-custom` - カスタムステアリングの作成

新機能や小規模な追加の場合はスキップ可能。spec-init から直接開始できる。

### Phase 1: Specification Creation

仕様を段階的に作成し、各段階で承認を得る

1. `/kiro:spec-init [詳細な説明]` - 仕様の初期化
2. `/kiro:spec-requirements [feature]` - 要件ドキュメント生成
3. `/kiro:spec-design [feature]` - 技術設計の作成（要件承認後）
4. `/kiro:spec-tasks [feature]` - 実装タスク生成（設計承認後）

### Phase 2: Progress Tracking

進捗状況の確認

- `/kiro:spec-status [feature]` - 現在の進捗とフェーズを確認

## 開発ルール

1. **Steeringの活用**: 大規模開発前に `/kiro:steering` を実行（新機能の場合はオプショナル）
2. **3段階承認ワークフロー**: Requirements → Design → Tasks → Implementation
3. **承認必須**: 各フェーズで人間のレビューが必要（対話的プロンプトまたは手動）
4. **フェーズスキップ禁止**: Design には承認済み Requirements が必要、Tasks には承認済み Design が必要
5. **タスクステータス更新**: 作業時にタスクを完了としてマーク
6. **Steeringの最新化**: 重要な変更後に `/kiro:steering` を実行
7. **スペック準拠確認**: `/kiro:spec-status` で整合性を検証

## 主要コマンド

### Steering管理

- `/kiro:steering` - コアステアリングファイルの管理
- `/kiro:steering-custom` - 専門的なコンテキストのカスタムステアリング作成

### Specification管理

- `/kiro:spec-init [description]` - 新規仕様の初期化
- `/kiro:spec-requirements [feature]` - 要件定義の生成
- `/kiro:spec-design [feature] [-y]` - 技術設計の作成（-y で要件自動承認）
- `/kiro:spec-tasks [feature] [-y]` - 実装タスクの生成（-y で自動承認）
- `/kiro:spec-status [feature]` - 進捗状況の確認

### 検証ツール

- `/kiro:validate-gap [feature]` - 実装ギャップの分析
- `/kiro:validate-design [feature]` - 設計の検証

## 詳細情報

より詳細な情報は、以下のリファレンスドキュメントを参照：

- **@workflow.md** - 完全なワークフロー詳細とフェーズ説明
- **@steering-system.md** - Steeringシステムの詳細
- **@specification-system.md** - Specificationシステムの詳細
- **@commands-reference.md** - 全コマンドのリファレンス
- **@development-rules.md** - 開発ルールの詳細説明
- **@ears-format.md** - EARS形式の要件定義ガイド

## インテリジェント・ルーター実装

このスキルが呼び出された時の動作：

### Step 1: ユーザー意図の分析

ユーザーの発言から意図を判定：

```
"新機能" / "仕様を作る" / "spec init"
  → 仕様初期化が必要 → `/kiro:spec-init`

"要件" / "requirements" / "要求を定義"
  → 要件定義フェーズ → `/kiro:spec-requirements`

"設計" / "design" / "アーキテクチャ"
  → 設計フェーズ → `/kiro:spec-design`

"タスク" / "実装計画" / "todo"
  → タスク生成フェーズ → `/kiro:spec-tasks`

"実装" / "コーディング" / "開発開始"
  → 実装フェーズ → `/kiro:spec-impl`

"進捗" / "状態確認" / "どこまで"
  → 進捗確認 → `/kiro:spec-status`

"ギャップ" / "不足" / "未実装"
  → ギャップ分析 → `/kiro:validate-gap`

"設計レビュー" / "設計検証"
  → 設計検証 → `/kiro:validate-design`

"プロジェクト設定" / "steering" / "ガイドライン"
  → Steering管理 → `/kiro:steering`
```

### Step 2: プロジェクト状態の確認

`.kiro/` ディレクトリの内容を調査：

1. **Steering存在確認**
   - `.kiro/steering/product.md` の有無
   - 必要に応じて作成を提案

2. **既存Spec確認**
   - `.kiro/specs/` 内のディレクトリ一覧
   - 各specの `spec.json` を読んで状態を把握

3. **次のアクション判定**
   - 現在のフェーズと承認状態を確認
   - 次に実行可能なコマンドを特定

### Step 3: コマンド実行とガイダンス

1. **実行前の説明**

   ```
   「[feature]の設計フェーズに進みます。
   要件が承認済みであることを確認しました。
   `/kiro:spec-design [feature]` を実行します。」
   ```

2. **SlashCommandツールでコマンド実行**
   - 適切な引数を渡して `/kiro:` コマンドを呼び出し

3. **実行後のガイダンス**

   ```
   「設計ドキュメントが生成されました。
   次のステップ：
   1. design.mdをレビュー
   2. 承認後、`/kiro:spec-tasks [feature]` でタスク生成」
   ```

### Step 4: エラーハンドリング

状態エラーの場合は適切なメッセージを表示：

- 要件未承認で設計を試みた場合
  → 「要件の承認が必要です。`/kiro:spec-requirements [feature]` を実行してください」

- 存在しないspecを参照した場合
  → 「[feature]が見つかりません。`/kiro:spec-init` で作成しますか？」

## ガイドライン

開発時は以下を考慮する：

- **英語で思考、日本語で回答**: 思考プロセスは英語で、生成する回答は日本語で行う
- **段階的アプローチ**: 各フェーズを完了してから次に進む
- **人間のレビュー**: 自動化できても、重要な決定には人間の承認を求める
- **ドキュメントファースト**: コードを書く前に仕様を明確にする
- **インテリジェント・ルーター優先**: ユーザーがcc-sddを呼んだ場合、まず状態分析と適切なコマンド選択を行う
