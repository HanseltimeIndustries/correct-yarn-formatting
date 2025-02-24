import type {
	Plugin,
	Project,
	ConfigurationDefinitionMap,
	SettingsType,
} from "@yarnpkg/core";
import type * as fs from "fs";
import { platform } from "os";
import type * as path from "path";

export const name = "correct-yarn-formatting";

type LogLevels = "debug" | "notice" | "none";

declare module "@yarnpkg/core" {
	interface ConfigurationValueMap {
		/**
		 * If null, this defaults to notice
		 *
		 * debug - dumps all information
		 * notice - provides a notice when this plugin does something and links to the feature request
		 * none - no logging
		 */
		correctFormattingLogs: LogLevels | null;
	}
}

const configuration: Partial<ConfigurationDefinitionMap> = {
	correctFormattingLogs: {
		description:
			"Can be used to set the verbosity of the plugin's logs.\n debug - shows everything \n notice - only shows a notice when the plugin stops a bad format and links to the feature request\n none - shows nothing",
		type: "STRING" as SettingsType.STRING,
		default: "notice",
	},
};

class Logger {
	readonly logLevel: LogLevels;

	constructor(project: Project) {
		this.logLevel =
			project.configuration.get("correctFormattingLogs") || "notice";
	}

	log(msg: string | Buffer) {
		if (this.logLevel === "none") return;
		console.log(`[${name}] ${msg}`);
	}

	debug(msg: string | Buffer) {
		if (this.logLevel !== "debug") return;
		this.log(msg);
	}

	notice(msg: string | Buffer) {
		if (this.logLevel === "notice" || this.logLevel === "debug") {
			this.log(msg);
		}
	}
}

/**
 * Yarn on windows writes its file paths as unix absolute and this causes problems:
 * 
 * /D:/a/something/here
 */
function resolveCWD(yarnCwd: string) {
	if (process.platform === 'win32') {
		return yarnCwd.startsWith('/') ? yarnCwd.slice(1) : yarnCwd
	}
	return yarnCwd
}

export function factory(_require: <T>(pkg: string) => T): Plugin {
	const { readFileSync, writeFileSync } = _require<typeof fs>("fs");
	const { resolve } = _require<typeof path>("path");
	const origPkgs: [string, string][] = [];
	return {
		configuration,
		hooks: {
			validateProject(project: Project) {				
				const logger = new Logger(project);
				const topPkgJsonPath = resolve(resolveCWD(project.cwd), "package.json");
				logger.debug(`Reading pre-formatted file: ${topPkgJsonPath}`);
				origPkgs.push([
					topPkgJsonPath,
					readFileSync(topPkgJsonPath).toString(),
				]);
				project.workspaces.forEach((w) => {
					const pkgJsonPath = resolve(resolveCWD(w.cwd), "package.json");
					logger.debug(`Reading pre-formatted file: ${pkgJsonPath}`);
					origPkgs.push([pkgJsonPath, readFileSync(pkgJsonPath).toString()]);
				});
			},
			afterAllInstalled(project: Project) {
				const logger = new Logger(project);
				let reset = false;
				origPkgs.forEach(([path, origPkgStr]) => {
					const curPkgStr = readFileSync(path).toString();
					if (
						origPkgStr &&
						origPkgStr !== curPkgStr &&
						// Simple equivalence by reserializing the exact same way
						JSON.stringify(JSON.parse(curPkgStr)) ===
							JSON.stringify(JSON.parse(origPkgStr))
					) {
						writeFileSync(path, origPkgStr);
						logger.debug(`Resetting unnecessary format for ${path}`);
						reset = true;
					}
				});
				if (reset) {
					logger.notice(
						"Resetting unnecessary formatting by yarn!\n\tIf you would like this to be a main feature please comment here: https://github.com/yarnpkg/berry/discussions/2636",
					);
				}
			},
		},
	};
}
