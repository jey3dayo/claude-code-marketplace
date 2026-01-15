#!/bin/bash
# rotate-keys.sh - Rotate dotenvx encryption keys
#
# Usage: ./rotate-keys.sh [environment]
# Example: ./rotate-keys.sh production
#
# When to rotate keys:
# - Every 90 days (compliance)
# - After team member departure
# - Suspected key compromise
# - Security audit recommendation

set -euo pipefail

ENVIRONMENT="${1:-production}"
ENV_FILE=".env.${ENVIRONMENT}"
BACKUP_DIR=".dotenvx-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔐 Rotating encryption key for ${ENVIRONMENT}..."

# Step 1: Verify dotenvx is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed"
    exit 1
fi

# Step 2: Verify environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE does not exist"
    exit 1
fi

# Step 3: Create backup directory
mkdir -p "$BACKUP_DIR"
echo "📁 Created backup directory: $BACKUP_DIR"

# Step 4: Backup current encrypted file and keys
if [ -f ".env.keys" ]; then
    cp ".env.keys" "$BACKUP_DIR/.env.keys.${TIMESTAMP}.backup"
    echo "✅ Backed up .env.keys"
fi

cp "$ENV_FILE" "$BACKUP_DIR/${ENV_FILE}.${TIMESTAMP}.backup"
echo "✅ Backed up $ENV_FILE"

# Step 5: Decrypt with old key
echo "🔓 Decrypting $ENV_FILE with old key..."
if ! npx dotenvx decrypt -f "$ENV_FILE"; then
    echo "❌ Error: Failed to decrypt $ENV_FILE"
    echo "Restoring from backup..."
    cp "$BACKUP_DIR/${ENV_FILE}.${TIMESTAMP}.backup" "$ENV_FILE"
    exit 1
fi

# Step 6: Extract old key for reference
OLD_KEY_VAR="DOTENV_PRIVATE_KEY_${ENVIRONMENT^^}"
if [ -f ".env.keys" ]; then
    OLD_KEY=$(grep "^${OLD_KEY_VAR}=" .env.keys | cut -d= -f2 || echo "N/A")
else
    OLD_KEY="N/A"
fi

# Step 7: Delete old key file
rm -f .env.keys
echo "🗑️  Deleted old .env.keys"

# Step 8: Re-encrypt with new key
echo "🔒 Re-encrypting $ENV_FILE with new key..."
if ! npx dotenvx encrypt -f "$ENV_FILE"; then
    echo "❌ Error: Failed to re-encrypt $ENV_FILE"
    echo "Restoring from backup..."
    cp "$BACKUP_DIR/${ENV_FILE}.${TIMESTAMP}.backup" "$ENV_FILE"
    cp "$BACKUP_DIR/.env.keys.${TIMESTAMP}.backup" ".env.keys"
    exit 1
fi

# Step 9: Extract new key
NEW_KEY=$(grep "^${OLD_KEY_VAR}=" .env.keys | cut -d= -f2)

# Step 10: Display results
echo ""
echo "✨ Key rotation complete!"
echo ""
echo "📊 Summary:"
echo "  Environment: ${ENVIRONMENT}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Backup location: $BACKUP_DIR"
echo ""
echo "🔑 Key Information:"
echo "  Old key (first 16 chars): ${OLD_KEY:0:16}..."
echo "  New key (first 16 chars): ${NEW_KEY:0:16}..."
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Test decryption with new key:"
echo "   npx dotenvx run -f $ENV_FILE -- env | grep DATABASE_URL"
echo ""
echo "2. Update CI/CD secrets:"
echo "   GitHub: gh secret set ${OLD_KEY_VAR} --body \"${NEW_KEY}\""
echo "   GitLab: Settings → CI/CD → Variables"
echo "   CircleCI: Project Settings → Environment Variables"
echo ""
echo "3. Distribute new key securely:"
echo "   - 1Password: Create new secure note"
echo "   - Vault: vault kv put secret/${ENVIRONMENT}/dotenvx key=\"${NEW_KEY}\""
echo "   - AWS Secrets Manager: aws secretsmanager update-secret"
echo ""
echo "4. Notify team members to update their local .env.keys"
echo ""
echo "⚠️  IMPORTANT: Keep backups in $BACKUP_DIR until key distribution is complete"
