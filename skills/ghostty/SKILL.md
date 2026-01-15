# ghostty - Fast GPU-Accelerated Terminal Configuration

## Overview

Specialized skill for Ghostty terminal emulator configuration. Provides best practices for keybindings (text: vs csi:), shell integration, GPU acceleration, and theme setup. Includes comparison with WezTerm for migration scenarios.

**Core Capability:** Configure Ghostty with optimal keybindings for shell job control (Ctrl+Z), Claude Code integration (Ctrl+J), and tmux-like workflow with GPU acceleration.

**Standards Compliance:** Built on the Agent Skills specification (agentskills.io), supporting cross-platform portability.

## Key Concepts

### Keybinding Design Philosophy

Ghostty offers two approaches for sending key sequences:

1. **`text:` (Raw Control Characters)**

   - Sends raw bytes directly to the shell/application
   - Bypasses terminal protocol layer
   - Use for: Job control signals, application-specific keys

2. **`csi:` (CSI Escape Sequences)**
   - Sends CSI (Control Sequence Introducer) via VT100 protocol
   - Use for: Cursor movement, function keys, advanced terminal features

**Critical Design Decision:** For Ctrl+Z (SIGTSTP) and Ctrl+J (Line Feed), always use `text:` to ensure signals reach the shell correctly.

### WezTerm vs Ghostty Comparison

| Aspect           | WezTerm                         | Ghostty                       |
| ---------------- | ------------------------------- | ----------------------------- |
| API Level        | High-level (`act.SendKey`)      | Low-level (`text:`, `csi:`)   |
| Configuration    | Lua scripts                     | INI-like config file          |
| Key Philosophy   | Action-based abstractions       | Direct byte control           |
| GPU Acceleration | WebGpu (default)                | Native Metal/Vulkan           |
| Leader Key       | `Ctrl+x` (configurable)         | Sequence notation (`ctrl+x>`) |
| Cross-Platform   | macOS, Linux, Windows (via WSL) | macOS, Linux                  |
| Performance      | ~800ms startup                  | Faster (native compilation)   |

**Migration Note:** Ghostty requires explicit byte sequences where WezTerm abstracts them. This provides more control but requires understanding of terminal protocols.

## Configuration Structure

### Basic Setup

```ini
# ghostty/config

############################
# Shell Integration
############################
# Raw control characters for shell job control and Claude Code
keybind = ctrl+z=text:\x1a  # SIGTSTP (suspend)
keybind = ctrl+j=text:\x0a  # Line Feed (Claude Code submit)

############################
# Font (match WezTerm)
############################
font-family = "UDEV Gothic 35NFLG"
font-family = "Inconsolata Nerd Font Mono"
font-family = "Noto Color Emoji"
font-size = 15

############################
# Theme (Gruvbox Dark Hard)
############################
theme = "Gruvbox Dark Hard"
background-opacity = 0.94
background-opacity-cells = true
window-padding-x = 0
window-padding-y = 0
```

### Leader Key (Tmux-like)

Ghostty uses sequence notation for multi-key bindings:

```ini
# Prefix: Ctrl+x (sequence style)
# Ghostty sequence notation: ctrl+x>KEY

# Tabs
keybind = ctrl+x>c=new_tab
keybind = ctrl+x>n=next_tab
keybind = ctrl+x>p=previous_tab

# Tab jump 1..8
keybind = ctrl+x>1=goto_tab:1
keybind = ctrl+x>2=goto_tab:2
# ... up to 8
```

### Splits (Tmux-like)

```ini
# Split down (horizontal divider)
keybind = ctrl+x>-=new_split:down

# Split right (vertical divider)
keybind = ctrl+x>¥=new_split:right
keybind = ctrl+x>|=new_split:right

# Navigate splits
keybind = ctrl+x>o=goto_split:next
keybind = ctrl+x>h=goto_split:left
keybind = ctrl+x>j=goto_split:down
keybind = ctrl+x>k=goto_split:up
keybind = ctrl+x>l=goto_split:right

# Zoom pane
keybind = ctrl+x>z=toggle_split_zoom

# Equalize panes
keybind = ctrl+x>space=equalize_splits
```

### Direct Bindings (WezTerm-like)

```ini
# Font size
keybind = ctrl+equal=increase_font_size:1
keybind = ctrl+-=decrease_font_size:1
keybind = ctrl+shift+equal=reset_font_size

# Vim-style pane navigation (Alt+hjkl)
keybind = alt+h=goto_split:left
keybind = alt+j=goto_split:down
keybind = alt+k=goto_split:up
keybind = alt+l=goto_split:right

# Pane resize (Alt+Shift+Ctrl+hjkl)
keybind = alt+ctrl+shift+h=resize_split:left,2
keybind = alt+ctrl+shift+j=resize_split:down,2
keybind = alt+ctrl+shift+k=resize_split:up,2
keybind = alt+ctrl+shift+l=resize_split:right,2

# Tab movement
keybind = alt+ctrl+h=move_tab:-1
keybind = alt+ctrl+l=move_tab:1
```

