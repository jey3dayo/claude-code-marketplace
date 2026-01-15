# GitHub Issue Commands

Comprehensive guide to managing GitHub issues using gh CLI.

## Overview

GitHub Issues are a powerful tool for tracking bugs, enhancements, and tasks. The gh CLI provides commands to create, list, view, edit, close, and comment on issues without leaving the terminal.

## Basic Commands

### List Issues

Show all issues in the repository:

```bash
gh issue list
```

**Output Example**:

```
#123  Login fails with special characters       bug         about 1 hour ago
#122  Add dark mode support                     enhancement about 2 hours ago
#121  Improve documentation for API endpoints   docs        about 3 hours ago
```

**Filter by State**:

```bash
gh issue list --state open
gh issue list --state closed
gh issue list --state all
```

**Filter by Label**:

```bash
gh issue list --label bug
gh issue list --label "help wanted"
gh issue list --label bug,priority-high
```

**Filter by Assignee**:

```bash
gh issue list --assignee @me
gh issue list --assignee username
gh issue list --assignee ""  # Unassigned issues
```

**Filter by Author**:

```bash
gh issue list --author @me
gh issue list --author username
```

**Limit Results**:

```bash
gh issue list --limit 20
```

### View Issue Details

Display detailed information about a specific issue:

```bash
gh issue view <issue-number>
```

**Examples**:

```bash
gh issue view 123
gh issue view 123 --comments  # Include comments
gh issue view 123 --web  # Open in browser
```

**Output Example**:

```
Login fails with special characters #123
Open • user123 opened about 1 hour ago • 3 comments

Labels: bug, priority-high
Assignees: developer1, developer2
Milestone: v2.0

  When users try to log in with email addresses containing special characters
  like + or -, the login fails with a validation error.

  Steps to reproduce:
  1. Create account with email: user+test@example.com
  2. Try to log in
  3. See error: "Invalid email format"

  Expected: Login should succeed
  Actual: Login fails

View this issue on GitHub: https://github.com/...
```

### Create Issue

Create a new issue:

```bash
gh issue create
```

This opens an interactive prompt for:

- Title
- Body (opens editor)
- Assignees
- Labels
- Projects
- Milestone

**Non-Interactive Creation**:

```bash
gh issue create --title "Bug: Login fails" --body "Description here"
```

**With Labels and Assignees**:

```bash
gh issue create \
  --title "Add dark mode support" \
  --body "We should add a dark mode option" \
  --label enhancement \
  --assignee username
```

**From Template**:

```bash
gh issue create --template bug_report.md
```

**With Editor**:

```bash
# Opens editor for body content
gh issue create --title "Feature: Add search" --body-file -
```

### Close Issue

Close an issue:

```bash
gh issue close <issue-number>
```

**Examples**:

```bash
gh issue close 123
gh issue close 123 --reason "completed"
gh issue close 123 --reason "not planned"
```

**With Comment**:

```bash
gh issue close 123 --comment "Fixed in PR #124"
```

### Reopen Issue

Reopen a closed issue:

```bash
gh issue reopen <issue-number>
```

**Example**:

```bash
gh issue reopen 123
gh issue reopen 123 --comment "Bug still occurs in v2.0"
```

### Edit Issue

Modify issue properties:

```bash
gh issue edit <issue-number>
```

**Examples**:

```bash
# Edit title
gh issue edit 123 --title "New title"

# Add labels
gh issue edit 123 --add-label bug,priority-high

# Remove labels
gh issue edit 123 --remove-label wontfix

# Add assignees
gh issue edit 123 --add-assignee user1,user2

# Remove assignees
gh issue edit 123 --remove-assignee user3

# Set milestone
gh issue edit 123 --milestone "v2.0"

# Remove milestone
gh issue edit 123 --milestone ""

# Add to project
gh issue edit 123 --add-project "Backend"

# Update body
gh issue edit 123 --body "New description"
```

### Comment on Issue

Add a comment to an issue:

```bash
gh issue comment <issue-number>
```

**Examples**:

```bash
# Interactive comment
gh issue comment 123

# Non-interactive
gh issue comment 123 --body "This looks like a duplicate of #100"

# From file
gh issue comment 123 --body-file comment.md

# From editor
gh issue comment 123 --editor
```

