# GitHub Actions Workflow Commands

Comprehensive guide to managing GitHub Actions workflows using gh CLI.

## Overview

GitHub Actions workflows are automated processes defined in YAML files (`.github/workflows/*.yml`). The gh CLI provides commands to list, view, run, and monitor these workflows without leaving the terminal.

## Basic Commands

### List Workflows

Show all workflows in the repository:

```bash
gh workflow list
```

**Output Example**:

```
NAME              STATE   ID
CI                active  12345678
Deploy to Prod    active  23456789
Code Quality      active  34567890
```

**With Additional Info**:

```bash
gh workflow list --all  # Include disabled workflows
```

### View Workflow Details

Display detailed information about a specific workflow:

```bash
gh workflow view <workflow-name-or-id>
```

**Examples**:

```bash
gh workflow view ci.yml
gh workflow view "Code Quality"
gh workflow view 12345678
```

**Output Example**:

```
CI - ci.yml
ID: 12345678
State: active

Total runs 150
Recent runs:
✓  feat: Add user auth  main  push  10m ago
✓  fix: Login bug       main  push  1h ago
✗  refactor: API        main  push  2h ago
```

**With Web View**:

```bash
gh workflow view ci.yml --web  # Open in browser
```

### Run Workflow

Manually trigger a workflow (requires `workflow_dispatch` event):

```bash
gh workflow run <workflow-name-or-id>
```

**Examples**:

```bash
gh workflow run deploy.yml
gh workflow run "Deploy to Prod"
```

**With Branch Specification**:

```bash
gh workflow run deploy.yml --ref staging
gh workflow run deploy.yml --ref v1.2.3
```

**With Input Parameters** (for workflows with inputs):

```bash
gh workflow run deploy.yml -f environment=production -f version=1.2.3
```

### Enable/Disable Workflows

Control workflow activation:

```bash
gh workflow enable <workflow-name-or-id>
gh workflow disable <workflow-name-or-id>
```

**Examples**:

```bash
gh workflow enable ci.yml
gh workflow disable "Old Deploy Script"
```

## Workflow Runs

### List Workflow Runs

View recent executions of a workflow:

```bash
gh run list --workflow=<workflow-name>
```

**Examples**:

```bash
gh run list --workflow=ci.yml
gh run list --workflow=ci.yml --limit=20
```

**Output Example**:

```
STATUS  TITLE                    WORKFLOW  BRANCH  EVENT  ID          ELAPSED  AGE
✓       feat: Add user auth      CI        main    push   9876543210  3m30s    10m
✓       fix: Login bug           CI        main    push   9876543209  2m45s    1h
✗       refactor: API            CI        main    push   9876543208  1m20s    2h
```

**Filter by Status**:

```bash
gh run list --workflow=ci.yml --status=failure
gh run list --workflow=ci.yml --status=success
gh run list --workflow=ci.yml --status=in_progress
```

**Filter by Event**:

```bash
gh run list --workflow=ci.yml --event=push
gh run list --workflow=ci.yml --event=pull_request
gh run list --workflow=ci.yml --event=workflow_dispatch
```

### View Run Details

Inspect a specific workflow run:

```bash
gh run view <run-id>
```

**Examples**:

```bash
gh run view 9876543210
gh run view --log  # Show logs
gh run view --log-failed  # Show only failed job logs
```

**Output Example**:

```
✓ main CI · 9876543210
Triggered via push about 10 minutes ago

JOBS
✓ build (3m15s)
✓ test (2m30s)
✓ lint (1m45s)

For more information about a job, try: gh run view --job=<job-id>
✓ Run completed in 3m30s
```

**Open in Browser**:

```bash
gh run view 9876543210 --web
```

### Watch Run Progress

Monitor a running workflow in real-time:

```bash
gh run watch <run-id>
```

**Example**:

```bash
gh run watch 9876543210
```

**Output** (Updates Every Few Seconds):

```
Refreshing run status every 3 seconds. Press Ctrl+C to quit.

✓ main CI · 9876543210
Triggered via push 2 minutes ago

JOBS
✓ build (ID 123456)
  ✓ Set up job
  ✓ Checkout code
  ✓ Setup Node.js
  * Install dependencies  # Currently running
  - Run tests
  - Build
  - Upload artifacts

Run is still in progress...
```

### Rerun Workflow

Restart a failed or completed workflow:

```bash
gh run rerun <run-id>
```

**Examples**:

```bash
gh run rerun 9876543210
gh run rerun 9876543210 --failed  # Rerun only failed jobs
```

### Cancel Run

Stop a running workflow:

```bash
gh run cancel <run-id>
```

**Example**:

```bash
gh run cancel 9876543210
```

### Download Artifacts

Retrieve artifacts from a workflow run:

```bash
gh run download <run-id>
```

**Examples**:

```bash
gh run download 9876543210
gh run download 9876543210 --name test-results
gh run download 9876543210 --dir ./artifacts
```

## Advanced Usage

### Workflow Run Logs

View logs for a specific run:

```bash
gh run view <run-id> --log
```

**With Job Filter**:

```bash
gh run view 9876543210 --job=<job-id> --log
```

**Save Logs to File**:

```bash
gh run view 9876543210 --log > workflow-logs.txt
```

### JSON Output

Get machine-readable output:

```bash
gh workflow list --json name,state,id
gh run list --workflow=ci.yml --json status,conclusion,headBranch,event,createdAt
```

