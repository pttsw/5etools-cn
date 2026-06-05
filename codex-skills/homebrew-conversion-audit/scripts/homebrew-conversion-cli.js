import path from "node:path";
import {spawn} from "node:child_process";

function _getArgValue (flag) {
	const ix = process.argv.indexOf(flag);
	if (!~ix) return null;
	return process.argv[ix + 1] ?? null;
}

function _getArgsAfterCommand () {
	const [, , , ...rest] = process.argv;
	return rest;
}

function _getScriptPath (name) {
	return path.join(path.dirname(process.argv[1]), name);
}

async function _runNodeScript (scriptName, args) {
	const scriptPath = _getScriptPath(scriptName);

	await new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [scriptPath, ...args], {
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("exit", code => {
			if (code === 0) return resolve();
			reject(new Error(`Subcommand "${scriptName}" exited with code ${code}`));
		});
	});
}

function _printUsage () {
	process.stdout.write(`Usage:
  node scripts/homebrew-conversion-cli.js bundle --input <path> [shared options...]
  node scripts/homebrew-conversion-cli.js audit --input <path> --entity-plan <path> [shared options...]
  node scripts/homebrew-conversion-cli.js build-collection --input <path> --entity-plan <path> --output <path> [shared options...]

Subcommands:
  bundle            Extract input and export a Codex-facing entity bundle.
  audit             Audit one selected entity using an optional Codex entity plan.
  build-collection  Build a collection draft from an entity plan and auto-merge any validated *.result.json files.

Examples:
  node scripts/homebrew-conversion-cli.js bundle --input module.docx --kind adventureDocument --entity-bundle /tmp/module.bundle.json
  node scripts/homebrew-conversion-cli.js audit --input module.docx --entity-plan /tmp/module.plan.json --entity-kind monster --repair-prompt /tmp/monster.repair.txt
  node scripts/homebrew-conversion-cli.js build-collection --input module.docx --entity-plan /tmp/module.plan.json --output /tmp/module.collection.json --repair-dir /tmp/repairs --llm-result-dir /tmp/repairs

Result-file auto-merge:
  Save Codex repair output as files such as:
  - False_Hydra.monster.result.json
  - Sending.spell.result.json
  - Wand_of_Smiles.item.result.json
  Then rerun build-collection with --llm-result-dir or --repair-dir.
`);
}

async function _main () {
	const command = process.argv[2];

	if (!command || command === "--help" || command === "-h") {
		_printUsage();
		return;
	}

	const passthroughArgs = _getArgsAfterCommand();

	switch (command) {
		case "bundle": {
			const entityBundlePath = _getArgValue("--entity-bundle");
			if (!entityBundlePath) {
				throw new Error(`bundle requires --entity-bundle <path>`);
			}

			await _runNodeScript("audit-file-cli.js", [...passthroughArgs, "--bundle-only"]);
			return;
		}

		case "audit": {
			await _runNodeScript("audit-file-cli.js", passthroughArgs);
			return;
		}

		case "build-collection": {
			await _runNodeScript("build-collection-from-plan-cli.js", passthroughArgs);
			return;
		}

		default:
			throw new Error(`Unknown command "${command}"`);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	await _main();
}
