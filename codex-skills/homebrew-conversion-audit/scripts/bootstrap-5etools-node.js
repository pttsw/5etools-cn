import fs from "fs/promises";
import path from "path";

let _P_BOOTSTRAP = null;

export async function pBootstrap5etoolsNode () {
	_P_BOOTSTRAP ||= _pBootstrap5etoolsNode();
	return _P_BOOTSTRAP;
}

async function _pBootstrap5etoolsNode () {
	_polyfillRegExpEscape();
	_polyfillSetHelpers();
	_initBrowserShims();

	await import("../../../node/locale/i18n.js");
	await import("../../../js/parser.js");
	await import("../../../js/utils.js");
	await import("../../../js/hist.js");
	await import("../../../js/utils-dataloader.js");
	await import("../../../js/render.js");
	await import("../../../js/render-dice.js");

	const {VetoolsConfig} = await import("../../../js/utils-config/utils-config-config.js");
	globalThis.VetoolsConfig = VetoolsConfig;

	_patchDataLoading();

	const [
		creatureMod,
		creatureUtilsMod,
		spellMod,
		itemMod,
		tagsMod,
		entriesMod,
		raceMod,
		itemUtilsMod,
	] = await Promise.all([
		import("../../../js/converter/converter-creature.js"),
		import("../../../js/converter/converterutils-creature.js"),
		import("../../../js/converter/converter-spell.js"),
		import("../../../js/converter/converter-item.js"),
		import("../../../js/converter/converterutils-tags.js"),
		import("../../../js/converter/converterutils-entries.js"),
		import("../../../js/converter/converterutils-race.js"),
		import("../../../js/converter/converterutils-item.js"),
	]);

	const {ConverterCreature} = creatureMod;
	const {AcConvert, AttachedItemTag, MiscTag, SpellcastingTraitConvert} = creatureUtilsMod;
	const {ConverterSpell} = spellMod;
	const {ConverterItem} = itemMod;
	const {TagCondition, TaggerUtils} = tagsMod;
	const {TagJsons} = entriesMod;
	const {RaceTraitTag} = raceMod;
	const {InstrumentBaseItemTag} = itemUtilsMod;

	const [spells, items, itemsRaw, legendaryGroups, classes] = await Promise.all([
		DataUtil.spell.pLoadAll(),
		Renderer.item.pBuildList(),
		DataUtil.item.loadRawJSON(),
		DataUtil.legendaryGroup.pLoadAll(),
		DataUtil.class.loadJSON(),
	]);

	const itemsNoGroups = items.filter(it => !it._isItemGroup);

	SpellcastingTraitConvert.init(spells);
	ConverterItem.init(itemsNoGroups, classes);
	AcConvert.init(itemsNoGroups);
	TaggerUtils.init({legendaryGroups, spells});
	await TagJsons.pInit({spells});
	RaceTraitTag.init({itemsRaw});
	MiscTag.init({items});
	AttachedItemTag.init({items});
	await TagCondition.pInit({conditionsBrew: []});
	InstrumentBaseItemTag.init({items: itemsNoGroups});

	return {
		ConverterCreature,
		ConverterSpell,
		ConverterItem,
	};
}

function _polyfillRegExpEscape () {
	if (RegExp.escape) return;
	RegExp.escape = str => `${str}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _polyfillSetHelpers () {
	if (!Set.prototype.difference) {
		Set.prototype.difference = function (other) {
			const out = new Set();
			for (const it of this) {
				if (!other.has(it)) out.add(it);
			}
			return out;
		};
	}
}

function _initBrowserShims () {
	const storage = {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {},
	};

	const dummyEle = {
		classList: {
			add: () => {},
			remove: () => {},
			toggle: () => {},
		},
		style: {
			setProperty: () => {},
		},
		setAttribute: () => {},
		removeAttribute: () => {},
		appendChild: () => {},
		remove: () => {},
		querySelector: () => null,
		querySelectorAll: () => [],
		closest: () => null,
	};

	globalThis.window ||= {};
	globalThis.window.addEventListener ||= () => {};
	globalThis.window.matchMedia ||= () => ({matches: false});
	globalThis.window.localStorage ||= storage;
	globalThis.window.sessionStorage ||= storage;

	globalThis.localStorage ||= storage;
	globalThis.sessionStorage ||= storage;
	globalThis.navigator ||= {userAgentData: {mobile: false}};
	globalThis.location ||= {hostname: "", hash: ""};
	globalThis.document ||= {};
	globalThis.document.body ||= dummyEle;
	globalThis.document.documentElement ||= {
		classList: {add: () => {}, remove: () => {}},
		style: {setProperty: () => {}},
	};
	globalThis.document.getElementById ||= () => null;
	globalThis.document.querySelector ||= () => null;
	globalThis.document.querySelectorAll ||= () => [];
	globalThis.document.createElement ||= () => ({...dummyEle});
}

function _patchDataLoading () {
	const root = process.cwd();
	const resolveLocal = url => {
		const clean = url
			.replace(/^https?:\/\/[^/]+\//, "/")
			.replace(/^\//, "");
		return path.join(root, clean);
	};

	const loadJsonFs = async url => JSON.parse(await fs.readFile(resolveLocal(url), "utf8"));

	DataUtil.loadJSON = loadJsonFs;
	DataUtil.loadRawJSON = loadJsonFs;
}
