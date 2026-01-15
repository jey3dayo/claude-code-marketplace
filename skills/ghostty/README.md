# Ghostty Terminal Emulator Skill

Fast GPU-accelerated terminal configuration with focus on keybindings, shell integration, and WezTerm migration.

## Overview

This skill provides comprehensive guidance for configuring Ghostty terminal emulator, with special attention to:

- **Keybinding Design:** Understanding `text:` vs `csi:` for control characters
- **Shell Integration:** Proper Ctrl+Z (job control) and Ctrl+J (Claude Code) setup
- **WezTerm Migration:** Side-by-side comparison and migration checklist
- **GPU Acceleration:** Native Metal/Vulkan performance tuning

## Quick Start

### Install Ghostty

```bash
# macOS (Homebrew)
brew install --cask ghostty

# Linux (from source)
git clone https://github.com/ghostty-org/ghostty
cd ghostty
zig build -Doptimize=ReleaseFast
```

### Apply Configuration Template

```bash
# Copy template to config directory
mkdir -p ~/.config/ghostty
cp assets/config-template.ini ~/.config/ghostty/config

# Validate configuration
./scripts/validate-config.sh
```

### Test Critical Keybindings

```bash
# Test Ctrl+Z (job control)
sleep 100
# Press Ctrl+Z → [1]+ Stopped

# Test Ctrl+J (Claude Code submit)
# Open Claude Code, type message, press Ctrl+J → submits
```

## File Structure

```
ghostty/
├── SKILL.md                        # Main skill documentation (Progressive Disclosure)
├── README.md                       # This file (quick reference)
├── references/                     # Detailed documentation
│   ├── key-encoding.md             # CSI vs text:, control characters
│   └── wezterm-comparison.md       # WezTerm vs Ghostty feature comparison
├── scripts/                        # Automation scripts
│   └── validate-config.sh          # Config validation and testing
└── assets/                         # Templates and resources
    └── config-template.ini         # Full Ghostty config template
```

## Critical Design Decisions

### Always Use `text:` for Ctrl+Z and Ctrl+J

```ini
# ✅ Correct: Raw control characters
keybind = ctrl+z=text:\x1a  # SIGTSTP (suspend)
keybind = ctrl+j=text:\x0a  # Line Feed (submit)

# ❌ Wrong: CSI sequences don't work for signals
# keybind = ctrl+z=csi:...
```

**Why?**

- Shell expects raw byte `0x1a` for SIGTSTP, not an escape sequence
- Claude Code expects raw Line Feed `0x0a`, same as Enter
- CSI sequences are for terminal control (cursor movement, colors), not signals

### Use Sequence Notation for Leader Key

```ini
# Ghostty sequence notation: ctrl+x>KEY
keybind = ctrl+x>c=new_tab
keybind = ctrl+x>-=new_split:down
keybind = ctrl+x>|=new_split:right
```

**Equivalent WezTerm:**

```lua
{ key = "c", mods = "LEADER", action = act.SpawnTab "CurrentPaneDomain" }
```

## Common Tasks

### Validate Configuration

```bash
./scripts/validate-config.sh
```

**Checks:**

- Ghostty installation
- Config file exists
- Keybindings syntax (text: vs csi:)
- Theme configuration
- Font availability

### List Available Themes

```bash
ghostty +list-themes
```

### Reload Configuration

**Without restarting:**

```ini
# Add to config
keybind = ctrl+x>r=reload_config
```

**Then press:** `Ctrl+x r`

### Migrate from WezTerm

1. **Read comparison:** `references/wezterm-comparison.md`
2. **Use template:** `assets/config-template.ini`
3. **Convert keybindings:**
   - `{ key = "c", mods = "LEADER" }` → `ctrl+x>c`
   - Remove Lua logic
4. **Add explicit control characters:**
   - `keybind = ctrl+z=text:\x1a`
   - `keybind = ctrl+j=text:\x0a`
5. **Test thoroughly:** Shell job control, Claude Code, GPU acceleration

## Performance Comparison

| Metric     | WezTerm  | Ghostty  | Winner  |
| ---------- | -------- | -------- | ------- |
| Startup    | ~800ms   | ~400ms   | Ghostty |
| Rendering  | 60 FPS   | 60 FPS   | Tie     |
| Memory     | ~450MB   | ~320MB   | Ghostty |
| CPU (idle) | 0.1-0.3% | 0.0-0.1% | Ghostty |

**Takeaway:** Ghostty is ~2x faster startup, 30% less memory.

## Troubleshooting

### Ctrl+Z Not Suspending

**Symptom:** Pressing Ctrl+Z doesn't suspend process.

**Solution:**

1. Check config: `keybind = ctrl+z=text:\x1a`
2. Verify with `cat` command:

   ```bash
   cat
   # Press Ctrl+Z
   # Should see: ^Z
   ```

3. Test with actual process:

   ```bash
   sleep 100
   # Press Ctrl+Z
   # Expected: [1]+ Stopped
   ```

### Ctrl+J Not Submitting in Claude Code

**Symptom:** Ctrl+J does nothing or inserts newline.

**Solution:**

1. Check config: `keybind = ctrl+j=text:\x0a`
2. Verify with `cat` command:

   ```bash
   cat
   # Type text, press Ctrl+J
   # Should behave like Enter (newline)
   ```

3. Test in Claude Code interactive prompt

### Font Not Loading

**Symptom:** Fallback font displayed.

**Solution:**

1. Verify font installed:

   ```bash
   fc-list | grep "UDEV Gothic"
   ```

2. Use exact font family name from `fc-list`
3. Add multiple fallbacks:

   ```ini
   font-family = "UDEV Gothic 35NFLG"
   font-family = "Inconsolata Nerd Font Mono"
   font-family = "Noto Color Emoji"
   ```

## See Also

- **SKILL.md:** Comprehensive documentation (Progressive Disclosure)
- **references/key-encoding.md:** Deep dive into CSI sequences and control characters
- **references/wezterm-comparison.md:** WezTerm vs Ghostty feature comparison
- **Ghostty Official Docs:** <https://ghostty.org>
- **Context7 Ghostty Docs:** <https://context7.com/ghostty-org/ghostty>

## Contributing

This skill follows the [Agent Skills specification](https://agentskills.io):

- **SKILL.md:** YAML frontmatter + instructions (required)
- **references/:** Detailed documentation (optional)
- **scripts/:** Automation workflows (optional)
- **assets/:** Templates and resources (optional)

**Improvements welcome:**

- Additional validation checks in `validate-config.sh`
- More theme examples in `assets/`
- Platform-specific guides (Linux vs macOS)

## License

MIT License
