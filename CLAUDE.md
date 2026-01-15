# Claude Code Marketplace 開発ガイド

## プロジェクト概要

自分用の Claude Code プラグインマーケットプレイス。Claude Code公式の`/plugin install`形式に対応。

## 必読マニュアル

プラグイン開発を始める前に、以下の公式ドキュメントを必ず参照してください：

### 基本マニュアル

- **[プラグインマーケットプレイス](https://code.claude.com/docs/en/plugin-marketplaces)** - マーケットプレイスの仕組みと構造
  - `marketplace.json` の詳細仕様
  - プラグインの登録方法
  - マーケットプレイスの配布方法

- **[プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference)** - プラグインの構造とメタデータ
  - `plugin.json` の詳細仕様
  - 必須フィールドと任意フィールド
  - ディレクトリ構造のルール

### コンポーネント別マニュアル

- **[スラッシュコマンド](https://code.claude.com/docs/en/slash-commands)** - カスタムコマンドの作成方法
  - コマンドファイル形式（フロントマター）
  - 引数の処理方法
  - 許可ツールの指定

- **[サブエージェント](https://code.claude.com/docs/en/sub-agents)** - エージェントの定義と使い方
  - エージェントファイル形式
  - ツールとモデルの指定
  - トリガー条件の記述方法

### 使用方法の注意点

このマーケットプレイスは、上記の公式マニュアルに準拠して構築されています。プラグインを追加・修正する際は、必ず公式ドキュメントの最新情報を確認してください。

## ディレクトリ構造

```
claude-code-marketplace/
├── .claude-plugin/
│   └── marketplace.json              # マーケットプレイス定義（必須）
├── plugins/                          # 用途別カテゴリ
│   ├── dev-tools/                    # 開発支援ツール
│   ├── infra/                        # インフラ操作
│   ├── docs/                         # ドキュメント作成
│   ├── utils/                        # ユーティリティ
│   └── samples/                      # サンプル
│       └── {plugin_name}/
│           ├── .claude-plugin/
│           │   └── plugin.json       # プラグインメタデータ（必須）
│           ├── commands/             # カスタムコマンド
│           ├── agents/               # サブエージェント
│           └── skills/               # スキル
├── CLAUDE.md                         # このファイル
└── README.md                         # 利用者向けガイド
```

### カテゴリ定義

| カテゴリ      | 説明                                   | 例                                    |
| ------------- | -------------------------------------- | ------------------------------------- |
| **dev-tools** | コード品質、レビュー、開発ワークフロー | cc-sdd, code-review, typescript, mise |
| **docs**      | ドキュメント、図表、プレゼン作成       | deckset, drawio, docs-write           |
| **utils**     | 汎用ユーティリティ、環境管理           | dotenvx                               |

````

## プラグイン開発ガイド

### 新しいプラグインを追加する

#### 1. 適切なカテゴリを選択

プラグインの用途に応じてカテゴリを選択：
- **dev-tools**: コード品質、レビュー、開発ワークフロー
- **docs**: ドキュメント、図表、プレゼン作成
- **utils**: 汎用ユーティリティ、環境管理

#### 2. ディレクトリ構造を作成

```bash
mkdir -p plugins/{category}/{plugin_name}/.claude-plugin
mkdir -p plugins/{category}/{plugin_name}/commands   # コマンドがある場合
mkdir -p plugins/{category}/{plugin_name}/agents     # エージェントがある場合
```

#### 3. plugin.json を作成

`plugins/{category}/{plugin_name}/.claude-plugin/plugin.json`:

```json
{
  "name": "your-plugin-name",
  "version": "1.0.0",
  "description": "プラグインの説明",
  "author": { "name": "your_name" },
  "commands": ["./commands/"],
  "agents": ["./agents/"],
  "skills": ["./skills/"]
}
```

#### 3. コマンドを作成（任意）

`plugins/{category}/{plugin_name}/commands/your-command.md`:

```markdown
---
name: your-command
description: コマンドの説明
---

# コマンド名

コマンドの詳細な説明と動作を記述。
```

#### 4. エージェントを作成（任意）

`plugins/{category}/{plugin_name}/agents/your-agent.md`:

```markdown
---
name: your-agent
description: エージェントの説明（いつ使うかを含める）
tools: Read, Glob, Grep
model: haiku
---

エージェントのシステムプロンプトを記述。
```

#### 5. marketplace.json に登録

`.claude-plugin/marketplace.json` の `plugins` 配列に追加:

```json
{
  "name": "your-plugin-name",
  "source": "./plugins/{category}/{plugin_name}",
  "description": "プラグインの説明",
  "version": "1.0.0",
  "author": { "name": "jey3dayo" }
}
```

### ファイル形式リファレンス

#### marketplace.json

```json
{
  "name": "jey3dayo",
  "owner": {
    "name": "jey3dayo",
    "email": "j138cm@gmail.com"
  },
  "description": "説明",
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/{category}/{plugin_name}",
      "description": "説明",
      "version": "1.0.0",
      "author": { "name": "jey3dayo" }
    }
  ]
}
```

#### plugin.json

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "説明",
  "author": { "name": "author" },
  "commands": ["./commands/"],
  "agents": ["./agents/"],
  "skills": ["./skills/"]
}
```

#### コマンドファイル (.md)

```markdown
---
name: command-name
description: 説明
argument-hint: <args>
allowed-tools: Bash, Read
---

# コマンド名

コマンドの説明と実装。
```

#### エージェントファイル (.md)

```markdown
---
name: agent-name
description: 説明（いつ使うかを含める）
tools: Read, Glob, Grep
model: haiku
---

エージェントのシステムプロンプト。
```

## 開発規約

### 言語ポリシー

- **思考**: 英語で考える
- **回答**: すべて日本語で出力

### 命名規則

- **プラグイン名**: 小文字、ハイフン区切り（例: `hello-world`）
- **コマンド名**: 小文字、ハイフン区切り
- **エージェント名**: 小文字、ハイフン区切り

### コミット規約

- 変更内容を簡潔に記述
- 追加の署名やフッターは不要
- 例: `Add dotenvx plugin for environment variable encryption`

## 検証方法

```bash
# マーケットプレイスを追加してテスト
/plugin marketplace add .
/plugin list

# プラグインをインストールしてテスト
/plugin install dotenvx@jey3dayo
```

## 関連リンク

- [Claude Code プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference)
- [プラグインマーケットプレイス](https://code.claude.com/docs/en/plugin-marketplaces)
- [サブエージェント](https://code.claude.com/docs/en/sub-agents)
````
