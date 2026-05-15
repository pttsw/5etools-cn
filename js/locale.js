"use strict";

globalThis.I18nUtil = globalThis.I18nUtil || {};

const isBrowser = typeof window !== "undefined"
	&& typeof document !== "undefined"
	&& typeof window.localStorage !== "undefined";

const DEFAULT_LANGUAGE = "zh_CN";
const STORAGE_KEY = "I18nUtil.LANGUAGES_INDEX";
const LEGACY_STORAGE_KEY = "LANGUAGES_INDEX";
const PROPERTY_FILE_PREFIX = "5e_";
const PROPERTY_FILE_SUFFIX = ".properties";
const SUPPORTED_LANGUAGES = new Set(["en-US", "zh_CN", "zh-Hant"]);
const LANGUAGE_ALIASES = {
	"en": "en-US",
	"en-us": "en-US",
	"zh": "zh_CN",
	"zh-cn": "zh_CN",
	"zh-hans": "zh_CN",
	"zh-sg": "zh_CN",
	"zh-hant": "zh-Hant",
	"zh-hk": "zh-Hant",
	"zh-mo": "zh-Hant",
	"zh-tw": "zh-Hant",
};
const i18nAttrRegex = /^data-i18n-(.+)$/;

const cachedLanguage = isBrowser
	? window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY)
	: DEFAULT_LANGUAGE;

let propertiesLoaded = false;
let activeTranslations = Object.create(null);
let activeLoadToken = 0;
let observer = null;

const translationCache = new Map();

I18nUtil.LANGUAGES_INDEX = getPreferredLanguageCode();

function normalizeLanguageCode (language) {
	if (!language) return DEFAULT_LANGUAGE;
	if (SUPPORTED_LANGUAGES.has(language)) return language;

	const normalized = `${language}`.trim().replaceAll("_", "-");
	if (SUPPORTED_LANGUAGES.has(normalized)) return normalized;

	const normalizedLower = normalized.toLowerCase();
	if (LANGUAGE_ALIASES[normalizedLower]) return LANGUAGE_ALIASES[normalizedLower];

	const baseLanguage = normalizedLower.split("-")[0];
	if (LANGUAGE_ALIASES[baseLanguage]) return LANGUAGE_ALIASES[baseLanguage];

	return DEFAULT_LANGUAGE;
}

function getPreferredLanguageCode () {
	if (!isBrowser) return DEFAULT_LANGUAGE;

	const candidates = [
		cachedLanguage,
		...(navigator.languages || []),
		navigator.language,
		navigator.userLanguage,
		DEFAULT_LANGUAGE,
	];

	for (const candidate of candidates) {
		if (!candidate) continue;
		const normalized = normalizeLanguageCode(candidate);
		if (SUPPORTED_LANGUAGES.has(normalized)) return normalized;
	}

	return DEFAULT_LANGUAGE;
}

function persistLanguage (language) {
	if (!isBrowser) return;
	window.localStorage.setItem(STORAGE_KEY, language);
	window.localStorage.setItem(LEGACY_STORAGE_KEY, language);
}

function syncDocumentLanguage (language) {
	if (!isBrowser || !document.documentElement) return;
	document.documentElement.setAttribute("lang", language === "zh_CN" ? "zh-CN" : language);
}

function getLanguageFileUrl (language) {
	return new URL(`/languages/${PROPERTY_FILE_PREFIX}${language}${PROPERTY_FILE_SUFFIX}`, document.baseURI).toString();
}

function getKeyCandidates (key) {
	const rawKey = `${key}`;
	const normalizedKey = rawKey
		.replaceAll(";", "_")
		.replaceAll(" ", "_");

	return [
		rawKey,
		normalizedKey,
		rawKey.toLowerCase(),
		normalizedKey.toLowerCase(),
	].filter((candidate, ix, arr) => arr.indexOf(candidate) === ix);
}

function getTranslationValue (key) {
	for (const candidate of getKeyCandidates(key)) {
		if (Object.hasOwn(activeTranslations, candidate)) return activeTranslations[candidate];
	}

	return null;
}

function decodePropertyEscapes (value) {
	return value.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (match, escapeSequence) => {
		switch (escapeSequence) {
			case "t": return "\t";
			case "r": return "\r";
			case "n": return "\n";
			case "f": return "\f";
			default: {
				if (escapeSequence.startsWith("u")) {
					return String.fromCharCode(Number.parseInt(escapeSequence.slice(1), 16));
				}

				return escapeSequence;
			}
		}
	});
}

function getLogicalLines (text) {
	const out = [];
	const physicalLines = text.replace(/\r\n?/g, "\n").split("\n");

	for (let i = 0; i < physicalLines.length; ++i) {
		let line = physicalLines[i];

		while (/\\+$/.test(line)) {
			const trailingSlashCount = line.match(/\\+$/)?.[0].length || 0;
			if (trailingSlashCount % 2 === 0) break;

			line = `${line.slice(0, -1)}${physicalLines[++i] || ""}`;
		}

		out.push(line);
	}

	return out;
}

function getSeparatorIndex (line) {
	let isEscaped = false;
	let firstWhitespaceIndex = -1;

	for (let i = 0; i < line.length; ++i) {
		const char = line[i];

		if (!isEscaped && (char === "=" || char === ":")) return i;
		if (!isEscaped && firstWhitespaceIndex === -1 && /\s/.test(char)) firstWhitespaceIndex = i;

		if (char === "\\" && !isEscaped) {
			isEscaped = true;
			continue;
		}

		isEscaped = false;
	}

	return firstWhitespaceIndex;
}

