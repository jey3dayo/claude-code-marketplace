#!/usr/bin/env ts-node

/**
 * Permission Analyzer
 *
 * Analyzes Chrome Extension permissions usage and suggests optimizations.
 *
 * Usage:
 *   ts-node permission-analyzer.ts <path-to-project-root>
 */

import * as fs from "node:fs";
import * as path from "node:path";

interface ManifestPermissions {
	permissions?: string[];
	host_permissions?: string[];
	optional_permissions?: string[];
}

interface PermissionUsage {
	permission: string;
	usedInFiles: string[];
	apiCalls: string[];
}

interface AnalysisResult {
	declaredPermissions: string[];
	declaredHostPermissions: string[];
	usedPermissions: PermissionUsage[];
	unusedPermissions: string[];
	missingPermissions: string[];
	suggestions: string[];
}

// Map Chrome APIs to required permissions
const API_PERMISSION_MAP: Record<string, string> = {
	"chrome.tabs": "tabs",
	"chrome.storage": "storage",
	"chrome.bookmarks": "bookmarks",
	"chrome.history": "history",
	"chrome.cookies": "cookies",
	"chrome.webRequest": "webRequest",
	"chrome.webNavigation": "webNavigation",
	"chrome.scripting": "scripting",
	"chrome.downloads": "downloads",
	"chrome.notifications": "notifications",
	"chrome.contextMenus": "contextMenus",
	"chrome.identity": "identity",
	"chrome.alarms": "alarms",
	"chrome.declarativeNetRequest": "declarativeNetRequest",
};

