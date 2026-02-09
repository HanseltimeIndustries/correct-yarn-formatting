const { readFileSync } = require("fs");
const { join } = require("path");

const packageJson = JSON.parse(
	readFileSync(join(__dirname, "package.json")).toString(),
);

// Abbreviate for Git Commit readability
const fullName = packageJson.name;
const scopeLimiterIdx = fullName.lastIndexOf("/");
const abbreviatedName = fullName.substring(
	scopeLimiterIdx >= 0 ? scopeLimiterIdx + 1 : 0,
);

module.exports = {
	branches: ["main", { name: "alpha", prerelease: true }],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		"@semantic-release/npm",
		[
			"@semantic-release/exec",
			{
				prepareCmd: "npm run bundle",
			},
		],
		// format any changed files
		[
			"@semantic-release/exec",
			{
				prepareCmd: "npm run format -- --fix",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json", "bundle/**"],
				message: `docs(release): ${abbreviatedName} $\{nextRelease.version} [skip ci]\n\n$\{nextRelease.notes}`,
			},
		],
		// This increments our major release tag to the current sha
		"semantic-release-major-tag",
		// This creates a release on github - you can decide if you want to mirror the files in package.json
		"@semantic-release/github",
	],
	ci: true,
};