### Delete Issue

Delete an issue (requires admin permissions):

```bash
gh issue delete <issue-number>
```

**Example**:

```bash
gh issue delete 123
gh issue delete 123 --confirm  # Skip confirmation
```

## Advanced Usage

### Search Issues

Use GitHub's search syntax:

```bash
gh issue list --search "is:open label:bug assignee:@me"
gh issue list --search "is:issue is:open sort:updated-desc"
gh issue list --search "author:username created:>2024-01-01"
```

**Common Search Queries**:

```bash
# Bugs assigned to me
gh issue list --search "is:open label:bug assignee:@me"

# Issues I created
gh issue list --search "is:open author:@me"

# High priority issues
gh issue list --search "is:open label:priority-high"

# Issues with no assignee
gh issue list --search "is:open no:assignee"

# Recently updated issues
gh issue list --search "is:open sort:updated-desc"

# Issues in milestone
gh issue list --search "is:open milestone:v2.0"
```

### Pin/Unpin Issue

Pin an issue to the repository (shows at top):

```bash
gh issue pin <issue-number>
gh issue unpin <issue-number>
```

### Transfer Issue

Move an issue to another repository:

```bash
gh issue transfer <issue-number> <destination-repo>
```

**Example**:

```bash
gh issue transfer 123 owner/other-repo
```

### JSON Output

Get machine-readable output:

```bash
gh issue list --json number,title,labels,state
gh issue view 123 --json title,body,author,createdAt
```

**Example Output**:

```json
[
  {
    "number": 123,
    "title": "Login fails with special characters",
    "labels": [{ "name": "bug" }, { "name": "priority-high" }],
    "state": "OPEN"
  }
]
```

**With jq Processing**:

```bash
gh issue list --json number,labels \
  | jq '.[] | select(.labels[].name == "bug") | .number'
```

### Bulk Operations

**Close Multiple Issues**:

```bash
for issue in 120 121 122; do
  gh issue close $issue --comment "Fixed in v2.0"
done
```

**Label Multiple Issues**:

```bash
gh issue list --json number --label needs-triage -q '.[].number' \
  | xargs -I {} gh issue edit {} --add-label reviewed
```

## Issue Templates

### Using Templates

If repository has issue templates:

```bash
gh issue create --template bug_report.md
gh issue create --template feature_request.md
```

### List Available Templates

```bash
gh api repos/:owner/:repo/issues/templates
```

## Common Scenarios

### Scenario 1: Report a Bug

```bash
gh issue create \
  --title "Bug: Login fails with special characters" \
  --body "$(cat <<'EOF'
## Description
Login fails when email contains special characters like + or -

## Steps to Reproduce
1. Create account with email: user+test@example.com
2. Try to log in
3. See error: "Invalid email format"

## Expected Behavior
Login should succeed

## Actual Behavior
Login fails with validation error

## Environment
- Browser: Chrome 120
- OS: macOS 14.0
EOF
)" \
  --label bug \
  --assignee @me
```

### Scenario 2: Request a Feature

```bash
gh issue create \
  --title "Feature: Add dark mode support" \
  --body "We should add a dark mode option to improve UX" \
  --label enhancement
```

### Scenario 3: Triage Issues

```bash
# List untriaged issues
gh issue list --label needs-triage

# Review and label
gh issue view 123
gh issue edit 123 --add-label bug --remove-label needs-triage --assignee developer1
```

### Scenario 4: Close Fixed Issues

```bash
# After merging PR #124
gh issue close 123 --comment "Fixed in PR #124"
```

### Scenario 5: Find My Tasks

```bash
# Issues assigned to me
gh issue list --assignee @me --state open

# My open issues sorted by priority
gh issue list --search "is:open assignee:@me sort:label-asc"
```

### Scenario 6: Sprint Planning

```bash
# Add issues to milestone
for issue in 120 121 122; do
  gh issue edit $issue --milestone "Sprint 10"
done

# List sprint issues
gh issue list --milestone "Sprint 10"
```

## Best Practices

### 1. Use Descriptive Titles

**Good**:

