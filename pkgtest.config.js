const { join } = require("path");

const baseYarnrc = {
	plugins: [join(__dirname, "lib", "index.js")],
};

const nodeLinkedYarnBerry = {
	alias: "yarn node linked",
	packageManager: "yarn-berry",
	options: {
		yarnrc: {
			nodeLinker: "node-modules",
			...baseYarnrc,
		},
	},
};

const pnpmLinkedYarnBerry = {
	alias: "yarn pnpm linked",
	packageManager: "yarn-berry",
	options: {
		yarnrc: {
			nodeLinker: "pnpm",
			...baseYarnrc,
		},
	},
};

const pnpLinkedYarnBerry = {
	alias: "yarn pnp linked",
	packageManager: "yarn-berry",
	options: {
		yarnrc: {
			nodeLinker: "pnp",
			...baseYarnrc,
		},
	},
};

let packageManagers = [
	nodeLinkedYarnBerry,
	pnpLinkedYarnBerry,
	pnpmLinkedYarnBerry,
];

module.exports = {
	rootDir: "pkgtest",
	locks: false,
	matchIgnore: ["fixtures/**"],
	entries: [
		{
			scriptTests: [
				{
					name: "nominalInstall",
					script: "yarn install",
				},
			],
			packageManagers,
			moduleTypes: ["commonjs", "esm"],
			timeout: 3000,
		},
	],
};
