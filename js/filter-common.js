"use strict";

class FilterCommon {
	static getDamageVulnerableFilter () {
		return this._getDamageResistVulnImmuneFilter({
			header: "易伤Vulnerability",
			headerShort: "易伤Vuln.",
		});
	}

	static getDamageResistFilter () {
		return this._getDamageResistVulnImmuneFilter({
			header: "抗性Resistance",
			headerShort: "抗性Res.",
		});
	}

	static getDamageImmuneFilter () {
		return this._getDamageResistVulnImmuneFilter({
			header: "免疫Immunity",
			headerShort: "免疫Imm.",
		});
	}

	static _getDamageResistVulnImmuneFilter (
		{
			header,
			headerShort,
		},
	) {
		return new Filter({
			header: header,
			items: [...Parser.DMG_TYPES],
			displayFnMini: str => `${headerShort} ${str.toTitleCase()}`,
			displayFnTitle: str => `Damage ${header}: ${str.toTitleCase()}`,
			displayFn: StrUtil.uppercaseFirst,
		});
	}

	/* -------------------------------------------- */

	static _CONDS = [
		"目盲",
		"魅惑",
		"耳聋",
		"力竭",
		"恐慌",
		"受擒",
		"失能",
		"隐形",
		"麻痹",
		"石化",
		"中毒",
		"倒地",
		"束缚",
		"震慑",
		"昏迷",
		// not really a condition, but whatever
		"疾病",
	];

	static getConditionImmuneFilter () {
		return new Filter({
			header: "Condition Immunity",
			cnHeader: "状态免疫",
			items: this._CONDS,
			displayFnMini: str => `免疫 ${str.toTitleCase()}`,
			displayFnTitle: str => `状态免疫: ${str.toTitleCase()}`,
			displayFn: StrUtil.uppercaseFirst,
		});
	}

	/* -------------------------------------------- */

	static mutateForFilters_damageVulnResImmuneNonPlayer (ent) {
		ent._fVuln = this._getAllImmResNonPlayer(ent.vulnerable, "vulnerable");
		ent._fRes = this._getAllImmResNonPlayer(ent.resist, "resist");
		ent._fImm = this._getAllImmResNonPlayer(ent.immune, "immune");
	}

	static mutateForFilters_conditionImmuneNonPlayer (ent) {
		ent._fCondImm = this._getAllImmResNonPlayer(ent.conditionImmune, "conditionImmune");
	}

	static _getAllImmResNonPlayer (val, key) {
		if (!val) return [];
		const out = [];
		for (const valSub of val) this._getAllImmResNonPlayer_recurse(valSub, key, out);
		return out;
	}

	static _getAllImmResNonPlayer_recurse (val, key, out, isConditional) {
		if (val[key]) {
			val[key].forEach(nxt => this._getAllImmResNonPlayer_recurse(nxt, key, out, !!val.cond));
			return;
		}

		if (val.special) return out.push("Other");

		if (typeof val !== "string") return;
		out.push(isConditional ? `${val} (有条件的)` : val);
	}

	/* -------------------------------------------- */

	static mutateForFilters_damageVulnResImmunePlayer (ent) {
		ent._fVuln = this._getAllImmResPlayer(ent.vulnerable);
		ent._fRes = this._getAllImmResPlayer(ent.resist);
		ent._fImm = this._getAllImmResPlayer(ent.immune);
	}

	static mutateForFilters_conditionImmunePlayer (ent) {
		ent._fCondImm = this._getAllImmResPlayer(ent.conditionImmune);
	}

	static _getAllImmResPlayer (val) {
		if (!val) return [];
		const out = [];
		for (const valSub of val) {
			if (typeof valSub === "string") {
				out.push(valSub);
				break;
			}
			valSub.choose?.from?.forEach(it => out.push(it));
		}
		return out;
	}

	/* -------------------------------------------- */

	static PREREQ_FILTER_ITEMS = ["Ability", "Species", "Psionics", "Proficiency", "Special", "Spellcasting"];

	static _PREREQ_KEY_TO_FULL = {
		"other": "Special",
		"otherSummary": "Special",
		"spellcasting2020": "Spellcasting",
		"spellcastingFeature": "Spellcasting",
		"spellcastingPrepared": "Spellcasting",
		"spellcastingFocus": "Spellcasting Focus",
		"level": "Class", // We assume that any filter with meaningful level requirements will have these in a separate filter
		"itemType": "Item Type",
		"itemProperty": "Item Property",
	};

	/**
	 * @param {Array<object>} prerequisite
	 * @param {Set} ignoredKeys
	 */
	static getFilterValuesPrerequisite (prerequisite, {ignoredKeys = null} = {}) {
		return Array.from(
			new Set((prerequisite || [])
				.flatMap(it => Object.keys(it))),
		)
			.filter(k => ignoredKeys == null || !ignoredKeys.has(k))
			.map(it => (this._PREREQ_KEY_TO_FULL[it] || it).uppercaseFirst());
	}

	/* -------------------------------------------- */

	static _getNameSourceFilterDisplay (str) {
		const [name, sourceJson] = str.split("|");
		return `${name.toTitleCase()}${sourceJson ? ` (${Parser.sourceJsonToAbv(sourceJson)})` : ""}`;
	}

	/* -------------------------------------------- */

	static getSkillProficienciesFilter () {
		return new Filter({
			header: "Skill Proficiencies",
			cnHeader: "技能熟练项",
			displayFn: this._getNameSourceFilterDisplay.bind(this),
		});
	}

	/* -------------------------------------------- */

	static _LANG_TO_DISPLAY = {
		"anyStandard": "任意标准语言",
		"anyExotic": "任意特种语言",
		"anyRare": "任意稀有语言",
		"anyLanguage": "任意",
	};

	static getLanguageProficienciesFilter () {
		return new Filter({
			header: "语言熟练项",
			displayFn: it => {
				if (this._LANG_TO_DISPLAY[it]) return this._LANG_TO_DISPLAY[it];
				if (Parser.LANGUAGES_TO_CN[it]) return Parser.LANGUAGES_TO_CN[it];
				return this._getNameSourceFilterDisplay(it);
			},
		});
	}

	/* -------------------------------------------- */

	static _TOOL_TO_DISPLAY = {
		"anyTool": "任意工具",
		"anyArtisansTool": "任意工匠工具",
		"anyMusicalInstrument": "任意乐器",
		"anyGamingSet": "任意赌博工具",
	};

	static getToolProficienciesFilter () {
		return new Filter({
			header: "Tool Proficiencies",
			cnHeader: "工具熟练项",
			displayFn: it => {
				if (this._TOOL_TO_DISPLAY[it]) return this._TOOL_TO_DISPLAY[it];
				if (Parser.TOOLS_TO_CN[it]) return Parser.TOOLS_TO_CN[it];
				return this._getNameSourceFilterDisplay(it);
			},
		});
	}
}

globalThis.FilterCommon = FilterCommon;
