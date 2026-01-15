# Claude Code Marketplace

自分用プラグインマーケットプレイス

## クイックスタート

```bash
# 1. リポジトリをクローン
REPOS_DIR=~/src/github.com/jey3dayo/claude-code-marketplace
git clone https://github.com/jey3dayo/claude-code-marketplace.git $REPOS_DIR

# 2. Claude Code起動後、マーケットプレイスを追加
/plugin marketplace add $REPOS_DIR

# 3. プラグインをインストール
/plugin install @jey3dayo
```

## 利用可能なプラグイン

### 開発ツール (dev-tools)

| プラグイン        | 説明                                 |
| ----------------- | ------------------------------------ |
| cc-sdd            | Spec-Driven Development              |
| code-review       | コードレビュースキル                 |
| knowledge-creator | 知識分類・作成システム               |
| mise              | タスクランナー・ツールバージョン管理 |
| similarity        | 類似度分析                           |
| typescript        | TypeScript型安全性スキル             |

### ドキュメント (docs)

| プラグイン | 説明                     |
| ---------- | ------------------------ |
| deckset    | プレゼン作成支援         |
| docs-write | Markdownドキュメント作成 |
| drawio     | Draw.io図表作成          |

### ユーティリティ (utils)

| プラグイン | 説明               |
| ---------- | ------------------ |
| dotenvx    | 環境変数暗号化管理 |

## インストール例

```bash
# 個別インストール
/plugin install dotenvx@jey3dayo
/plugin install mise@jey3dayo
/plugin install code-review@jey3dayo

# 一括インストール
/plugin install @jey3dayo
```

## 参考リンク

- 開発者向けガイド: [CLAUDE.md](CLAUDE.md)
- [プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference) - プラグインの構造とメタデータ
- [プラグインマーケットプレイス](https://code.claude.com/docs/en/plugin-marketplaces) - マーケットプレイスの仕組み
- [スラッシュコマンド](https://code.claude.com/docs/en/slash-commands) / [サブエージェント](https://code.claude.com/docs/en/sub-agents)
