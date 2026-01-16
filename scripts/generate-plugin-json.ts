#!/usr/bin/env bun

/**
 * plugin.json 自動生成スクリプト
 *
 * カテゴリバンドルの plugin.json の skills 配列を、
 * ディレクトリ構造から自動生成します。
 *
 * 使用方法:
 *   bun run scripts/generate-plugin-json.ts
 *   bun run scripts/generate-plugin-json.ts --dry-run
 */

import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { EXCLUDED_CATEGORIES } from './config'

interface PluginMetadata {
  name: string
  version: string
  description: string
  author: {
    name: string
  }
  skills: string[]
}

const PLUGINS_DIR = join(import.meta.dir, '..', 'plugins')
const DRY_RUN = process.argv.includes('--dry-run')

/**
 * plugins/ 配下のカテゴリディレクトリを検出
 */
async function findCategoryDirectories(): Promise<string[]> {
  const entries = await readdir(PLUGINS_DIR, { withFileTypes: true })

  return entries
    .filter(entry => entry.isDirectory() && !EXCLUDED_CATEGORIES.includes(entry.name))
    .map(entry => entry.name)
    .sort()
}

/**
 * カテゴリディレクトリが有効なカテゴリバンドルか判定
 * (.claude-plugin/plugin.json の存在で判定)
 */
function isValidCategory(categoryPath: string): boolean {
  const pluginJsonPath = join(categoryPath, '.claude-plugin', 'plugin.json')
  return existsSync(pluginJsonPath)
}

/**
 * カテゴリディレクトリ内のプラグインディレクトリを検出
 */
async function findPluginDirectories(categoryPath: string): Promise<string[]> {
  const entries = await readdir(categoryPath, { withFileTypes: true })

  return entries
    .filter(entry => entry.isDirectory() && entry.name !== '.claude-plugin')
    .map(entry => entry.name)
    .sort()
}

/**
 * プラグインディレクトリ内のスキルファイルパスを検出
 *
 * 優先順位:
 * 1. ./skills/SKILL.md → "./{plugin}/skills/"
 * 2. ./SKILL.md → "./{plugin}/"
 * 3. どちらもない → null
 */
function detectSkillPath(categoryPath: string, pluginName: string): string | null {
  const pluginPath = join(categoryPath, pluginName)

  // skills/SKILL.md をチェック
  if (existsSync(join(pluginPath, 'skills', 'SKILL.md'))) {
    return `./${pluginName}/skills/`
  }

  // 直下の SKILL.md をチェック
  if (existsSync(join(pluginPath, 'SKILL.md'))) {
    return `./${pluginName}/`
  }

  return null
}

/**
 * カテゴリのスキルパス配列を生成
 */
async function generateSkillPaths(category: string): Promise<string[]> {
  const categoryPath = join(PLUGINS_DIR, category)
  const pluginDirs = await findPluginDirectories(categoryPath)

  const skillPaths: string[] = []

  for (const pluginName of pluginDirs) {
    const skillPath = detectSkillPath(categoryPath, pluginName)
    if (skillPath) {
      skillPaths.push(skillPath)
    } else {
      console.warn(`⚠️  [${category}/${pluginName}] SKILL.md not found, skipping`)
    }
  }

  return skillPaths
}

/**
 * plugin.json を読み込み
 */
async function readPluginJson(category: string): Promise<PluginMetadata> {
  const pluginJsonPath = join(PLUGINS_DIR, category, '.claude-plugin', 'plugin.json')
  const file = Bun.file(pluginJsonPath)
  const content = await file.text()
  return JSON.parse(content)
}

/**
 * plugin.json を書き込み
 */
async function writePluginJson(category: string, metadata: PluginMetadata): Promise<void> {
  const pluginJsonPath = join(PLUGINS_DIR, category, '.claude-plugin', 'plugin.json')
  const content = JSON.stringify(metadata, null, 2) + '\n'
  await Bun.write(pluginJsonPath, content)
}

/**
 * 配列が等しいかチェック
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val === b[idx])
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔍 Scanning plugin directories...\n')

  const categories = await findCategoryDirectories()
  let changedCount = 0

  for (const category of categories) {
    const categoryPath = join(PLUGINS_DIR, category)

    // .claude-plugin/plugin.json が存在しない場合はスキップ
    if (!isValidCategory(categoryPath)) {
      console.warn(
        `⚠️  [${category}] Not a valid category bundle (missing .claude-plugin/plugin.json), skipping`
      )
      continue
    }
    const skillPaths = await generateSkillPaths(category)
    const metadata = await readPluginJson(category)

    const hasChanges = !arraysEqual(metadata.skills, skillPaths)

    if (hasChanges) {
      changedCount++

      console.log(`📝 [${category}] Changes detected:`)
      console.log(`   Old: ${metadata.skills.length} skills`)
      console.log(`   New: ${skillPaths.length} skills`)

      if (DRY_RUN) {
        console.log(`   Diff:`)
        const added = skillPaths.filter(path => !metadata.skills.includes(path))
        const removed = metadata.skills.filter(path => !skillPaths.includes(path))

        if (added.length > 0) {
          console.log(`   + Added: ${added.join(', ')}`)
        }
        if (removed.length > 0) {
          console.log(`   - Removed: ${removed.join(', ')}`)
        }
      } else {
        metadata.skills = skillPaths
        await writePluginJson(category, metadata)
        console.log(`   ✅ Updated: plugins/${category}/.claude-plugin/plugin.json`)
      }
      console.log()
    } else {
      console.log(`✓ [${category}] No changes (${skillPaths.length} skills)`)
    }
  }

  if (changedCount === 0) {
    console.log('\n✨ All plugin.json files are up to date!')
  } else if (DRY_RUN) {
    console.log(`\n💡 Dry-run mode: ${changedCount} file(s) would be updated`)
    console.log('   Run without --dry-run to apply changes')
  } else {
    console.log(`\n✅ Successfully updated ${changedCount} file(s)`)
  }
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
