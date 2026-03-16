import {EncounterBuilderRulesBase, TierHtmlProviderBase} from "./encounterbuilder-rules-base.js";
import {EncounterPartyMetaOne} from "../partymeta/encounter-partymeta-one.js";
import {TIER_ABSURD, TIER_HIGH, TIER_LOW, TIER_MODERATE, TIERS, TIERS_EXTENDED} from "../consts/encounterbuilder-consts-one.js";
import {BUDGET_MODE_XP} from "../consts/encounterbuilder-consts.js";
import {EncounterbuilderUiThermometer} from "../encounterbuilder-ui-thermometer.js";

class _TierHtmlProviderOne extends TierHtmlProviderBase {
	_budgetMode = BUDGET_MODE_XP;
	_tierTitles = {
		low: "一场低难度的遭遇很可能给玩家带来一到两个惊险瞬间，但他们的角色应当在没有人员伤亡的情况下取得胜利。不过，小队中的一人或多人可能会需要治疗资源。粗略地说，对于一支四人小队，面对单独一只挑战等级等于队伍等级的怪物，通常就是一个低难度的挑战。",
		moderate: "如果缺乏治疗和其他资源，中等难度的遭遇可能会对冒险者们造成实质的威胁。实力较弱的角色可能会在战斗中被击倒，同时也有较小的可能会导致一个或多个角色的死亡。",
		high: "一场高难度遭遇可能对一个或多个角色来说将是致命的。角色们需要巧妙地运用战略、即时思维，甚至可能需要一点点运气才能存活下来。",
		absurd: "“荒谬”的遭遇按规则来说属于致命的遭遇，但在此处单独划分一类，旨在提供一种额外的工具，用于精准判断某场 “致命” 遭遇的实际致命程度。其XP的计算方式为：致命 +（致命 - 困难）",
	};
}

export class EncounterBuilderRulesOne extends EncounterBuilderRulesBase {
	rulesId = "one";
	displayName = "Modern (5.5e/2024)";
	_tierHtmlProvider = new _TierHtmlProviderOne();

	_budgetMode = BUDGET_MODE_XP;

	render ({stgSettingsRules, stgRandomAndAdjust, stgGroupSummary, stgDifficulty}) {
		const {wrpSettingsRules} = this._render_settingsRules({stgSettingsRules});
		const {wrpRandomAndAdjust} = this._render_randomAndAdjust({stgRandomAndAdjust});
		const {wrpGroupSummary} = this._render_groupSummary({stgGroupSummary});
		const {wrpDifficulty} = this._render_difficulty({stgDifficulty});

		return {
			eles: [
				wrpSettingsRules,
				wrpRandomAndAdjust,
				wrpGroupSummary,
				wrpDifficulty,
			],
		};
	}

	_render_settingsRules ({stgSettingsRules}) {
		const wrpSettingsRules = ee`<div class="ve-flex-col">
			<div class="ve-flex ve-mb-2">${Renderer.get().render(`{@note Based on the encounter building rules on page 114 of the {@book ${Parser.sourceJsonToFull(Parser.SRC_XDMG)}|XDMG|3|Combat Encounter Difficulty}}`)}</div>
		</div>`
			.appendTo(stgSettingsRules);

		return {
			wrpSettingsRules,
		};
	}

	_render_randomAndAdjust ({stgRandomAndAdjust}) {
		const wrpRandomAndAdjust = this._getRenderedWrpRandomAndAdjust({
			tiers: TIERS,
		});

		wrpRandomAndAdjust.appendTo(stgRandomAndAdjust);

		return {wrpRandomAndAdjust};
	}

	/* -------------------------------------------- */