class PermissionAnalyzer {
	private projectRoot: string;
	private manifestPath: string;
	private manifest: ManifestPermissions;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.manifestPath = path.join(projectRoot, "manifest.json");
		this.manifest = this.loadManifest();
	}

	private loadManifest(): ManifestPermissions {
		try {
			const content = fs.readFileSync(this.manifestPath, "utf-8");
			return JSON.parse(content) as ManifestPermissions;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to load manifest.json: ${error.message}`);
			}
			throw error;
		}
	}

	private findSourceFiles(dir: string, extensions = [".ts", ".js", ".tsx", ".jsx"]): string[] {
		const files: string[] = [];

		const walk = (currentDir: string) => {
			const entries = fs.readdirSync(currentDir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry.name);

				// Skip node_modules and dist directories
				if (entry.isDirectory()) {
					if (!["node_modules", "dist", ".git"].includes(entry.name)) {
						walk(fullPath);
					}
				} else if (entry.isFile()) {
					const ext = path.extname(entry.name);
					if (extensions.includes(ext)) {
						files.push(fullPath);
					}
				}
			}
		};

		walk(dir);
		return files;
	}

	private findChromeAPIUsage(filePath: string): string[] {
		const content = fs.readFileSync(filePath, "utf-8");
		const apis = new Set<string>();

		// Match chrome.* API calls
		const apiRegex = /chrome\.(\w+)(?:\.(\w+))?/g;
		let match;

		while ((match = apiRegex.exec(content)) !== null) {
			const apiName = `chrome.${match[1]}`;
			apis.add(apiName);
		}

		return Array.from(apis);
	}

	analyze(): AnalysisResult {
		const sourceFiles = this.findSourceFiles(this.projectRoot);
		const usedAPIs = new Map<string, Set<string>>();

		// Find all Chrome API usage
		for (const file of sourceFiles) {
			const apis = this.findChromeAPIUsage(file);
			for (const api of apis) {
				if (!usedAPIs.has(api)) {
					usedAPIs.set(api, new Set());
				}
				usedAPIs.get(api)!.add(path.relative(this.projectRoot, file));
			}
		}

		const declaredPermissions = this.manifest.permissions || [];
		const declaredHostPermissions = this.manifest.host_permissions || [];

		// Map used APIs to permissions
		const usedPermissions: PermissionUsage[] = [];
		const requiredPermissions = new Set<string>();

		for (const [api, files] of usedAPIs.entries()) {
			const permission = API_PERMISSION_MAP[api];
			if (permission) {
				requiredPermissions.add(permission);
				usedPermissions.push({
					permission,
					usedInFiles: Array.from(files),
					apiCalls: [api],
				});
			}
		}

		// Find unused permissions
		const unusedPermissions = declaredPermissions.filter(
			(perm) => !requiredPermissions.has(perm),
		);

		// Find missing permissions
		const missingPermissions = Array.from(requiredPermissions).filter(
			(perm) => !declaredPermissions.includes(perm),
		);

		// Generate suggestions
		const suggestions = this.generateSuggestions({
			declaredPermissions,
			declaredHostPermissions,
			unusedPermissions,
			missingPermissions,
		});

		return {
			declaredPermissions,
			declaredHostPermissions,
			usedPermissions,
			unusedPermissions,
			missingPermissions,
			suggestions,
		};
	}

	private generateSuggestions(data: {
		declaredPermissions: string[];
		declaredHostPermissions: string[];
		unusedPermissions: string[];
		missingPermissions: string[];
	}): string[] {
		const suggestions: string[] = [];

		// Unused permissions
		if (data.unusedPermissions.length > 0) {
			suggestions.push(
				`Remove unused permissions: ${data.unusedPermissions.join(", ")}`,
			);
		}

		// Missing permissions
		if (data.missingPermissions.length > 0) {
			suggestions.push(
				`Add missing permissions: ${data.missingPermissions.join(", ")}`,
			);
		}

		// Overly broad host permissions
		for (const hostPerm of data.declaredHostPermissions) {
			if (hostPerm === "*://*/*" || hostPerm === "<all_urls>") {
				suggestions.push(
					`Consider narrowing host permission: "${hostPerm}" → specific domains`,
				);
			}
		}

		// Optional permissions suggestion
		const nonCritical = ["tabs", "bookmarks", "history"];
		const canBeOptional = data.declaredPermissions.filter((p) =>
			nonCritical.includes(p),
		);
		if (canBeOptional.length > 0) {
			suggestions.push(
				`Consider making these permissions optional: ${canBeOptional.join(", ")}`,
			);
		}

		return suggestions;
	}
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: ts-node permission-analyzer.ts <path-to-project-root>");
		process.exit(1);
	}

	const projectRoot = args[0];

	if (!fs.existsSync(projectRoot)) {
		console.error(`Error: Directory not found: ${projectRoot}`);
		process.exit(1);
	}

	try {
		console.log(`Analyzing permissions in: ${projectRoot}\n`);

		const analyzer = new PermissionAnalyzer(projectRoot);
		const result = analyzer.analyze();

		// Display results
		console.log("📋 DECLARED PERMISSIONS:");
		if (result.declaredPermissions.length === 0) {
			console.log("  (none)");
		} else {
			for (const perm of result.declaredPermissions) {
				console.log(`  - ${perm}`);
			}
		}

		console.log("\n🌐 HOST PERMISSIONS:");
		if (result.declaredHostPermissions.length === 0) {
			console.log("  (none)");
		} else {
			for (const perm of result.declaredHostPermissions) {
				console.log(`  - ${perm}`);
			}
		}

		console.log("\n✅ USED PERMISSIONS:");
		if (result.usedPermissions.length === 0) {
			console.log("  (none detected)");
		} else {
			for (const usage of result.usedPermissions) {
				console.log(`  - ${usage.permission}`);
				console.log(`    APIs: ${usage.apiCalls.join(", ")}`);
				console.log(
					`    Files: ${usage.usedInFiles.slice(0, 3).join(", ")}${usage.usedInFiles.length > 3 ? "..." : ""}`,
				);
			}
		}

		if (result.unusedPermissions.length > 0) {
			console.log("\n⚠️  UNUSED PERMISSIONS:");
			for (const perm of result.unusedPermissions) {
				console.log(`  - ${perm}`);
			}
		}

		if (result.missingPermissions.length > 0) {
			console.log("\n❌ MISSING PERMISSIONS:");
			for (const perm of result.missingPermissions) {
				console.log(`  - ${perm}`);
			}
		}

		if (result.suggestions.length > 0) {
			console.log("\n💡 SUGGESTIONS:");
			for (const suggestion of result.suggestions) {
				console.log(`  - ${suggestion}`);
			}
		}

		console.log(
			"\n✨ Analysis complete. Review suggestions to optimize permissions.",
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		}
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

export { PermissionAnalyzer, type AnalysisResult, type PermissionUsage };