```bash
gh issue create --title "Bug: Login fails with special characters in email"
```

**Avoid**:

```bash
gh issue create --title "Login problem"
```

### 2. Provide Context in Body

Include:

- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details
- Screenshots/logs (if applicable)

### 3. Use Labels Consistently

```bash
# Bug report
gh issue create --label bug,priority-high

# Feature request
gh issue create --label enhancement,needs-discussion

# Documentation
gh issue create --label docs,good-first-issue
```

### 4. Link Related Issues

```bash
gh issue comment 123 --body "Related to #100 and #101"
gh issue comment 123 --body "Duplicate of #100"
```

### 5. Close with Reference

Always reference what fixed the issue:

```bash
gh issue close 123 --comment "Fixed in PR #124"
gh issue close 123 --comment "Fixed in commit abc1234"
```

### 6. Use Projects for Organization

```bash
gh issue edit 123 --add-project "Backend Refactor"
```

## Integration with Other Tools

### With PR Operations

**Reference Issues in PRs**:

```bash
gh pr create --title "Fix: Login validation" --body "Fixes #123"
```

**Check Issue Status in PRs**:

```bash
gh pr view 124 --json body | jq -r '.body' | grep -o '#[0-9]\+'
```

### With Git Operations

**Create Issue from Commit**:

```bash
git log --oneline -1  # Get last commit message
gh issue create --title "$(git log --oneline -1 | cut -d' ' -f2-)"
```

### With Notifications

**Monitor New Issues**:

```bash
watch -n 60 'gh issue list --state open --limit 5'
```

## Labels

### Common Label Patterns

**Type Labels**:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `docs` - Documentation improvements
- `question` - Further information requested

**Priority Labels**:

- `priority-high` - Urgent issue
- `priority-medium` - Important issue
- `priority-low` - Low priority

**Status Labels**:

- `needs-triage` - Needs initial review
- `needs-discussion` - Needs team discussion
- `in-progress` - Being worked on
- `blocked` - Blocked by dependencies

**Effort Labels**:

- `good-first-issue` - Easy for newcomers
- `help-wanted` - Looking for contributors

### List Repository Labels

```bash
gh label list
```

### Create Label

```bash
gh label create "priority-high" --description "High priority" --color "ff0000"
```

## Milestones

### List Milestones

```bash
gh api repos/:owner/:repo/milestones
```

### Create Milestone

```bash
gh api repos/:owner/:repo/milestones -f title="v2.0" -f due_on="2024-12-31T00:00:00Z"
```

### Issues in Milestone

```bash
gh issue list --milestone "v2.0"
```

## Error Handling

### Common Errors

**Error**: "issue not found"

```bash
# Solution: Verify issue number
gh issue list
```

**Error**: "permission denied"

```bash
# Solution: Check repository access
gh auth status
gh repo view
```

**Error**: "label does not exist"

```bash
# Solution: List available labels
gh label list
```

### Troubleshooting Steps

1. **Verify gh CLI is authenticated**:

   ```bash
   gh auth status
   ```

2. **Check repository access**:

   ```bash
   gh repo view
   ```

3. **Verify issue exists**:

   ```bash
   gh issue list --state all
   ```

## Quick Reference

| Task           | Command                                        |
| -------------- | ---------------------------------------------- |
| List issues    | `gh issue list`                                |
| View issue     | `gh issue view <number>`                       |
| Create issue   | `gh issue create`                              |
| Edit issue     | `gh issue edit <number>`                       |
| Close issue    | `gh issue close <number>`                      |
| Reopen issue   | `gh issue reopen <number>`                     |
| Comment        | `gh issue comment <number>`                    |
| Add label      | `gh issue edit <number> --add-label <label>`   |
| Assign user    | `gh issue edit <number> --add-assignee <user>` |
| Set milestone  | `gh issue edit <number> --milestone <name>`    |
| Pin issue      | `gh issue pin <number>`                        |
| Transfer issue | `gh issue transfer <number> <repo>`            |
| Delete issue   | `gh issue delete <number>`                     |

## References

- [GitHub CLI Manual - Issue Commands](https://cli.github.com/manual/gh_issue)
- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub Search Syntax](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)
- [Issue Templates Guide](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