function parseProperties (text) {
	const out = Object.create(null);

	getLogicalLines(text)
		.map(line => line.trimStart())
		.filter(line => line && !/^[#!]/.test(line))
		.forEach(line => {
			const separatorIndex = getSeparatorIndex(line);
			if (separatorIndex === -1) {
				out[decodePropertyEscapes(line)] = "";
				return;
			}

			const rawKey = line.slice(0, separatorIndex);
			let valueIndex = separatorIndex;

			while (/\s/.test(line[valueIndex] || "")) valueIndex++;
			if (line[valueIndex] === "=" || line[valueIndex] === ":") valueIndex++;
			while (/\s/.test(line[valueIndex] || "")) valueIndex++;

			const rawValue = line.slice(valueIndex);
			out[decodePropertyEscapes(rawKey)] = decodePropertyEscapes(rawValue);
		});

	return out;
}

async function pLoadTranslations (language) {
	const normalizedLanguage = normalizeLanguageCode(language);
	if (translationCache.has(normalizedLanguage)) return translationCache.get(normalizedLanguage);

	const pLoad = fetch(getLanguageFileUrl(normalizedLanguage), {cache: "no-store"})
		.then(async response => {
			if (!response.ok) throw new Error(`Failed to load translations for "${normalizedLanguage}" (${response.status})`);
			return response.text();
		})
		.then(parseProperties)
		.catch(error => {
			translationCache.delete(normalizedLanguage);
			throw error;
		});

	translationCache.set(normalizedLanguage, pLoad);
	return pLoad;
}

function isTranslatableElement (element) {
	if (!(element instanceof Element)) return false;
	if (element.hasAttribute("data-i18n")) return true;

	for (const attr of element.attributes) {
		if (i18nAttrRegex.test(attr.name)) return true;
	}

	return false;
}

function getTranslatableElements (root = document) {
	const out = [];

	if (!root) return out;

	if (root.nodeType === Node.ELEMENT_NODE && isTranslatableElement(root)) {
		out.push(root);
	}

	if (![Node.DOCUMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE, Node.ELEMENT_NODE].includes(root.nodeType)) {
		return out;
	}

	const walkerDocument = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument || document;
	const walker = walkerDocument.createTreeWalker(
		root,
		NodeFilter.SHOW_ELEMENT,
		{
			acceptNode: node => isTranslatableElement(node)
				? NodeFilter.FILTER_ACCEPT
				: NodeFilter.FILTER_SKIP,
		},
	);

	while (walker.nextNode()) {
		out.push(walker.currentNode);
	}

	return out;
}

function initObserver () {
	if (!isBrowser || observer || !document.body) return;

	observer = new MutationObserver(mutationsList => {
		mutationsList.forEach(mutation => {
			if (mutation.type !== "childList") return;

			mutation.addedNodes.forEach(node => {
				I18nUtil.updateTranslations(node);
			});
		});
	});

	observer.observe(document.body, {childList: true, subtree: true});
}

I18nUtil.loadProperties = async (language) => {
	const targetLanguage = normalizeLanguageCode(language || I18nUtil.LANGUAGES_INDEX || getPreferredLanguageCode());
	const loadToken = ++activeLoadToken;

	try {
		const translations = await pLoadTranslations(targetLanguage);
		if (loadToken !== activeLoadToken) return;

		activeTranslations = translations;
		propertiesLoaded = true;
		I18nUtil.LANGUAGES_INDEX = targetLanguage;
		persistLanguage(targetLanguage);
		syncDocumentLanguage(targetLanguage);
		I18nUtil.updateTranslations();
	} catch (error) {
		if (targetLanguage !== DEFAULT_LANGUAGE) {
			await I18nUtil.loadProperties(DEFAULT_LANGUAGE);
			return;
		}

		if (loadToken !== activeLoadToken) return;

		propertiesLoaded = false;
		activeTranslations = Object.create(null);
		I18nUtil.LANGUAGES_INDEX = DEFAULT_LANGUAGE;
		persistLanguage(DEFAULT_LANGUAGE);
		syncDocumentLanguage(DEFAULT_LANGUAGE);
	}
};

I18nUtil.get = (key, defaultFunc = k => k.split(".").at(-1).replaceAll("_", " ")) => {
	try {
		if (!key) return "";

		const translationValue = propertiesLoaded ? getTranslationValue(key) : null;
		if (translationValue != null) return translationValue;

		return defaultFunc(`${key}`);
	} catch (error) {
		return defaultFunc(`${key}`);
	}
};

I18nUtil.__translateElement = (element) => {
	if (!(element instanceof Element)) return;

	const textKey = element.getAttribute("data-i18n");
	if (textKey) {
		element.textContent = I18nUtil.get(textKey, () => textKey);
	}

	for (const attr of [...element.attributes]) {
		const match = i18nAttrRegex.exec(attr.name);
		if (!match) continue;

		const translated = I18nUtil.get(attr.value, () => attr.value);
		const targetAttr = match[1];

		if (targetAttr === "html") {
			element.innerHTML = translated;
			continue;
		}

		if (targetAttr === "text") {
			element.textContent = translated;
			continue;
		}

		element.setAttribute(targetAttr, translated);
	}
};

I18nUtil.updateTranslations = (root = document) => {
	getTranslatableElements(root)
		.forEach(element => I18nUtil.__translateElement(element));
};

syncDocumentLanguage(I18nUtil.LANGUAGES_INDEX);

if (isBrowser) {
	void I18nUtil.loadProperties(I18nUtil.LANGUAGES_INDEX);

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			initObserver();
			if (propertiesLoaded) I18nUtil.updateTranslations();
		}, {once: true});
	} else {
		initObserver();
		if (propertiesLoaded) I18nUtil.updateTranslations();
	}
}
