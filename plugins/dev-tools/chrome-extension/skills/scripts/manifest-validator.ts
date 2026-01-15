#!/usr/bin/env ts-node

/**
 * Manifest V3 Validator
 *
 * Validates manifest.json for Chrome Extension Manifest V3 compliance.
 *
 * Usage:
 *   ts-node manifest-validator.ts <path-to-manifest.json>
 *   or
 *   node --loader ts-node/esm manifest-validator.ts <path-to-manifest.json>
 */

import * as fs from "node:fs";
import * as path from "node:path";

interface ManifestV3 {
	manifest_version: number;
	name: string;
	version: string;
	description?: string;
	icons?: Record<string, string>;
	action?: {
		default_icon?: Record<string, string> | string;
		default_popup?: string;
		default_title?: string;
	};
	background?: {
		service_worker: string;
		type?: "module";
	};
	content_scripts?: Array<{
		matches: string[];
		js?: string[];
		css?: string[];
		run_at?: "document_start" | "document_end" | "document_idle";
	}>;
	permissions?: string[];
	host_permissions?: string[];
	optional_permissions?: string[];
	web_accessible_resources?: Array<{
		resources: string[];
		matches: string[];
	}>;
	content_security_policy?: {
		extension_pages?: string;
		sandbox?: string;
	};
}

interface ValidationError {
	severity: "error" | "warning" | "info";
	message: string;
	field?: string;
}

class ManifestValidator {
	private manifest: ManifestV3;
	private errors: ValidationError[] = [];
	private manifestDir: string;

	constructor(manifestPath: string) {
		this.manifestDir = path.dirname(manifestPath);
		this.manifest = this.loadManifest(manifestPath);
	}

