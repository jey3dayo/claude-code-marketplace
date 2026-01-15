# Privacy Policy for [Extension Name]

**Last Updated**: [Date]

## Overview

[Extension Name] ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension.

## Information We Collect

### Data Collection

[Choose the appropriate section based on your extension's functionality]

#### Option 1: No Data Collection

We do not collect, store, or transmit any personal information or browsing data. All processing happens locally on your device.

#### Option 2: Limited Data Collection

We collect the following information:

- **[Data Type 1]**: [Description of what is collected and why]
- **[Data Type 2]**: [Description of what is collected and why]
- **[Data Type 3]**: [Description of what is collected and why]

Example:

- **User Preferences**: Theme settings and language preferences to personalize your experience
- **URL Patterns**: Website URLs that match your saved patterns (stored locally only)

### How We Use Your Information

We use the collected information for the following purposes:

1. **[Purpose 1]**: [Detailed explanation]
2. **[Purpose 2]**: [Detailed explanation]
3. **[Purpose 3]**: [Detailed explanation]

Example:

1. **Functionality**: To provide the core features of the extension
2. **Personalization**: To remember your preferences across sessions
3. **Performance**: To optimize the extension's performance

## Data Storage

### Local Storage

We store data locally on your device using:

- `chrome.storage.local`: [Description of what is stored]
- `chrome.storage.sync`: [Description of what is synced across devices]

**Retention Period**: [Specify how long data is kept]

Example: User preferences are stored indefinitely until you uninstall the extension or manually clear the data.

### Cloud Storage

[If applicable]

We do not transmit any data to external servers.

OR

We transmit the following data to our servers:

- **[Data Type]**: [Why it's transmitted and how it's protected]

## Third-Party Services

### Data Sharing

We do not share your personal information with third parties.

OR

We share limited data with the following third-party services:

1. **[Service Name]**
   - Purpose: [Why we use this service]
   - Data Shared: [What data is shared]
   - Privacy Policy: [Link to their privacy policy]

### External APIs

[If your extension calls external APIs]

The extension communicates with the following APIs:

- **[API Name]**: [Purpose and data transmitted]

## Permissions

### Required Permissions

The extension requests the following permissions:

| Permission  | Purpose                                               |
| ----------- | ----------------------------------------------------- |
| `storage`   | Store user preferences and settings locally           |
| `tabs`      | Detect current page URL for context-specific features |
| `activeTab` | Access page content when you click the extension icon |
| Add more    | Purpose                                               |

### Host Permissions

The extension requests access to the following websites:

- `https://example.com/*`: Reason for access
- Add more: Reason

## User Rights

You have the following rights regarding your data:

### Access and Control

- **View Data**: You can view all stored data through the extension's options page
- **Delete Data**: You can clear all data at any time through the extension settings
- **Export Data**: [If applicable] You can export your data in JSON format

### Opt-Out

- You can disable specific features in the extension settings
- You can uninstall the extension at any time to remove all local data

## Data Security

We implement the following security measures:

- All data processing happens locally on your device
- No data is transmitted over unencrypted connections
- [If applicable] Sensitive data is encrypted using industry-standard encryption

## Children's Privacy

This extension is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:

- Updating the "Last Updated" date at the top of this policy
- [If applicable] Displaying a notification in the extension

## Contact Us

If you have any questions about this Privacy Policy, please contact us:

- **Email**: [your-email@example.com]
- **Website**: [your-website.com]
- **GitHub**: [github.com/your-username/your-extension]

## Compliance

This Privacy Policy complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) [if applicable]
- California Consumer Privacy Act (CCPA) [if applicable]

---

## Additional Notes (Remove before publishing)

**Customization Checklist:**

- [ ] Replace [Extension Name] with your actual extension name
- [ ] Update [Date] with current date
- [ ] Choose appropriate data collection option (Option 1 or Option 2)
- [ ] Fill in all [bracketed placeholders]
- [ ] List all actual permissions from manifest.json
- [ ] List all actual host permissions
- [ ] Update contact information
- [ ] Review and ensure accuracy
- [ ] Remove this "Additional Notes" section

**Publishing:**

1. Save as `privacy-policy.md` in your extension repository
2. Host on a public URL (GitHub Pages, your website, etc.)
3. Add `"privacy_policy"` field to manifest.json with the URL
4. Link from Chrome Web Store listing

**Example manifest.json entry:**

```json
{
  "privacy_policy": "https://your-website.com/privacy-policy.html"
}
```
