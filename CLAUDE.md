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
│   └── marketplace.json              # マーケットプレイス定義（カテゴリバンドルのみ登録）
├── plugins/                          # カテゴリ別ディレクトリ
│   ├── dev-tools/                    # 開発支援ツールカテゴリ（27プラグイン）
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json           # カテゴリバンドル定義
│   │   ├── mise/
│   │   │   └── skills/
│   │   ├── react/
│   │   │   └── skills/
│   │   └── ... (全27プラグイン)
│   ├── docs/                         # ドキュメント作成カテゴリ（5プラグイン）
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json           # カテゴリバンドル定義
│   │   ├── deckset/
│   │   │   └── skills/
│   │   └── ... (全5プラグイン)
│   ├── utils/                        # ユーティリティカテゴリ（2プラグイン）
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json           # カテゴリバンドル定義
│   │   ├── dotenvx/
│   │   │   └── skills/
│   │   └── claude-marketplace-sync/
│   └── openai-skills/                # OpenAI公式スキル（サブモジュール）
│       └── .claude-plugin/
│           └── plugin.json
├── CLAUDE.md                         # このファイル
└── README.md                         # 利用者向けガイド
```

### カテゴリバンドル構造

このマーケットプレイスは**カテゴリバンドル形式**を採用しています：

- **カテゴリ = バンドル**: 各カテゴリディレクトリ自体が1つのバンドルプラグイン
- **自動包含**: カテゴリ配下の全プラグインが自動的にバンドルに含まれる
- **シンプルな管理**: 新規プラグイン追加時、カテゴリの`plugin.json`にパスを追加するだけ

| カテゴリ          | プラグイン数 | 説明                                     |
| ----------------- | ------------ | ---------------------------------------- |
| **dev-tools**     | 27           | コード品質、レビュー、開発ワークフロー   |
| **docs**          | 5            | ドキュメント、図表、プレゼン作成         |
| **utils**         | 2            | 汎用ユーティリティ、環境管理             |
| **openai-skills** | 6            | OpenAI公式スキル（サブモジュール、独立） |

````

## サブモジュール管理

このマーケットプレイスでは、外部リポジトリをサブモジュールとして統合しています。

### 現在のサブモジュール

| サブモジュール | パス | 用途 |
|---------------|------|------|
| openai-skills | `plugins/openai-skills` | OpenAI 公式キュレーションスキル |

### サブモジュールの更新

#### mise を使った管理（推奨）

```bash
# サブモジュールを最新に更新（普段はこれだけ）
mise run submodule:update

# 初期化（クローン時に --recursive を忘れた場合のみ）
mise run submodule:init
```

#### 直接 git コマンドで管理

```bash
# 全てのサブモジュールを更新
git submodule update --remote --merge

# クローン時にサブモジュールを含める
git clone --recursive https://github.com/jey3dayo/claude-code-marketplace.git
```

### 新しいサブモジュールの追加

外部リポジトリをサブモジュールとして追加する場合:

```bash
# サブモジュールを追加
git submodule add -b main <repository-url> plugins/<category>/<plugin-name>

# .claude-plugin/plugin.json を作成
# marketplace.json に登録
```

詳細は [OpenAI Skills プラグイン](plugins/openai-skills/) を参照。

````

## プラグイン開発ガイド

### 新しいプラグインを追加する（カテゴリバンドル形式）

#### 1. 適切なカテゴリを選択

プラグインの用途に応じてカテゴリを選択：

- **dev-tools**: コード品質、レビュー、開発ワークフロー
- **docs**: ドキュメント、図表、プレゼン作成
- **utils**: 汎用ユーティリティ、環境管理

#### 2. プラグインディレクトリを作成

```bash
# プラグインディレクトリを作成
mkdir -p plugins/{category}/{plugin_name}/skills
# または
mkdir -p plugins/{category}/{plugin_name}  # 直下にSKILL.mdを配置する場合
```

#### 3. スキルファイルを作成

`plugins/{category}/{plugin_name}/skills/SKILL.md` または `plugins/{category}/{plugin_name}/SKILL.md`:

```markdown
---
name: your-skill-name
description: スキルの説明
---

# スキル名

スキルの詳細な説明と動作を記述。
```

#### 4. カテゴリバンドルに追加

`plugins/{category}/.claude-plugin/plugin.json` の `skills` 配列にパスを追加:

```json
{
  "name": "{category}-bundle",
  "version": "1.0.0",
  "description": "カテゴリの説明",
  "author": { "name": "jey3dayo" },
  "skills": [
    "./existing-plugin/skills/",
    "./your-plugin-name/skills/" // ← 追加
  ]
}
```

**重要**: marketplace.jsonへの個別登録は不要です。カテゴリバンドルに含まれれば自動的にマーケットプレイスで利用可能になります。

### ファイル形式リファレンス

#### marketplace.json（カテゴリバンドル形式）

```json
{
  "name": "jey3dayo",
  "owner": {
    "name": "jey3dayo",
    "email": "j138cm@gmail.com"
  },
  "description": "jey3dayo Claude Code Plugin Marketplace - カテゴリバンドル形式",
  "plugins": [
    {
      "name": "dev-tools-bundle",
      "source": "./plugins/dev-tools",
      "description": "開発ツールカテゴリの全スキル（27プラグイン）",
      "version": "1.0.0",
      "author": { "name": "jey3dayo" }
    },
    {
      "name": "docs-bundle",
      "source": "./plugins/docs",
      "description": "ドキュメント作成カテゴリの全スキル（5プラグイン）",
      "version": "1.0.0",
      "author": { "name": "jey3dayo" }
    }
  ]
}
```

#### カテゴリバンドルのplugin.json

`plugins/{category}/.claude-plugin/plugin.json`:

```json
{
  "name": "{category}-bundle",
  "version": "1.0.0",
  "description": "カテゴリの説明",
  "author": { "name": "jey3dayo" },
  "skills": ["./plugin1/skills/", "./plugin2/", "./plugin3/skills/"]
}
```

#### スキルファイル (.md)

`plugins/{category}/{plugin_name}/skills/SKILL.md` または `plugins/{category}/{plugin_name}/SKILL.md`:

```markdown
---
name: skill-name
description: スキルの説明
---

# スキル名

スキルの詳細な説明と使用方法を記述。
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
# マーケットプレイスを追加
/plugin marketplace add ~/src/github.com/jey3dayo/claude-code-marketplace

# インストール可能なバンドルを確認
/plugin list

# カテゴリバンドルをインストール
/plugin install dev-tools-bundle@jey3dayo   # 開発ツール27個
/plugin install docs-bundle@jey3dayo        # ドキュメント5個
/plugin install utils-bundle@jey3dayo       # ユーティリティ2個
/plugin install openai-skills@jey3dayo      # OpenAI公式6個
```

## 関連リンク

- [Claude Code プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference)
- [プラグインマーケットプレイス](https://code.claude.com/docs/en/plugin-marketplaces)
- [サブエージェント](https://code.claude.com/docs/en/sub-agents)