	private loadManifest(filePath: string): ManifestV3 {
		try {
			const content = fs.readFileSync(filePath, "utf-8");
			return JSON.parse(content) as ManifestV3;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to load manifest.json: ${error.message}`);
			}
			throw error;
		}
	}

	private addError(
		severity: ValidationError["severity"],
		message: string,
		field?: string,
	): void {
		this.errors.push({ severity, message, field });
	}

	private fileExists(relativePath: string): boolean {
		const fullPath = path.join(this.manifestDir, relativePath);
		return fs.existsSync(fullPath);
	}

	validate(): ValidationError[] {
		this.validateManifestVersion();
		this.validateRequiredFields();
		this.validateIcons();
		this.validateBackground();
		this.validatePermissions();
		this.validateContentScripts();
		this.validateWebAccessibleResources();
		this.validateCSP();

		return this.errors;
	}

	private validateManifestVersion(): void {
		if (this.manifest.manifest_version !== 3) {
			this.addError(
				"error",
				`manifest_version must be 3 (found: ${this.manifest.manifest_version})`,
				"manifest_version",
			);
		}
	}

	private validateRequiredFields(): void {
		const required: Array<keyof ManifestV3> = ["name", "version"];

		for (const field of required) {
			if (!this.manifest[field]) {
				this.addError("error", `Required field "${field}" is missing`, field);
			}
		}

		// Name validation
		if (this.manifest.name && this.manifest.name.length > 75) {
			this.addError(
				"error",
				"Name must be 75 characters or less",
				"name",
			);
		}

		// Version validation (SemVer format)
		if (this.manifest.version) {
			const versionRegex = /^\d+\.\d+(\.\d+)?(\.\d+)?$/;
			if (!versionRegex.test(this.manifest.version)) {
				this.addError(
					"warning",
					"Version should follow semantic versioning (e.g., 1.0.0)",
					"version",
				);
			}
		}
	}

	private validateIcons(): void {
		if (!this.manifest.icons) {
			this.addError(
				"warning",
				"Icons are recommended for better user experience",
				"icons",
			);
			return;
		}

		const recommendedSizes = ["16", "32", "48", "128"];
		for (const size of recommendedSizes) {
			if (!this.manifest.icons[size]) {
				this.addError(
					"warning",
					`Icon size ${size}x${size} is recommended`,
					`icons.${size}`,
				);
			} else if (!this.fileExists(this.manifest.icons[size])) {
				this.addError(
					"error",
					`Icon file not found: ${this.manifest.icons[size]}`,
					`icons.${size}`,
				);
			}
		}
	}

	private validateBackground(): void {
		if (!this.manifest.background) {
			this.addError(
				"info",
				"No background service worker defined",
				"background",
			);
			return;
		}

		// MV3 requires service_worker, not scripts
		if (!("service_worker" in this.manifest.background)) {
			this.addError(
				"error",
				"Manifest V3 requires 'service_worker' in background field",
				"background",
			);
		}

		if (this.manifest.background.service_worker) {
			if (!this.fileExists(this.manifest.background.service_worker)) {
				this.addError(
					"error",
					`Service worker file not found: ${this.manifest.background.service_worker}`,
					"background.service_worker",
				);
			}
		}
	}

	private validatePermissions(): void {
		const permissions = this.manifest.permissions || [];
		const hostPermissions = this.manifest.host_permissions || [];

		// Check for permissions that should be in host_permissions
		const hostPatternRegex = /^(\*|https?|ftp):\/\//;
		for (const perm of permissions) {
			if (hostPatternRegex.test(perm)) {
				this.addError(
					"error",
					`Host permission "${perm}" should be in "host_permissions", not "permissions"`,
					"permissions",
				);
			}
		}

		// Check for overly broad host permissions
		for (const perm of hostPermissions) {
			if (perm === "*://*/*" || perm === "<all_urls>") {
				this.addError(
					"warning",
					`Overly broad host permission: "${perm}". Consider narrowing scope.`,
					"host_permissions",
				);
			}
		}

		// Recommend optional_permissions for less critical features
		if (
			permissions.length > 5 &&
			!this.manifest.optional_permissions?.length
		) {
			this.addError(
				"info",
				"Consider using optional_permissions for non-critical features",
				"permissions",
			);
		}
	}

	private validateContentScripts(): void {
		const scripts = this.manifest.content_scripts || [];

		for (const [index, script] of scripts.entries()) {
			if (!script.matches || script.matches.length === 0) {
				this.addError(
					"error",
					`Content script ${index} must have at least one match pattern`,
					`content_scripts[${index}].matches`,
				);
			}

			if (script.js) {
				for (const jsFile of script.js) {
					if (!this.fileExists(jsFile)) {
						this.addError(
							"error",
							`Content script file not found: ${jsFile}`,
							`content_scripts[${index}].js`,
						);
					}
				}
			}

			if (script.css) {
				for (const cssFile of script.css) {
					if (!this.fileExists(cssFile)) {
						this.addError(
							"error",
							`Content script CSS file not found: ${cssFile}`,
							`content_scripts[${index}].css`,
						);
					}
				}
			}
		}
	}

	private validateWebAccessibleResources(): void {
		const resources = this.manifest.web_accessible_resources || [];

		for (const [index, resource] of resources.entries()) {
			if (!resource.resources || resource.resources.length === 0) {
				this.addError(
					"error",
					"web_accessible_resources must have at least one resource",
					`web_accessible_resources[${index}].resources`,
				);
			}

			if (!resource.matches || resource.matches.length === 0) {
				this.addError(
					"error",
					"web_accessible_resources must have at least one match pattern",
					`web_accessible_resources[${index}].matches`,
				);
			}
		}
	}

	private validateCSP(): void {
		const csp = this.manifest.content_security_policy;

		if (csp?.extension_pages) {
			// Check for unsafe CSP directives
			const unsafeDirectives = [
				"unsafe-eval",
				"unsafe-inline",
				"unsafe-hashes",
			];
			for (const directive of unsafeDirectives) {
				if (csp.extension_pages.includes(directive)) {
					this.addError(
						"warning",
						`CSP contains unsafe directive: ${directive}`,
						"content_security_policy.extension_pages",
					);
				}
			}
		}
	}
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: ts-node manifest-validator.ts <path-to-manifest.json>");
		process.exit(1);
	}

	const manifestPath = args[0];

	if (!fs.existsSync(manifestPath)) {
		console.error(`Error: File not found: ${manifestPath}`);
		process.exit(1);
	}

	try {
		console.log(`Validating manifest: ${manifestPath}\n`);

		const validator = new ManifestValidator(manifestPath);
		const errors = validator.validate();

		if (errors.length === 0) {
			console.log("✅ Manifest is valid!");
			process.exit(0);
		}

		// Group by severity
		const errorsBySeverity = {
			error: errors.filter((e) => e.severity === "error"),
			warning: errors.filter((e) => e.severity === "warning"),
			info: errors.filter((e) => e.severity === "info"),
		};

		// Display errors
		for (const severity of ["error", "warning", "info"] as const) {
			const items = errorsBySeverity[severity];
			if (items.length === 0) continue;

			const icon =
				severity === "error" ? "❌" : severity === "warning" ? "⚠️" : "ℹ️";
			const label = severity.toUpperCase();

			console.log(`\n${icon} ${label}S (${items.length}):`);
			for (const item of items) {
				const fieldInfo = item.field ? ` [${item.field}]` : "";
				console.log(`  ${item.message}${fieldInfo}`);
			}
		}

		// Exit with error code if there are errors
		const hasErrors = errorsBySeverity.error.length > 0;
		console.log(
			`\n${hasErrors ? "❌" : "✅"} Validation ${hasErrors ? "failed" : "completed with warnings"}`,
		);
		process.exit(hasErrors ? 1 : 0);
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

export { ManifestValidator, type ManifestV3, type ValidationError };
