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

| プラグイン | 説明     |
| ---------- | -------- |
| xxxxxx     | xxxxxxxx |

## インストール例

```bash
# 個別インストール
/plugin install xxxxxx@jey3dayo
```

## 参考リンク

- 開発者向けガイド: [CLAUDE.md](CLAUDE.md)
- [プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference) - プラグインの構造とメタデータ
- [プラグインマーケットプレイス](https://code.claude.com/docs/en/plugin-marketplaces) - マーケットプレイスの仕組み
- [スラッシュコマンド](https://code.claude.com/docs/en/slash-commands) / [サブエージェント](https://code.claude.com/docs/en/sub-agents)