**Example Output**:

```json
[
  {
    "name": "CI",
    "state": "active",
    "id": 12345678
  }
]
```

**With jq Processing**:

```bash
gh run list --workflow=ci.yml --json status,conclusion \
  | jq '.[] | select(.status == "completed" and .conclusion == "failure")'
```

### Workflow Status Checks

Check if a workflow passed for a specific commit:

```bash
gh api repos/:owner/:repo/commits/:sha/check-runs \
  --jq '.check_runs[] | select(.name == "CI") | .conclusion'
```

## Common Scenarios

### Scenario 1: Check CI Status

```bash
# List recent runs
gh run list --workflow=ci.yml --limit=5

# View latest run
gh run view $(gh run list --workflow=ci.yml --limit=1 --json databaseId -q '.[0].databaseId')
```

### Scenario 2: Trigger Deployment

```bash
# Run deploy workflow with parameters
gh workflow run deploy.yml \
  --ref main \
  -f environment=production \
  -f version=1.2.3

# Watch the deployment
gh run watch $(gh run list --workflow=deploy.yml --limit=1 --json databaseId -q '.[0].databaseId')
```

### Scenario 3: Debug Failed Workflow

```bash
# List failed runs
gh run list --workflow=ci.yml --status=failure --limit=10

# View logs of the latest failed run
FAILED_RUN=$(gh run list --workflow=ci.yml --status=failure --limit=1 --json databaseId -q '.[0].databaseId')
gh run view $FAILED_RUN --log-failed
```

### Scenario 4: Monitor All Workflows

```bash
# Check status of all workflows
for workflow in $(gh workflow list --json name -q '.[].name'); do
  echo "=== $workflow ==="
  gh run list --workflow="$workflow" --limit=1
done
```

### Scenario 5: Cleanup Old Runs

```bash
# List old runs (older than 30 days)
gh run list --workflow=ci.yml --json databaseId,createdAt \
  | jq '.[] | select((now - (.createdAt | fromdateiso8601)) > 2592000) | .databaseId' \
  | xargs -I {} gh api -X DELETE repos/:owner/:repo/actions/runs/{}
```

## Best Practices

### 1. Always Use Workflow Names or IDs

**Good**:

```bash
gh workflow view ci.yml
gh workflow run deploy.yml
```

**Avoid**:

```bash
gh workflow view "some random string"
```

### 2. Monitor Long-Running Workflows

For deployments or long processes:

```bash
gh workflow run deploy.yml && gh run watch $(gh run list --workflow=deploy.yml --limit=1 --json databaseId -q '.[0].databaseId')
```

### 3. Use JSON Output for Scripting

When integrating with scripts:

```bash
LATEST_RUN=$(gh run list --workflow=ci.yml --limit=1 --json databaseId,conclusion -q '.[0]')
STATUS=$(echo $LATEST_RUN | jq -r '.conclusion')
```

### 4. Check Workflow State Before Running

Verify workflow is enabled:

```bash
STATE=$(gh workflow view ci.yml --json state -q '.state')
if [ "$STATE" = "active" ]; then
  gh workflow run ci.yml
fi
```

### 5. Use --ref for Branch-Specific Runs

Always specify branch when running workflows:

```bash
gh workflow run ci.yml --ref staging
```

## Error Handling

### Common Errors

**Error**: "workflow not found"

```bash
# Solution: List all workflows to find correct name
gh workflow list
```

**Error**: "workflow_dispatch event not configured"

```bash
# Solution: Check workflow YAML has workflow_dispatch trigger
# .github/workflows/deploy.yml must have:
# on:
#   workflow_dispatch:
```

**Error**: "run not found"

```bash
# Solution: Verify run ID exists
gh run list --workflow=ci.yml --limit=10
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

3. **Verify workflow exists**:

   ```bash
   gh workflow list
   ```

4. **Check workflow syntax** (if workflow won't run):

   ```bash
   # Validate YAML syntax
   cat .github/workflows/ci.yml | yamllint -
   ```

## Integration with Other Tools

### With PR Operations

```bash
# Check CI status for a PR
gh pr checks <pr-number>

# View CI details
gh pr view <pr-number> --json statusCheckRollup
```

### With Git Operations

```bash
# Get workflow status for current commit
gh api repos/:owner/:repo/commits/$(git rev-parse HEAD)/check-runs
```

### With Notifications

```bash
# Monitor workflow and notify on completion
gh run watch $RUN_ID && osascript -e 'display notification "Workflow completed" with title "GitHub Actions"'
```

## Quick Reference

| Task               | Command                         |
| ------------------ | ------------------------------- |
| List workflows     | `gh workflow list`              |
| View workflow      | `gh workflow view <name>`       |
| Run workflow       | `gh workflow run <name>`        |
| List runs          | `gh run list --workflow=<name>` |
| View run           | `gh run view <id>`              |
| Watch run          | `gh run watch <id>`             |
| View logs          | `gh run view <id> --log`        |
| Rerun workflow     | `gh run rerun <id>`             |
| Cancel run         | `gh run cancel <id>`            |
| Download artifacts | `gh run download <id>`          |
| Enable workflow    | `gh workflow enable <name>`     |
| Disable workflow   | `gh workflow disable <name>`    |

## References

- [GitHub CLI Manual - Workflow Commands](https://cli.github.com/manual/gh_workflow)
- [GitHub CLI Manual - Run Commands](https://cli.github.com/manual/gh_run)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