## Critical Design Decisions

### Why `text:` for Ctrl+Z and Ctrl+J?

#### Shell Job Control (Ctrl+Z)

**Problem:** Ghostty may intercept Ctrl+Z before the shell receives SIGTSTP signal.

**Solution:** Use `text:\x1a` to send raw control character directly.

```ini
# ✅ Correct: Raw SIGTSTP signal
keybind = ctrl+z=text:\x1a

# ❌ Wrong: CSI sequence won't trigger job control
# keybind = ctrl+z=csi:...
```

**Testing:**

```bash
# Start long-running process
sleep 100

# Press Ctrl+Z
# Expected: [1]+ Stopped sleep 100
```

#### Claude Code Submit (Ctrl+J)

**Problem:** Claude Code expects Line Feed (0x0A) to submit input, same as Enter.

**Solution:** Use `text:\x0a` to send raw Line Feed character.

```ini
# ✅ Correct: Raw Line Feed
keybind = ctrl+j=text:\x0a

# ❌ Wrong: CSI sequence won't be recognized by Claude Code
# keybind = ctrl+j=csi:...
```

**Reasoning:** Ctrl+J = Line Feed (0x0A) in ASCII. Applications like Claude Code treat it identically to Enter (also sends 0x0A). CSI sequences would add escape codes that the application doesn't expect.

### When to Use `csi:`

Use CSI sequences for terminal protocol features:

```ini
# Cursor movement (if needed)
# keybind = up=csi:A

# Function keys with Kitty keyboard protocol
# (Ghostty Key Encoder API can generate these)
```

**For most practical keybindings (job control, application keys), use `text:`.**

## GPU Acceleration

Ghostty uses native GPU acceleration:

- **macOS:** Metal
- **Linux:** Vulkan

