---
name: claude-marketplace-sync
description: |
  [What] Claude Code marketplace のプラグイン/スキル同期を管理するスキル。同期スクリプトと設定ファイルの使い方を整理します。
  [When] Use when: marketplace の更新、プラグイン追加、同期エラーの調査を行う時。
  [Keywords] claude marketplace, marketplace sync, plugins, skills, claude-marketplace-sync.sh, claude-marketplace.toml, mise
---

# Claude Marketplace Sync

## 概要

Claude Code marketplace の更新・プラグイン同期を行うための手順と運用ガイドです。

## クイックスタート

```bash
# すべての更新（Claude marketplace 含む）
mise run update:claude-marketplace

# marketplace のみ更新
sh ~/.claude/bin/claude-marketplace-sync.sh update

# 設定からインストール
sh ~/.claude/bin/claude-marketplace-sync.sh install
```

## 設定ファイル

- `~/.claude/config/claude-marketplace.toml`
- `~/.claude/mise.toml`（タスク定義）

## 詳細リファレンス

- `references/claude-marketplace-sync.md`

## 次のステップ

1. `claude-marketplace.toml` を更新
2. `mise run update:claude-marketplace` を実行
3. `status --check-updates` で差分確認
