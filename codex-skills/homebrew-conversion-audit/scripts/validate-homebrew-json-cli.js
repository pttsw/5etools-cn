import path from "node:path";
import {spawn} from "node:child_process";

function _getArgValue (flag) {
	const ix = process.argv.indexOf(flag);
	if (!~ix) return null;
	return process.argv[ix + 1] ?? null;
}

function _printUsage () {
	process.stdout.write(`Usage:
  node scripts/validate-homebrew-json-cli.js --file <path> [--homebrew-dir /data/homebrew]

Runs the homebrew JSON schema validator with Chinese 5etools schema extensions
applied at runtime. This does not edit the installed 5etools-utils schemas.
`);
}

async function _main () {
	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		_printUsage();
		return;
	}

	const file = _getArgValue("--file");
	if (!file) throw new Error(`Missing --file <path>`);

	const homebrewDir = _getArgValue("--homebrew-dir") || "/data/homebrew";
	const shimPath = path.join(path.dirname(process.argv[1]), "validate-homebrew-json-shim.mjs");
	const existingNodeOptions = process.env.NODE_OPTIONS || "";
	const nodeOptions = [existingNodeOptions, `--import ${shimPath}`].filter(Boolean).join(" ");

	await new Promise((resolve, reject) => {
		const child = spawn("npm", ["run", "test:json", "--", file], {
			cwd: homebrewDir,
			env: {
				...process.env,
				NODE_OPTIONS: nodeOptions,
			},
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("exit", code => {
			if (code === 0) return resolve();
			reject(new Error(`Homebrew JSON validation failed with exit code ${code}`));
		});
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	await _main();
}