**Configuration:** GPU acceleration is enabled by default. No configuration needed (unlike WezTerm's `front_end = "WebGpu"`).

**Performance:** Faster startup and rendering compared to WezTerm due to native compilation.

## Theme Setup

### Gruvbox Dark Hard (Matching WezTerm)

```ini
theme = "Gruvbox Dark Hard"
background-opacity = 0.94
background-opacity-cells = true
```

**Note:** Ghostty includes Gruvbox themes by default. For custom themes, define palette colors:

```ini
# Custom theme example (not needed for Gruvbox)
palette = 0=#1d2021  # black
palette = 1=#cc241d  # red
palette = 2=#98971a  # green
palette = 3=#d79921  # yellow
palette = 4=#458588  # blue
palette = 5=#b16286  # purple
palette = 6=#689d6a  # aqua
palette = 7=#a89984  # white
# ... bold variants (8-15)
```

## Migration from WezTerm

### Key Differences

1. **Configuration Language:**

   - WezTerm: Lua scripts (`wezterm.lua`)
   - Ghostty: INI-like config file (`config`)

2. **Key Actions:**

   - WezTerm: `act.SendKey`, `act.SpawnTab`, etc.
   - Ghostty: Direct actions (`new_tab`, `goto_split`, etc.)

3. **Leader Key:**

   - WezTerm: `leader = { key = "x", mods = "CTRL" }`
   - Ghostty: Sequence notation (`ctrl+x>c`)

4. **Control Characters:**
   - WezTerm: High-level API handles encoding
   - Ghostty: Explicit `text:\x1a` for raw bytes

### Migration Checklist

- [ ] Convert Lua config to INI format
- [ ] Replace `act.` actions with Ghostty actions
- [ ] Convert leader key bindings to sequence notation
- [ ] Add `text:` for Ctrl+Z, Ctrl+J explicitly
- [ ] Verify GPU acceleration works (default enabled)
- [ ] Match theme (Gruvbox built-in)
- [ ] Test shell job control (Ctrl+Z)
- [ ] Test Claude Code submit (Ctrl+J)

## Troubleshooting

### Ctrl+Z Not Suspending

**Symptom:** Pressing Ctrl+Z doesn't suspend the process.

**Solutions:**

1. Ensure `text:\x1a` is used (not CSI)
2. Check if default keybinds are overriding: `disable-default-keybinds = true`
3. Verify with `cat` command and press Ctrl+Z (should see `^Z`)

### Ctrl+J Not Submitting in Claude Code

**Symptom:** Ctrl+J does nothing or inserts newline.

**Solutions:**

1. Ensure `text:\x0a` is used (not CSI)
2. Check if Claude Code is in correct mode (interactive prompt)
3. Test with `cat` command (should behave like Enter)

### Font Not Loading

**Symptom:** Fallback font displayed instead of configured font.

**Solutions:**

1. Verify font is installed: `fc-list | grep "UDEV Gothic"`
2. Use exact font family name from `fc-list`
3. Add multiple fallback fonts:
   ```ini
   font-family = "UDEV Gothic 35NFLG"
   font-family = "Inconsolata Nerd Font Mono"
   font-family = "Noto Color Emoji"
   ```

### Theme Not Applied

**Symptom:** Default theme displayed instead of Gruvbox.

**Solutions:**

1. Verify theme name: `theme = "Gruvbox Dark Hard"`
2. List available themes: `ghostty +list-themes`
3. Use custom palette if theme not available

## Advanced Configuration

### Ghostty Key Encoder API

For advanced key encoding (Kitty keyboard protocol), Ghostty provides a C API:

```c
#include <ghostty/vt.h>

// Create key encoder with Kitty protocol
GhosttyKeyEncoder encoder;
ghostty_key_encoder_new(NULL, &encoder);

// Configure Kitty keyboard protocol flags
uint8_t kitty_flags = GHOSTTY_KEY_ALL;
ghostty_key_encoder_setopt(encoder,
                            GHOSTTY_KEY_ENCODER_OPT_KITTY_FLAGS,
                            &kitty_flags);

// Encode key event
GhosttyKeyEvent event;
ghostty_key_event_new(NULL, &event);
ghostty_key_event_set_action(event, GHOSTTY_KEY_ACTION_PRESS);
ghostty_key_event_set_key(event, GHOSTTY_KEY_C);
ghostty_key_event_set_mods(event, GHOSTTY_MODS_CTRL);
ghostty_key_event_set_text(event, "\x03", 1);

// Encode to buffer
ghostty_key_encoder_encode(encoder, event, buf, size, &written);
```

**Use Case:** When you need fine-grained control over escape sequences beyond `text:` and `csi:`.

### Configuration Reload

```ini
keybind = ctrl+x>r=reload_config
```

**Benefit:** Test configuration changes without restarting Ghostty.

## Best Practices

### Keybindings

✅ **DO:**

- Use `text:` for raw control characters (Ctrl+Z, Ctrl+J)
- Use sequence notation for leader key bindings (`ctrl+x>c`)
- Add comments explaining hex values (`\x1a = SIGTSTP`)
- Test keybindings after changes

❌ **DON'T:**

- Use CSI for job control signals
- Guess hex values (verify with ASCII table)
- Override default keybinds without testing
- Mix WezTerm actions with Ghostty config

### Configuration Management

✅ **DO:**

- Keep config in version control
- Document custom keybindings
- Use reload_config for quick testing
- Match fonts and themes across terminals

❌ **DON'T:**

- Hardcode platform-specific paths
- Duplicate keybindings
- Use deprecated config syntax
- Skip testing after WezTerm migration

## References

### Detailed Documentation

For in-depth Ghostty configuration and protocols:

- `references/key-encoding.md` - CSI sequences, Kitty keyboard protocol, escape codes
- `references/wezterm-comparison.md` - Detailed WezTerm vs Ghostty feature comparison
- `references/gpu-acceleration.md` - Metal/Vulkan setup, performance tuning

### Templates & Examples

- `assets/config-template.ini` - Complete Ghostty config template
- `assets/gruvbox-theme.ini` - Gruvbox theme palette (if manual setup needed)
- `scripts/validate-config.sh` - Config validation script

### External Resources

- **Ghostty Official Docs**: <https://ghostty.org>
- **Context7 Ghostty Docs**: <https://context7.com/ghostty-org/ghostty>
- **Kitty Keyboard Protocol**: <https://sw.kovidgoyal.net/kitty/keyboard-protocol/>
- **VT100 Control Sequences**: <https://vt100.net/docs/vt100-ug/chapter3.html>

## 🤖 Agent Integration

This skill provides terminal configuration guidance to agents:

### Orchestrator Agent

- **Context**: Terminal setup recommendations
- **Timing**: During dotfiles configuration
- **Use Case**: Comparing terminal emulators (WezTerm vs Ghostty)

### Error-Fixer Agent

- **Context**: Keybinding issues (Ctrl+Z, Ctrl+J not working)
- **Timing**: When shell integration fails
- **Use Case**: Diagnosing `text:` vs `csi:` misconfigurations

### 自動ロード条件

- "Ghostty", "ghostty" mentioned
- "terminal emulator", "terminal config" with Ghostty context
- "CSI sequences", "keybindings" in Ghostty discussion
- Ctrl+Z or Ctrl+J troubleshooting in terminal context
- WezTerm → Ghostty migration questions

## Trigger Conditions

Activate this skill when:

- User mentions "Ghostty", "ghostty terminal"
- Discussing terminal emulator configuration
- Keybinding issues (Ctrl+Z, Ctrl+J not working)
- CSI sequences or control characters in terminal context
- Migrating from WezTerm to Ghostty
- Shell integration problems (job control, Claude Code)
- GPU acceleration or performance tuning
- Terminal theme setup (Gruvbox)

## See Also

- **wezterm** skill - WezTerm configuration and comparison
- **mise** skill - Tool version management integration
- **dotfiles-integration** skill - Cross-tool configuration consistency
- **terminal** rules - Terminal configuration guidelines (.claude/rules/tools/terminal.md)
