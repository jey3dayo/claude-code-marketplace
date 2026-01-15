# Claude Code Marketplace

自分用プラグインマーケットプレイス

## クイックスタート

### オプション1: ローカルディレクトリ（開発・即時反映）

```bash
# 1. リポジトリをクローン
git clone https://github.com/jey3dayo/claude-code-marketplace.git ~/path/to/marketplace

# 2. Claude Code起動後、マーケットプレイスを追加（変更は即座に反映）
/plugin marketplace add ~/path/to/marketplace

# 3. プラグインをインストール
/plugin install @jey3dayo
```

### オプション2: GitHub URL（本番利用）

```bash
# GitHubから直接追加
/plugin marketplace add https://github.com/jey3dayo/claude-code-marketplace

# プラグインをインストール
/plugin install @jey3dayo
```

### オプション3: 単一プラグイン開発

```bash
# 特定プラグインを直接ロード（最も高速）
cc --plugin-dir ~/path/to/marketplace/plugins/dev-tools/dotenvx
```

## 利用可能なプラグイン

### OpenAI 公式スキル

- **[openai-skills](plugins/openai-skills/)** - OpenAI 公式キュレーションスキル集
  - GitHub CI修正 (gh-fix-ci)
  - GitHub PRコメント対応 (gh-address-comments)
  - Notion統合 (4種)

**注意**: このプラグインは Gitサブモジュールを使用しています。

```bash
# クローン時にサブモジュールを含める
git clone --recursive https://github.com/jey3dayo/claude-code-marketplace.git

# サブモジュール更新（mise使用）
mise run submodule:update   # 最新に更新（普段はこれだけ）
mise run submodule:init     # 初期化（--recursive忘れた時）
```

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
