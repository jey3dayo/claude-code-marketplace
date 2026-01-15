# Ghostty Key Encoding Deep Dive

## Control Characters vs CSI Sequences

### ASCII Control Characters (0x00-0x1F)

Control characters are special bytes that trigger actions in terminals and applications:

| Char    | Hex    | Decimal | Name | Common Use                |
| ------- | ------ | ------- | ---- | ------------------------- |
| Ctrl+@  | `\x00` | 0       | NUL  | Null character            |
| Ctrl+A  | `\x01` | 1       | SOH  | Start of heading          |
| Ctrl+C  | `\x03` | 3       | ETX  | Interrupt (SIGINT)        |
| Ctrl+D  | `\x04` | 4       | EOT  | End of transmission (EOF) |
| Ctrl+J  | `\x0a` | 10      | LF   | Line Feed (newline)       |
| Ctrl+M  | `\x0d` | 13      | CR   | Carriage Return           |
| Ctrl+Z  | `\x1a` | 26      | SUB  | Suspend (SIGTSTP)         |
| Ctrl+[  | `\x1b` | 27      | ESC  | Escape (start of CSI)     |
| Ctrl+\\ | `\x1c` | 28      | FS   | File separator (SIGQUIT)  |

**Key Insight:** These are single-byte raw characters. When you press Ctrl+Z, the terminal sends byte `0x1a` to the shell.

### CSI (Control Sequence Introducer) Sequences

CSI sequences start with `ESC [` (0x1b 0x5b) and are used for terminal control:

| Function         | CSI Sequence      | Description                   |
| ---------------- | ----------------- | ----------------------------- |
| Cursor Up        | `ESC [ A`         | Move cursor up one line       |
| Cursor Down      | `ESC [ B`         | Move cursor down one line     |
| Cursor Forward   | `ESC [ C`         | Move cursor right one column  |
| Cursor Back      | `ESC [ D`         | Move cursor left one column   |
| Clear Screen     | `ESC [ 2 J`       | Clear entire screen           |
| Set Color        | `ESC [ 31 m`      | Set foreground to red         |
| Reset Attributes | `ESC [ 0 m`       | Reset all attributes          |
| Kitty KKP        | `ESC [ 57442;5 u` | Kitty keyboard protocol event |

**Structure:** `ESC [ <parameters> <command>`

**Example:** `ESC [ 31 m` = `\x1b[31m` sets text color to red.

## Ghostty's `text:` vs `csi:` Options

### `text:` Option (Raw Bytes)

**Syntax:** `keybind = <key>=text:<hex_bytes>`

**Behavior:** Sends raw bytes directly to the PTY (pseudo-terminal), bypassing terminal protocol interpretation.

**Use Cases:**

- **Job Control Signals:** Ctrl+Z (SIGTSTP), Ctrl+C (SIGINT)
- **Application Keys:** Ctrl+J (Line Feed for Claude Code)
- **Raw Character Input:** Any ASCII or extended characters

**Examples:**

```ini
# Send SIGTSTP (suspend process)
keybind = ctrl+z=text:\x1a

# Send Line Feed (same as Enter)
keybind = ctrl+j=text:\x0a

# Send Ctrl+C (interrupt)
keybind = ctrl+c=text:\x03

# Send custom sequence (e.g., Ctrl+A for tmux prefix)
keybind = ctrl+a=text:\x01
```

**Technical Details:**

- Bytes are written directly to the PTY master side
- Shell/application receives them as if typed on a physical terminal
- No escaping or protocol encoding applied

### `csi:` Option (Escape Sequences)

**Syntax:** `keybind = <key>=csi:<csi_command>`

**Behavior:** Constructs and sends a CSI escape sequence (`ESC [ <command>`).

**Use Cases:**

- **Cursor Movement:** Arrow keys, Home, End
- **Function Keys:** F1-F12 with modifiers
- **Terminal Control:** Clear screen, set colors
- **Kitty Keyboard Protocol:** Advanced key events

**Examples:**

```ini
# Send cursor up (arrow up key)
keybind = up=csi:A

# Send cursor down (arrow down key)
keybind = down=csi:B

# Send F1 key
keybind = f1=csi:11~

# Reset text attributes
keybind = ctrl+shift+r=csi:0m
```

**Technical Details:**

- Ghostty prepends `ESC [` to the command
- Result: `ESC [ <command>` sent to PTY
- Terminal interprets the sequence according to VT100/xterm standards

## Why `text:` for Ctrl+Z and Ctrl+J?

### Case Study: Ctrl+Z (Job Control)

**Problem:** Shell expects raw `0x1a` byte to trigger SIGTSTP.

**Solution Comparison:**

```ini
# ✅ Correct: Sends raw 0x1a byte
keybind = ctrl+z=text:\x1a

# ❌ Wrong: Sends ESC [ ? (invalid CSI)
# keybind = ctrl+z=csi:...
```

**Why CSI Fails:**

1. CSI sequences are for terminal control, not signal generation
2. Shell doesn't interpret `ESC [ ...` as job control
3. Signal must be a **single raw byte** (0x1a)

**Testing:**

```bash
# Start a process
sleep 100

# Press Ctrl+Z
# Expected output:
[1]+ Stopped                 sleep 100

# Verify with 'jobs'
jobs
# Expected:
[1]+  Stopped                 sleep 100

# Resume with 'fg'
fg
```

### Case Study: Ctrl+J (Claude Code Submit)

**Problem:** Claude Code expects Line Feed (0x0a) to submit input, same as Enter.

**Solution Comparison:**

```ini
# ✅ Correct: Sends raw Line Feed (0x0a)
keybind = ctrl+j=text:\x0a

# ❌ Wrong: Sends ESC [ J (clear screen to end)
# keybind = ctrl+j=csi:J
```

**Why CSI Fails:**

1. `csi:J` means "clear from cursor to end of screen" (VT100 command)
2. Claude Code doesn't interpret this as "submit input"
3. Line Feed must be a **single raw byte** (0x0a), not an escape sequence

**ASCII Insight:**

- Enter key sends Carriage Return (0x0d), often mapped to Line Feed (0x0a) by terminal
- Ctrl+J directly produces Line Feed (0x0a) in ASCII
- Applications treat both as "newline" for input submission

**Testing:**

```bash
# In Claude Code interactive prompt
# Type a message, then press Ctrl+J
# Expected: Message is submitted (same as pressing Enter)

# Alternative test with cat
cat
# Type text, press Ctrl+J
# Expected: Text is echoed with newline (same as Enter)
```

## Ghostty Key Encoder API

For advanced use cases, Ghostty provides a C API for programmatic key encoding.

### Basic Usage

```c
#include <ghostty/vt.h>

// 1. Create key encoder
GhosttyKeyEncoder encoder;
GhosttyResult result = ghostty_key_encoder_new(NULL, &encoder);

// 2. Configure Kitty keyboard protocol (optional)
uint8_t kitty_flags = GHOSTTY_KEY_ALL;
ghostty_key_encoder_setopt(encoder,
                            GHOSTTY_KEY_ENCODER_OPT_KITTY_FLAGS,
                            &kitty_flags);

// 3. Create key event
GhosttyKeyEvent event;
ghostty_key_event_new(NULL, &event);
ghostty_key_event_set_action(event, GHOSTTY_KEY_ACTION_PRESS);
ghostty_key_event_set_key(event, GHOSTTY_KEY_C);
ghostty_key_event_set_mods(event, GHOSTTY_MODS_CTRL);
ghostty_key_event_set_text(event, "\x03", 1);

// 4. Encode to buffer
size_t required = 0;
ghostty_key_encoder_encode(encoder, event, NULL, 0, &required);

char *buf = malloc(required);
size_t written = 0;
ghostty_key_encoder_encode(encoder, event, buf, required, &written);

// 5. Send to PTY
write(pty_fd, buf, written);

// 6. Cleanup
free(buf);
ghostty_key_event_free(event);
ghostty_key_encoder_free(encoder);
```

### Key Event Properties

| Property  | Setter Function                               | Description                       |
| --------- | --------------------------------------------- | --------------------------------- |
| Action    | `ghostty_key_event_set_action()`              | Press, release, repeat            |
| Key       | `ghostty_key_event_set_key()`                 | Virtual key code (GHOSTTY*KEY*\*) |
| Modifiers | `ghostty_key_event_set_mods()`                | Ctrl, Shift, Alt, Super           |
| Text      | `ghostty_key_event_set_text()`                | UTF-8 character produced          |
| Codepoint | `ghostty_key_event_set_unshifted_codepoint()` | Unshifted codepoint for Kitty KKP |

### Encoder Options

| Option                                           | Type                 | Description                      |
| ------------------------------------------------ | -------------------- | -------------------------------- |
| `GHOSTTY_KEY_ENCODER_OPT_KITTY_FLAGS`            | `uint8_t`            | Kitty keyboard protocol features |
| `GHOSTTY_KEY_ENCODER_OPT_CURSOR_KEY_APPLICATION` | `bool`               | Cursor key application mode      |
| `GHOSTTY_KEY_ENCODER_OPT_MACOS_OPTION_AS_ALT`    | `GhosttyOptionAsAlt` | macOS Option key behavior        |

### Kitty Keyboard Protocol (KKP)

Ghostty supports the Kitty keyboard protocol for enhanced key event reporting:

**Features (flags):**

- `GHOSTTY_KEY_DISAMBIGUATE` - Distinguish left/right modifiers
- `GHOSTTY_KEY_REPORT_EVENTS` - Report press/release separately
- `GHOSTTY_KEY_REPORT_ALTERNATE_KEYS` - Report unshifted codepoints
- `GHOSTTY_KEY_REPORT_ALL_KEYS` - Report all key events (even unmodified)
- `GHOSTTY_KEY_ALL` - Enable all features

**Example Sequence:**

```
ESC [ 57442 ; 5 : 3 u
```

Breakdown:

- `ESC [` - CSI introducer
- `57442` - Unicode codepoint (Ctrl key in Kitty encoding)
- `;` - Separator
- `5` - Modifiers (Ctrl = 0x02, plus 1 for event type, so 0x02 + 0x04 = 0x06, reported as 5?)
- `:` - Sub-parameter separator
- `3` - Event type (3 = release)
- `u` - CSI u format (Unicode)

**Configuration:**

```ini
# Enable Kitty keyboard protocol in Ghostty config
# (Not commonly needed for basic keybindings)
```

## Practical Examples

### Example 1: Tmux Prefix (Ctrl+A)

**Scenario:** Use Ctrl+A as tmux prefix instead of Ctrl+B.

**Config:**

```ini
# Send Ctrl+A to shell/tmux
keybind = ctrl+a=text:\x01
```

**Why `text:`?**

- Tmux expects raw `0x01` byte
- CSI sequences would not be interpreted as prefix

### Example 2: Vim Navigation in Copy Mode

**Scenario:** Use j/k for scrolling in Ghostty's copy mode.

**Config:**

```ini
# In copy mode, j/k send cursor movement CSI sequences
# (Built-in Ghostty behavior, usually no config needed)
```

**If custom:**

```ini
keybind = j=csi:B  # Cursor down
keybind = k=csi:A  # Cursor up
```

**Why `csi:`?**

- Copy mode interprets CSI sequences for navigation
- Raw bytes would be inserted as text

### Example 3: Clear Screen (Ctrl+L)

**Scenario:** Clear terminal screen.

**Config:**

```ini
# Send Form Feed (Ctrl+L)
keybind = ctrl+l=text:\x0c
```

**Why `text:`?**

- Shell interprets `0x0c` as "clear screen"
- CSI `2J` would also work but `text:` is simpler

**Alternative with CSI:**

```ini
keybind = ctrl+l=csi:2J
```

Both work, but `text:\x0c` is traditional Unix behavior.

## Debugging Keybindings

### Method 1: `cat` Test

```bash
# Start cat (echoes all input)
cat

# Press your keybinding (e.g., Ctrl+Z)
# Observe output:
^Z  # For text:\x1a (raw byte displayed as ^Z)
```

### Method 2: `xxd` Hex Dump

```bash
# Capture keypress to file
cat > /tmp/keypress.txt
# Press keybinding, then Ctrl+D

# View hex dump
xxd /tmp/keypress.txt
# Example output for Ctrl+Z:
00000000: 1a                                       .
```

### Method 3: Ghostty Debug Logs

```bash
# Run Ghostty with verbose logging
ghostty --verbose

# Press keybinding and check logs for:
# - "Sending raw bytes: 0x1a"
# - "Sending CSI sequence: ESC [ A"
```

### Method 4: Verify with Shell

```bash
# Test job control (Ctrl+Z)
sleep 100
# Press Ctrl+Z
# Expected: [1]+ Stopped

# Test Line Feed (Ctrl+J)
echo "test" | cat
# Press Ctrl+J
# Expected: Newline inserted
```

## Common Pitfalls

### Pitfall 1: Using CSI for Signals

```ini
# ❌ Wrong: Ctrl+C won't interrupt
keybind = ctrl+c=csi:...

# ✅ Correct: Send raw SIGINT byte
keybind = ctrl+c=text:\x03
```

**Error:** Shell expects raw byte `0x03` for interrupt signal, not an escape sequence.

### Pitfall 2: Hex Value Typos

```ini
# ❌ Wrong: Invalid hex (0x1A is decimal 26, but typo as 0x1B)
keybind = ctrl+z=text:\x1b

# ✅ Correct: 0x1a is Ctrl+Z (SUB)
keybind = ctrl+z=text:\x1a
```

**Error:** `0x1b` is ESC, not Ctrl+Z. Always verify with ASCII table.

### Pitfall 3: Overriding Default Bindings Unintentionally

```ini
# If disable-default-keybinds = true, you must define ALL keybindings
disable-default-keybinds = false  # Keep defaults unless you know what you're doing
```

**Error:** Disabling defaults breaks common keys (arrows, Enter, etc.) unless redefined.

### Pitfall 4: Forgetting Backslash in Hex

```ini
# ❌ Wrong: Missing backslash (literal "x1a" string)
keybind = ctrl+z=text:x1a

# ✅ Correct: Backslash indicates hex escape
keybind = ctrl+z=text:\x1a
```

**Error:** Without `\`, Ghostty interprets as literal string "x1a", not byte 0x1a.

## Best Practices

### 1. Always Comment Hex Values

```ini
# ✅ Good: Explains what 0x1a means
keybind = ctrl+z=text:\x1a  # SIGTSTP (suspend)

# ❌ Bad: Unclear purpose
keybind = ctrl+z=text:\x1a
```

### 2. Verify with ASCII Table

Before using `text:`, confirm hex value:

| Key | Ctrl+Key | Hex    | Name |
| --- | -------- | ------ | ---- |
| A   | Ctrl+A   | `\x01` | SOH  |
| C   | Ctrl+C   | `\x03` | ETX  |
| J   | Ctrl+J   | `\x0a` | LF   |
| Z   | Ctrl+Z   | `\x1a` | SUB  |

### 3. Test Before Committing

```bash
# Always test keybindings interactively
ghostty

# Test job control
sleep 100
# Press Ctrl+Z → [1]+ Stopped

# Test Claude Code submit
# Open Claude Code session
# Press Ctrl+J → Input submitted
```

### 4. Use `csi:` Only When Needed

```ini
# ✅ Good: Raw byte for signal
keybind = ctrl+z=text:\x1a

# ❌ Overkill: CSI not needed here
# keybind = ctrl+z=csi:...
```

**Rule of Thumb:** If it's a control character (0x00-0x1F), use `text:`. If it's a terminal command (cursor, color), use `csi:`.

## References

- **ASCII Control Characters**: <https://en.wikipedia.org/wiki/ASCII#Control_characters>
- **VT100 Control Sequences**: <https://vt100.net/docs/vt100-ug/chapter3.html>
- **Kitty Keyboard Protocol**: <https://sw.kovidgoyal.net/kitty/keyboard-protocol/>
- **Ghostty Key Encoder API**: <https://github.com/ghostty-org/ghostty> (see `include/ghostty/vt.h`)
- **ECMA-48 CSI Sequences**: <https://www.ecma-international.org/publications-and-standards/standards/ecma-48>
