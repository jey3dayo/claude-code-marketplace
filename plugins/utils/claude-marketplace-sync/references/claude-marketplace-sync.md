# Claude Marketplace Sync 詳細リファレンス

# 🤖 Claude Code Marketplace Sync

**最終更新**: 2025-12-23
**対象**: 開発者
**タグ**: `category/configuration`, `tool/claude-code`, `layer/support`, `environment/macos`, `audience/developer`

Claude Code marketplace からプラグインとスキルを管理するための自動同期システムです。`~/.claude/mise.toml` で独立して管理され、TOML 設定ファイルで宣言的にインストール対象を管理します。バージョン管理は git commit SHA ベースで行われ、更新チェック機能を提供します。

## 🤖 Claude Rules

このドキュメントの凝縮版ルールは [`docs/claude-code.md`](../../../docs/claude-code.md) で管理されています。

- **目的**: Claude AI が常に参照する簡潔なルール
- **適用範囲**: YAML frontmatter `paths:` で定義
- **関係**: 本ドキュメントが詳細リファレンス（SST）、Claude ルールが強制版

## クイックスタート

### 週次メンテナンス実行

```bash
# すべての更新（Claude marketplace 含む）
mise run update

# Claude marketplace のみ更新
mise run update:claude-marketplace
```

### プラグイン追加

1. `~/.claude/config/claude-marketplace.toml` を編集
2. インストールしたいプラグインを追加
3. `mise run update:claude-marketplace` を実行

```toml
[plugins.anthropic-agent-skills]
install = [
    "document-skills",
    "example-skills",
    "new-skill-name"  # 追加
]
```

## コマンドリファレンス

`~/.claude/bin/claude-marketplace-sync.sh` は以下のコマンドをサポートします。

### sync（デフォルト）

marketplace を更新し、設定ファイルからプラグインをインストールします。

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh sync
# または
mise run update:claude-marketplace
```

**動作**:

1. バックアップ作成（`~/.local/state/claude-plugins-backup/TIMESTAMP/`）
2. marketplace リポジトリを git pull で更新
3. 設定ファイルからプラグインをインストール
4. エラー時は自動ロールバック

### update

marketplace リポジトリのみを更新（プラグインインストールなし）。

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh update
```

### install

設定ファイルからプラグインをインストール（marketplace 更新なし）。

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh install
```

**動作**:

1. バックアップ作成
2. `~/.claude/config/claude-marketplace.toml` から設定を読み込み
3. 各プラグインをインストール（既にインストール済みの場合はスキップ）
4. エラー時は自動ロールバック

**Note**: べき等性（idempotent）が保証されており、同じコマンドを複数回実行しても安全です。

### status

インストール済みプラグインの一覧を表示。

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh status
```

**出力例**:

```
========================================
  Claude Marketplace Sync
========================================

[INFO] Installed plugins status

[INFO] Installed plugins:
  ✓ document-skills@anthropic-agent-skills
  ✓ example-skills@anthropic-agent-skills
  ✓ frontend-design@claude-plugins-official
```

**オプション**:

- `--check-updates`: 利用可能な更新をチェック

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh status --check-updates
```

**更新チェック出力例**:

```
[INFO] Checking for updates...

  ↑ document-skills: 6a0e928311b8 → 69c0b1a06741
  ↑ example-skills: 6a0e928311b8 → 69c0b1a06741

[INFO] Checked 9 plugin(s)
[WARN] 2 update(s) available

[INFO] To update, run:
  claude-marketplace-sync.sh sync
```

**動作**:

- 各プラグインのインストール時の git commit SHA と、marketplace の最新 commit SHA を比較
- 更新が必要なプラグインを一覧表示
- `sync` コマンドで更新を実行可能

### list

利用可能な marketplace とプラグイン数を表示。

```bash
sh ~/.claude/bin/claude-marketplace-sync.sh list
```

**出力例**:

```
========================================
  Claude Marketplace Sync
========================================

[INFO] Available marketplaces

  ● anthropic-agent-skills
    Plugins available: 5
  ● claude-code-plugins
    Plugins available: 12
  ● claude-plugins-official
    Plugins available: 8
```

## 設定ファイル

### ~/.claude/config/claude-marketplace.toml

プラグインのインストール対象とオプションを定義します。

```toml
version = "1.0.0"

# ========================================
# Marketplaces
# ========================================
[marketplaces]
enabled = [
    "anthropic-agent-skills",
    "claude-code-plugins",
    "claude-plugins-official"
]