	_render_groupSummary ({stgGroupSummary}) {
		const {
			disps: dispsTierXp,
			onHookPulseDeriverPartyMeta: onHookPulseDeriverPartyMetaTierXp,
		} = this._getRenderedDispsTierMeta({
			tiers: TIERS_EXTENDED,
		});

		const thermometer = new EncounterbuilderUiThermometer({
			tierHtmlProvider: this._tierHtmlProvider,
			tiers: TIERS_EXTENDED,
			tiersActionable: TIERS,
			thresholdColors: {
				[TIER_LOW]: MiscUtil.COLOR_HEALTHY,
				[TIER_MODERATE]: MiscUtil.COLOR_HURT,
				[TIER_HIGH]: MiscUtil.COLOR_BLOODIED,
				[TIER_ABSURD]: MiscUtil.COLOR_DEFEATED,
			},
			pFnDoGenerateRandomEncounter: this._pDoGenerateRandomEncounter.bind(this),
			pFnDoAdjustEncounter: this._pDoAdjustEncounter.bind(this),
		});

		const dispTtk = ee`<div></div>`;

		const dispExpToLevel = ee`<div class="ve-muted"></div>`;

		const dispThermometer = thermometer.render()
			.addClass("ve-mt-2");

		this._comp.addHookPulseDeriverPartyMeta(() => {
			const partyMeta = this.getEncounterPartyMeta();
			const encounterSpendInfo = partyMeta.getEncounterSpendInfo(this._comp.creatureMetas);
			const tier = partyMeta.getEncounterTier(encounterSpendInfo);

			onHookPulseDeriverPartyMetaTierXp({partyMeta});

			thermometer.setInfo({
				spendValue: encounterSpendInfo.adjustedSpend,
				spendCap: partyMeta.getBudget(TIER_ABSURD),
				thresholds: Object.fromEntries(
					TIERS_EXTENDED
						.map(tier => [tier, partyMeta.getBudget(tier)]),
				),
				tier: tier,
			});

			dispTtk
				.html(this._getTtkHtml({partyMeta}));

			dispExpToLevel.html(this._getRenderedExpToLevel({partyMeta}));
		})();

		const wrpGroupSummary = ee`<div class="ve-text-right">
			${dispsTierXp}
			${dispThermometer}
			<hr class="ve-hr-2">
			${dispTtk}
			<br>
			${dispExpToLevel}
		</div>`
			.hideVe()
			.appendTo(stgGroupSummary);

		return {
			wrpGroupSummary,
		};
	}

	/* -------------------------------------------- */

	_render_difficulty ({stgDifficulty}) {
		const hrHasCreatures = ee`<hr class="ve-hr-1">`;
		const wrpDifficultyCols = ee`<div class="ve-flex">
			${this._renderGroupAndDifficulty_getDifficultyLhs()}
			${this._renderGroupAndDifficulty_getDifficultyRhs()}
		</div>`;

		this._comp.addHookPulseDeriverPartyMeta(() => {
			const encounterSpendInfo = this.getEncounterPartyMeta().getEncounterSpendInfo(this._comp.creatureMetas);
			hrHasCreatures.toggleVe(encounterSpendInfo.relevantCount);
			wrpDifficultyCols.toggleVe(encounterSpendInfo.relevantCount);
		})();

		const wrpDifficulty = ee`<div class="ve-flex-col ve-w-100">
			${hrHasCreatures}
			${wrpDifficultyCols}
		</div>`
			.hideVe()
			.appendTo(stgDifficulty);

		return {
			wrpDifficulty,
		};
	}

	_renderGroupAndDifficulty_getDifficultyLhs () {
		const dispDifficulty = ee`<h4 class="ve-my-2"></h4>`;

		this._comp.addHookPulseDeriverPartyMeta(() => {
			const partyMeta = this.getEncounterPartyMeta();

			const encounterSpendInfo = partyMeta.getEncounterSpendInfo(this._comp.creatureMetas);

			const tier = partyMeta.getEncounterTier(encounterSpendInfo);

			dispDifficulty
				.html(`Difficulty: <span class="ve-help-subtle">${Parser.encounterDifficultyToCn(tier)}</span>`)
				.tooltip(new _TierHtmlProviderOne().getTierTitle({tier}));
		})();

		return ee`<div class="ve-w-50">
			${dispDifficulty}
		</div>`;
	}

	_renderGroupAndDifficulty_getDifficultyRhs () {
		const dispXpRawTotal = ee`<h4></h4>`;
		const dispXpRawPerPlayer = ee`<i></i>`;

		this._comp.addHookPulseDeriverPartyMeta(() => {
			const partyMeta = this.getEncounterPartyMeta();

			const encounterSpendInfo = partyMeta.getEncounterSpendInfo(this._comp.creatureMetas);

			dispXpRawTotal.txt(`Total XP: ${encounterSpendInfo.baseSpend?.toLocaleStringVe() || "?"}`);
			dispXpRawPerPlayer.txt(
				partyMeta?.cntPlayers
					? `(${Math.floor(encounterSpendInfo.baseSpend / partyMeta?.cntPlayers)?.toLocaleStringVe()} per player)`
					: "",
			);
		})();

		return ee`<div class="ve-w-50 ve-text-right">
			${dispXpRawTotal}
			<div>${dispXpRawPerPlayer}</div>
		</div>`;
	}

	_getEncounterPartyMeta (playerMetas) {
		return new EncounterPartyMetaOne(playerMetas);
	}

	/* -------------------------------------------- */

	getDisplaySummary () {
		const encounterXpInfo = this
			.getEncounterPartyMeta()
			.getEncounterSpendInfo(this._comp.creatureMetas);

		return `${encounterXpInfo.baseSpend.toLocaleStringVe()} XP`;
	}

	/* -------------------------------------------- */

	_getDefaultState () {
		return {
			...super._getDefaultState(),
			tierRandom: TIER_MODERATE,
			tierAdjust: TIER_MODERATE,
		};
	}
}
