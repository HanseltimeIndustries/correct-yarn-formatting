import {
	Plugin,
	Project,
	ConfigurationDefinitionMap,
	SettingsType,
} from "@yarnpkg/core";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

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
		type: SettingsType.STRING,
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

export function factory(): Plugin {
	const origPkgs: [string, string][] = [];
	return {
		configuration,
		hooks: {
			validateProject(project: Project) {
				const logger = new Logger(project);
				const topPkgJsonPath = join(project.cwd, "package.json");
				logger.debug(`Reading pre-formatted file: ${topPkgJsonPath}`);
				origPkgs.push([
					topPkgJsonPath,
					readFileSync(topPkgJsonPath).toString(),
				]);
				project.workspaces.forEach((w) => {
					const pkgJsonPath = join(w.cwd, "package.json");
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