# ========================================
# Plugins from anthropic-agent-skills
# ========================================
[plugins.anthropic-agent-skills]
install = [
    "document-skills",    # Excel, Word, PowerPoint, PDF editing
    "example-skills"      # Various example skills for reference
]
auto_update = true

# ========================================
# Plugins from claude-code-plugins
# ========================================
[plugins.claude-code-plugins]
install = [
    "frontend-design",    # UI/UX design assistance
    # "code-review",      # Automated code review (uncomment to enable)
    # "feature-dev",      # Feature development workflow (uncomment to enable)
]
auto_update = true

# ========================================
# Plugins from claude-plugins-official
# ========================================
[plugins.claude-plugins-official]
install = [
    # LSP Servers (Language Support)
    # "typescript-lsp",   # TypeScript language server (uncomment to enable)
    # "python-lsp",       # Python language server (uncomment to enable)

    # MCP Tools (Model Context Protocol)
    # "serena",           # Semantic code analysis (uncomment to enable)
    # "context7",         # Library context tool (uncomment to enable)

    # Integrations
    # "linear",           # Linear issue tracker (uncomment to enable)
    # "github",           # GitHub integration (uncomment to enable)
]
# IMPORTANT: LSP servers and MCP tools should be updated carefully
# Set to false to require manual updates
auto_update = false

# ========================================
# Options
# ========================================
[options]
# Create backup before any update/install operation
backup_before_update = true

# Backup directory location (supports ~ expansion)
backup_dir = "~/.local/state/claude-plugins-backup"

# Skip plugins already installed (idempotent behavior)
skip_installed = true
```

### 設定項目の説明

#### [marketplaces]

- `enabled`: 管理する marketplace リポジトリのリスト
- デフォルトで 3 つの公式 marketplace を有効化

#### [plugins.<marketplace-name>]

- `install`: インストールするプラグイン名のリスト
- `auto_update`: 自動更新の有効/無効（LSP サーバーは `false` 推奨）

#### [options]

- `backup_before_update`: 更新前に自動バックアップ（推奨: `true`）
- `backup_dir`: バックアップの保存先ディレクトリ
- `skip_installed`: 既にインストール済みのプラグインをスキップ

## ディレクトリ構造

```text
~/.claude/                                  # Git リポジトリとして管理
├── bin/
│   └── claude-marketplace-sync.sh          # メインスクリプト
├── config/
│   └── claude-marketplace.toml             # 設定ファイル（Git 管理）
├── docs/
│   └── claude-code.md                      # このドキュメント
├── mise.toml                               # mise タスク定義
└── plugins/                                # Claude Code プラグインルート
    ├── installed_plugins.json              # インストール済みプラグイン記録
    ├── known_marketplaces.json             # 既知の marketplace 情報
    └── marketplaces/                       # marketplace リポジトリ
        ├── anthropic-agent-skills/         # 公式スキルコレクション
        │   ├── .claude-plugin/
        │   │   └── marketplace.json        # Marketplace メタデータ
        │   ├── document-skills/            # 各プラグイン/スキル
        │   ├── example-skills/
        │   └── ...
        └── claude-plugins-official/        # 公式統合プラグイン

~/.local/state/claude-plugins-backup/       # バックアップディレクトリ
└── 20251222123456/                         # タイムスタンプ付きバックアップ
    └── plugins/                            # バックアップされたプラグイン
        ├── installed_plugins.json
        ├── known_marketplaces.json
        └── marketplaces/
```

## 週次メンテナンスワークフロー

Claude marketplace 同期は `~/.claude/mise.toml` で管理されています。

```bash
# Claude marketplace のみ更新
cd ~/.claude && mise run update:claude-marketplace

# または dotfiles 全体の週次メンテナンスに含める場合
cd ~/src/github.com/jey3dayo/dotfiles && mise run update
```

### ~/.claude/mise.toml の設定

```toml
[tasks."update:claude-marketplace"]
description = "Claude Code marketplace を更新（プラグイン/スキル同期）"
run = "sh ~/.claude/bin/claude-marketplace-sync.sh sync"
```

### dotfiles の週次メンテナンス

dotfiles の `mise run update` は以下を実行します（Claude marketplace は含まれません）:

1. **update:submodules** - Git サブモジュールを最新に更新
2. **update:brew** - Homebrew パッケージ更新（formula のみ）
3. **update:external-repos** - 外部 Git リポジトリ更新

Claude marketplace 同期は独立して `~/.claude/` ディレクトリで管理することで、dotfiles とは別のライフサイクルで更新できます。

## トラブルシューティング

### 前提条件エラー

**症状**: `Claude CLI is not installed` エラー

**対処**:

```bash
# Claude Code がインストールされているか確認
which claude

