#!/usr/bin/env bash
# Ghostty Configuration Validator
# Validates keybindings, tests shell integration, and verifies theme setup

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config file location
CONFIG_FILE="${HOME}/.config/ghostty/config"

# Print colored output
print_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
print_success() { echo -e "${GREEN}[OK]${NC} $*"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }
print_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Check if Ghostty is installed
check_ghostty_installed() {
    print_info "Checking Ghostty installation..."
    if command -v ghostty >/dev/null 2>&1; then
        local version
        version=$(ghostty --version 2>&1 | head -n 1)
        print_success "Ghostty installed: $version"
        return 0
    else
        print_error "Ghostty not found in PATH"
        return 1
    fi
}

# Check if config file exists
check_config_exists() {
    print_info "Checking config file..."
    if [[ -f "$CONFIG_FILE" ]]; then
        print_success "Config file found: $CONFIG_FILE"
        return 0
    else
        print_error "Config file not found: $CONFIG_FILE"
        print_info "Create one using the template in assets/config-template.ini"
        return 1
    fi
}

# Validate keybindings syntax
validate_keybindings() {
    print_info "Validating keybindings syntax..."
    local errors=0

    # Check for Ctrl+Z (SIGTSTP)
    if grep -q "keybind.*ctrl+z.*text:\\\\x1a" "$CONFIG_FILE"; then
        print_success "Ctrl+Z (SIGTSTP) configured correctly"
    else
        print_warning "Ctrl+Z may not be configured for shell job control"
        ((errors++))
    fi

    # Check for Ctrl+J (Line Feed)
    if grep -q "keybind.*ctrl+j.*text:\\\\x0a" "$CONFIG_FILE"; then
        print_success "Ctrl+J (Line Feed) configured correctly"
    else
        print_warning "Ctrl+J may not be configured for Claude Code submit"
        ((errors++))
    fi

    # Check for leader key bindings (sequence notation)
    if grep -q "keybind.*ctrl+x>" "$CONFIG_FILE"; then
        print_success "Leader key bindings (ctrl+x>) found"
    else
        print_warning "No leader key bindings found (expected ctrl+x>)"
        ((errors++))
    fi

    # Check for invalid hex escapes (missing backslash)
    if grep -q "keybind.*text:x[0-9a-fA-F]" "$CONFIG_FILE"; then
        print_error "Invalid hex escape found (missing backslash before x)"
        print_info "Use text:\\xNN instead of text:xNN"
        ((errors++))
    fi

    if [[ $errors -eq 0 ]]; then
        print_success "All keybindings validated"
        return 0
    else
        print_warning "$errors potential issues found in keybindings"
        return 1
    fi
}

# Validate theme configuration
validate_theme() {
    print_info "Validating theme configuration..."

    if grep -q "^theme.*=" "$CONFIG_FILE"; then
        local theme_name
        theme_name=$(grep "^theme.*=" "$CONFIG_FILE" | head -n 1 | cut -d= -f2 | xargs)
        print_success "Theme configured: $theme_name"

        # Verify theme exists (if ghostty supports listing themes)
        if command -v ghostty >/dev/null 2>&1 && ghostty +list-themes >/dev/null 2>&1; then
            if ghostty +list-themes | grep -qi "$theme_name"; then
                print_success "Theme '$theme_name' is available"
            else
                print_warning "Theme '$theme_name' not found in available themes"
                print_info "Run 'ghostty +list-themes' to see all themes"
            fi
        fi
    else
        print_warning "No theme configured (using default)"
    fi

    # Check background opacity
    if grep -q "^background-opacity" "$CONFIG_FILE"; then
        local opacity
        opacity=$(grep "^background-opacity" "$CONFIG_FILE" | head -n 1 | cut -d= -f2 | xargs)
        print_success "Background opacity: $opacity"
    fi

    return 0
}

# Validate font configuration
validate_font() {
    print_info "Validating font configuration..."
    local fonts_found=0

    while IFS= read -r line; do
        if [[ $line =~ ^font-family[[:space:]]*=[[:space:]]*\"(.+)\" ]]; then
            local font_name="${BASH_REMATCH[1]}"
            print_info "Font configured: $font_name"
            ((fonts_found++))

            # Check if font is installed (macOS only)
            if [[ "$(uname)" == "Darwin" ]]; then
                if fc-list 2>/dev/null | grep -qi "$font_name"; then
                    print_success "Font '$font_name' is installed"
                else
                    print_warning "Font '$font_name' may not be installed"
                fi
            fi
        fi
    done < "$CONFIG_FILE"

    if [[ $fonts_found -eq 0 ]]; then
        print_warning "No fonts configured (using system default)"
    else
        print_success "$fonts_found font(s) configured"
    fi

    return 0
}

# Test shell integration (Ctrl+Z)
test_shell_integration() {
    print_info "Testing shell integration..."
    print_info "Manual test required:"
    echo "  1. Open Ghostty terminal"
    echo "  2. Run: sleep 100"
    echo "  3. Press Ctrl+Z"
    echo "  4. Expected: [1]+ Stopped sleep 100"
    echo "  5. Run: jobs"
    echo "  6. Expected: [1]+  Stopped  sleep 100"
    echo "  7. Run: fg (to resume)"
    print_info "If Ctrl+Z doesn't suspend, check keybind = ctrl+z=text:\\x1a in config"
}

# Test Claude Code submit (Ctrl+J)
test_claude_code_submit() {
    print_info "Testing Claude Code submit (Ctrl+J)..."
    print_info "Manual test required:"
    echo "  1. Open Claude Code in Ghostty terminal"
    echo "  2. Type a message"
    echo "  3. Press Ctrl+J"
    echo "  4. Expected: Message is submitted (same as pressing Enter)"
    print_info "If Ctrl+J doesn't submit, check keybind = ctrl+j=text:\\x0a in config"
}

# Generate test report
generate_report() {
    print_info "Configuration validation complete"
    echo ""
    echo "Summary:"
    echo "  Config file: $CONFIG_FILE"
    echo "  Ghostty version: $(ghostty --version 2>&1 | head -n 1 || echo "N/A")"
    echo ""
    echo "Next steps:"
    echo "  1. Test shell job control (Ctrl+Z) - see manual test above"
    echo "  2. Test Claude Code submit (Ctrl+J) - see manual test above"
    echo "  3. Verify GPU acceleration (smooth scrolling)"
    echo "  4. Check theme consistency with WezTerm"
    echo ""
    echo "For detailed documentation, see:"
    echo "  - SKILL.md (overview)"
    echo "  - references/key-encoding.md (CSI vs text:)"
    echo "  - references/wezterm-comparison.md (WezTerm migration)"
}

# Main validation flow
main() {
    echo "========================================"
    echo "Ghostty Configuration Validator"
    echo "========================================"
    echo ""

    local exit_code=0

    check_ghostty_installed || exit_code=$?
    check_config_exists || exit_code=$?

    if [[ -f "$CONFIG_FILE" ]]; then
        validate_keybindings || exit_code=$?
        validate_theme || exit_code=$?
        validate_font || exit_code=$?
    fi

    echo ""
    echo "========================================"
    echo "Manual Tests"
    echo "========================================"
    test_shell_integration
    echo ""
    test_claude_code_submit
    echo ""
    echo "========================================"
    generate_report

    exit $exit_code
}

main "$@"
