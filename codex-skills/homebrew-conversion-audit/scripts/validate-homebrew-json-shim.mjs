import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {execFile} from "node:child_process";
import {syncBuiltinESMExports} from "node:module";
import {promisify} from "node:util";

const pExecFile = promisify(execFile);
const nativeFetch = globalThis.fetch;
const nativeReadFileSync = fs.readFileSync.bind(fs);
const _CACHE_DIR = "/tmp/homebrew-schema-cache";

function _getCachePath (url) {
	const hash = crypto.createHash("sha256").update(String(url)).digest("hex");
	return path.join(_CACHE_DIR, `${hash}.json`);
}

globalThis.fetch = async function fetchViaCurl (url, opts = {}) {
	if (opts && Object.keys(opts).length) return nativeFetch(url, opts);

	const cachePath = _getCachePath(url);
	let stdout;

	try {
		({stdout} = await pExecFile("curl", ["-sS", String(url)], {
			maxBuffer: 20_000_000,
		}));
		fs.mkdirSync(_CACHE_DIR, {recursive: true});
		fs.writeFileSync(cachePath, stdout, "utf8");
	} catch (e) {
		if (!fs.existsSync(cachePath)) throw e;
		stdout = nativeReadFileSync(cachePath, "utf8");
	}

	return {
		async json () { return JSON.parse(stdout); },
		async text () { return stdout; },
		ok: true,
		status: 200,
	};
};

fs.readFileSync = function readFileSyncWithCnSchema (filePath, opts) {
	const out = nativeReadFileSync(filePath, opts);
	const filePathStr = `${filePath}`;
	if (!filePathStr.includes("/schema/brew/") || !filePathStr.endsWith(".json")) return out;

	const text = Buffer.isBuffer(out) ? out.toString("utf8") : `${out}`;
	const schema = JSON.parse(text);
	_applyCnSchemaExtensions(schema);

	const patched = `${JSON.stringify(schema, null, "\t")}\n`;
	return Buffer.isBuffer(out) ? Buffer.from(patched, "utf8") : patched;
};

function _applyCnSchemaExtensions (schema) {
	const adventureProps = schema?.properties?.adventure?.items?.properties;
	if (adventureProps && !adventureProps.ENG_name) {
		adventureProps.ENG_name = {type: "string"};
	}

	_allowEngNameOnNamedObjects(schema);
}

function _allowEngNameOnNamedObjects (node, seen = new Set()) {
	if (!node || typeof node !== "object") return;
	if (seen.has(node)) return;
	seen.add(node);

	if (node.properties?.name && !node.properties.ENG_name) {
		node.properties.ENG_name = {type: "string"};
	}

	for (const value of Object.values(node)) {
		if (value && typeof value === "object") _allowEngNameOnNamedObjects(value, seen);
	}
}

syncBuiltinESMExports();