# インストールされていない場合
# Visit: https://claude.ai/download
```

---

**症状**: `No TOML/JSON parser found` エラー

**対処**:

```bash
# yq をインストール
brew install yq

# または jq でも可
brew install jq
```

### Marketplace 更新エラー

**症状**: `Failed to update marketplace` エラー

**対処**:

```bash
# Git リポジトリの状態を確認
cd ~/.claude/plugins/marketplaces/<marketplace-name>
git status

# ローカル変更がある場合はリセット
git reset --hard HEAD
git clean -fd

# 再度更新を実行
sh ~/.claude/bin/claude-marketplace-sync.sh update
```

### バックアップからの復元

自動ロールバックに失敗した場合、手動で復元できます。

```bash
# 最新のバックアップを確認
ls -lt ~/.local/state/claude-plugins-backup/

# 手動復元（TIMESTAMP は実際のタイムスタンプに置換）
rm -rf ~/.claude/plugins
cp -R ~/.local/state/claude-plugins-backup/TIMESTAMP/plugins ~/.claude/
```

### 設定ファイルエラー

**症状**: TOML パースエラー

**対処**:

```bash
# 設定ファイルの構文をチェック
yq eval ~/.claude/config/claude-marketplace.toml

# エラー箇所を修正後、再実行
mise run update:claude-marketplace
```

### プラグインインストールエラー（Phase 5 実装後）

**症状**: 特定のプラグインがインストールできない

**対処**:

```bash
# プラグインが marketplace に存在するか確認
sh ~/.claude/bin/claude-marketplace-sync.sh list

# 手動でインストールしてエラー詳細を確認
claude plugin install <plugin-name>@<marketplace-name>

# 既にインストール済みの場合はアンインストール後に再試行
claude plugin uninstall <plugin-name>
```

## 実装ステータス

### Phase 1: ✅ 完了

- スクリプト基盤（色付きログ、ヘルプ）
- 前提条件チェック
- バックアップ/復元機能

### Phase 2: ✅ 完了

- Marketplace 更新（git pull）
- 利用可能な marketplace 一覧表示

### Phase 3: ✅ 完了

- TOML 設定ファイル作成
- 設定ファイル存在チェック
- （`load_config` / `validate_config` 関数は Phase 5 で実装予定）

### Phase 4: ✅ 完了

- バックアップ作成機能
- タイムスタンプ付きディレクトリ
- エラー時の自動ロールバック

### Phase 5: ✅ 完了

- `install_from_config()` - TOML からプラグインをインストール
- `install_plugin()` - 単一プラグインのインストール
- `is_plugin_installed()` - インストール済みチェック（べき等性保証）
- `parse_toml_plugins()` - TOML パース機能
- エラー時のロールバック完全対応

### Phase 6: ✅ 完了

- `show_status()` - ✅ 完了（installed_plugins.json を表示）
- `check_updates()` - ✅ 完了（git commit SHA による更新チェック）
- 週次メンテナンスワークフロー統合 - ✅ 完了（mise run update に統合）

**実装詳細**:

- `status --check-updates` フラグでバージョン比較を実行
- インストール時の git commit SHA と marketplace の最新 commit SHA を比較
- 更新が利用可能なプラグインを一覧表示（短縮 SHA 形式）
- べき等性を保証し、安全に複数回実行可能

## 関連ドキュメント

- dotfiles メンテナンスガイド（作成予定） - 週次メンテナンスの全体フロー
- [Claude Code 公式ドキュメント](https://docs.anthropic.com/claude/docs) - Claude Code の公式情報
- [mise タスクランナー](https://mise.jdx.dev/) - mise の使い方

## 参考情報

### Marketplace リポジトリ

- [anthropic-agent-skills](https://github.com/anthropics/skills) - 公式スキルコレクション
- [claude-code-plugins](https://github.com/anthropics/claude-code) - コミュニティプラグイン
- [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) - 公式統合プラグイン

### Claude Code プラグインシステム

Claude Code のプラグインシステムは以下の 3 層構造で動作します。

1. **Marketplace** - Git リポジトリとしてホストされるプラグインコレクション
2. **Plugins** - 個別の機能を提供するモジュール（LSP サーバー、MCP ツール、統合など）
3. **Skills** - 特定のタスクやワークフローを支援する知識パッケージ

このスクリプトは主に Marketplace の更新とプラグインのインストールを自動化します。
