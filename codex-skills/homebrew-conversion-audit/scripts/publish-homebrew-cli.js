import fs from "node:fs/promises";
import path from "node:path";

function _getArgValue (flag) {
	const ix = process.argv.indexOf(flag);
	if (!~ix) return null;
	return process.argv[ix + 1] ?? null;
}

function _printUsage () {
	process.stdout.write(`Usage:
  node scripts/publish-homebrew-cli.js --input <path> --homebrew-dir <path> --author <name> --title <name>

Publishes a validated homebrew JSON file into a 5etools project homebrew/
directory using the filename format "Author; Title.json", then adds that
filename to homebrew/index.json.
`);
}

function _sanitizeFilePart (text) {
	return `${text || ""}`
		.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

async function _readJsonFile (filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function _writeJsonFile (filePath, json) {
	await fs.writeFile(filePath, `${JSON.stringify(json, null, "\t")}\n`, "utf8");
}

function _getPublishedFilename ({author, title}) {
	const authorClean = _sanitizeFilePart(author);
	const titleClean = _sanitizeFilePart(title);

	if (!authorClean) throw new Error(`Expected non-empty --author`);
	if (!titleClean) throw new Error(`Expected non-empty --title`);

	return `${authorClean}; ${titleClean}.json`;
}

async function _updateHomebrewIndex ({indexPath, filename, replaceFilename = null}) {
	const index = await _readJsonFile(indexPath);
	const existing = Array.isArray(index.toImport) ? index.toImport : [];
	const next = existing
		.filter(it => it !== replaceFilename)
		.filter(it => it !== filename);

	next.push(filename);
	next.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

	index.toImport = next;
	await _writeJsonFile(indexPath, index);

	return next;
}

async function _main () {
	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		_printUsage();
		return;
	}

	const input = _getArgValue("--input");
	if (!input) throw new Error(`Missing --input <path>`);

	const homebrewDir = _getArgValue("--homebrew-dir");
	if (!homebrewDir) throw new Error(`Missing --homebrew-dir <path>`);

	const author = _getArgValue("--author");
	const title = _getArgValue("--title");
	const replaceFilename = _getArgValue("--replace-filename");

	const filename = _getPublishedFilename({author, title});
	const outputPath = path.join(homebrewDir, filename);
	const indexPath = path.join(homebrewDir, "index.json");

	await fs.mkdir(homebrewDir, {recursive: true});
	await fs.copyFile(input, outputPath);
	const toImport = await _updateHomebrewIndex({indexPath, filename, replaceFilename});

	process.stdout.write(`${JSON.stringify({
		outputPath,
		filename,
		indexPath,
		toImportCount: toImport.length,
	}, null, "\t")}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	await _main();
}
