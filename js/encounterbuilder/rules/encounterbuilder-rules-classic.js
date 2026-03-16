import {EncounterBuilderRulesBase, TierHtmlProviderBase} from "./encounterbuilder-rules-base.js";
import {EncounterPartyMetaClassic} from "../partymeta/encounter-partymeta-classic.js";
import {TIER_ABSURD, TIER_DEADLY, TIER_EASY, TIER_HARD, TIER_MEDIUM, TIERS, TIERS_EXTENDED} from "../consts/encounterbuilder-consts-classic.js";
import {BUDGET_MODE_XP} from "../consts/encounterbuilder-consts.js";
import {EncounterbuilderUiThermometer} from "../encounterbuilder-ui-thermometer.js";
import {EncounterBuilderTtkClassic} from "../ttk/encounterbuilder-ttk-classic.js";

class _TierHtmlProviderClassic extends TierHtmlProviderBase {
	_budgetMode = BUDGET_MODE_XP;
	_tierTitles = {
		easy: "一次简单的遭遇不会消耗角色们的资源或给他们带来严重的危险。他们可能会失去一点生命值，但是胜利还是相当有保障的。",
		medium: "一次中等的遭遇通常会让玩家们经历一两次惊心时刻，但是不会对角色们造成任何伤亡。只是其中若干人员可能会需要使用治疗资源。",
		hard: "对冒险者们而言，一次困难的遭遇可能会发展得很糟糕。较弱的角色可能会在战斗中被清除，甚至有较小的可能导致一个或多个角色因此死亡。",
		deadly: "对某些玩家而言，致命的遭遇可以造成足以致命的后果。此时需要优秀的策略和快速的思考才能确保生还，而队伍失败时也必须承当相应的风险。",
		absurd: "“荒谬”的遭遇按规则来说属于致命的遭遇，但在此处单独划分一类，旨在提供一种额外的工具，用于精准判断某场 “致命” 遭遇的实际致命程度。其XP的计算方式为：致命 +（致命 - 困难）",
	};
}

class _EncounterBuilderUiHelp {
	static getHelpEntry ({partyMeta, encounterSpendInfo}) {
		return {
			type: "entries",
			entries: [
				`{@b Adjusted by a ${encounterSpendInfo.playerAdjustedSpendMult}× multiplier, based on a minimum challenge rating threshold of approximately ${`${encounterSpendInfo.crCutoff.toFixed(2)}`.replace(/[,.]?0+$/, "")}*&dagger;, and a party size of ${encounterSpendInfo.playerCount} players.}`,
				// `{@note * If the maximum challenge rating is two or less, there is no minimum threshold. Similarly, if less than a third of the party are level 5 or higher, there is no minimum threshold. Otherwise, for each creature in the encounter, the average CR of the encounter is calculated while excluding that creature. The highest of these averages is then halved to produce a minimum CR threshold. CRs less than this minimum are ignored for the purposes of calculating the final CR multiplier.}`,
				`{@note * If the maximum challenge rating is two or less, there is no minimum threshold. Similarly, if less than a third of the party are level 5 or higher, there is no minimum threshold. Otherwise, for each creature in the encounter in lowest-to-highest CR order, the average CR of the encounter is calculated while excluding that creature. Then, if the removed creature's CR is more than one deviation less than  this average, the process repeats. Once the process halts, this threshold value (average minus one deviation) becomes the final CR cutoff.}`,
				`<hr>`,
				{
					type: "quote",
					entries: [
						`&dagger; [...] don't count any monsters whose challenge rating is significantly below the average challenge rating of the other monsters in the group [...]`,
					],
					"by": `{@book ${Parser.sourceJsonToFull(Parser.SRC_DMG)}, page 82|DMG|3|4 Modify Total XP for Multiple Monsters}`,
				},
				`<hr>`,
				{
					"type": "table",
					"caption": "Encounter Multipliers",
					"colLabels": [
						"Number of Monsters",
						"Multiplier",
					],
					"colStyles": [
						"col-6 text-center",
						"col-6 text-center",
					],
					"rows": [
						[
							"1",
							"×1",
						],
						[
							"2",
							"×1.5",
						],
						[
							"3-6",
							"×2",
						],
						[
							"7-10",
							"×2.5",
						],
						[
							"11-14",
							"×3",
						],
						[
							"15 or more",
							"×4",
						],
					],
				},
				...(partyMeta && partyMeta.cntPlayers < 3
					? [
						{
							type: "quote",
							entries: [
								"If the party contains fewer than three characters, apply the next highest multiplier on the Encounter Multipliers table.",
							],
							"by": `{@book ${Parser.sourceJsonToFull(Parser.SRC_DMG)}, page 83|DMG|3|Party Size}`,
						},
					]
					: partyMeta && partyMeta.cntPlayers >= 6
						? [
							{
								type: "quote",
								entries: [
									"If the party contains six or more characters, use the next lowest multiplier on the table. Use a multiplier of 0.5 for a single monster.",
								],
								"by": `{@book ${Parser.sourceJsonToFull(Parser.SRC_DMG)}, page 83|DMG|3|Party Size}`,
							},
						]
						: []
				),
			],
		};
	}
}

export class EncounterBuilderRulesClassic extends EncounterBuilderRulesBase {
	rulesId = "classic";
	displayName = "Classic (5e/2014)";
	_tierHtmlProvider = new _TierHtmlProviderClassic();

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
			<div class="ve-flex ve-mb-2">${Renderer.get().render(`{@note Based on the encounter building rules on page 81 of the {@book ${Parser.sourceJsonToFull(Parser.SRC_DMG)}|DMG|3|Creating a Combat Encounter}}`)}</div>
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

	static _TITLE_BUDGET_DAILY = "This provides a rough estimate of the adjusted XP value for encounters the party can handle before the characters will need to take a long rest.";

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
				[TIER_EASY]: MiscUtil.COLOR_HEALTHY,
				[TIER_MEDIUM]: MiscUtil.COLOR_HURT,
				[TIER_HARD]: MiscUtil.COLOR_BLOODIED,
				[TIER_DEADLY]: MiscUtil.COLOR_DEFEATED,
				[TIER_ABSURD]: MiscUtil.COLOR_DEAD,
			},
			pFnDoGenerateRandomEncounter: this._pDoGenerateRandomEncounter.bind(this),
			pFnDoAdjustEncounter: this._pDoAdjustEncounter.bind(this),
		});

		const dispTtk = ee`<div></div>`;

		const dispBudgetDaily = ee`<div></div>`;
		const dispExpToLevel = ee`<div class="ve-muted"></div>`;

		const dispThermometer = thermometer.render()
			.addClass("ve-mt-2");

		this._comp.addHookPulseDeriverPartyMeta(() => {
			const partyMeta = this.getEncounterPartyMeta();
			const encounterSpendInfo = partyMeta.getEncounterSpendInfo(this._comp.creatureMetas);
			const tier = partyMeta.getEncounterTier(encounterSpendInfo);

			onHookPulseDeriverPartyMetaTierXp({partyMeta});

			const spendCap = partyMeta.getBudgetRange(TIER_ABSURD).budgetMin + (partyMeta.getBudgetRange(TIER_ABSURD).budgetMin - partyMeta.getBudgetRange(TIER_DEADLY).budgetMin);
			thermometer.setInfo({
				spendValue: encounterSpendInfo.adjustedSpend,
				spendCap,
				thresholds: Object.fromEntries(
					TIERS_EXTENDED
						.map(tier => [tier, tier === TIER_ABSURD ? spendCap : partyMeta.getBudget(tier)]),
				),
				tier: tier,
			});

			dispTtk
				.html(this._getTtkHtml({partyMeta}));

			dispBudgetDaily
				.html(`<span class="ve-help-subtle" title="${this.constructor._TITLE_BUDGET_DAILY}">Daily Budget:</span> ${partyMeta?.getDailyBudget().toLocaleStringVe() || "?"} XP`);

			dispExpToLevel.html(this._getRenderedExpToLevel({partyMeta}));
		})();

		const wrpGroupSummary = ee`<div class="ve-text-right">
			${dispsTierXp}
			${dispThermometer}
			<hr class="ve-hr-2">
			${dispTtk}
			<hr class="ve-hr-2">
			${dispBudgetDaily}
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
				.tooltip(new _TierHtmlProviderClassic().getTierTitle({tier}));
		})();

		return ee`<div class="ve-w-50">
			${dispDifficulty}
		</div>`;
	}

	_renderGroupAndDifficulty_getDifficultyRhs () {
		const dispXpRawTotal = ee`<h4></h4>`;
		const dispXpRawPerPlayer = ee`<i></i>`;

		const hovXpAdjustedInfo = ee`<span class="glyphicon glyphicon-info-sign ve-mr-2"></span>`;

		const dispXpAdjustedTotal = ee`<h4 class="ve-flex-v-center"></h4>`;
		const dispXpAdjustedPerPlayer = ee`<i></i>`;

		let infoHoverId = null;
		this._comp.addHookPulseDeriverPartyMeta(() => {
			const partyMeta = this.getEncounterPartyMeta();

			const encounterSpendInfo = partyMeta.getEncounterSpendInfo(this._comp.creatureMetas);

			dispXpRawTotal.txt(`Total XP: ${encounterSpendInfo.baseSpend?.toLocaleStringVe() || "?"}`);
			dispXpRawPerPlayer.txt(
				partyMeta?.cntPlayers
					? `(${Math.floor(encounterSpendInfo.baseSpend / partyMeta?.cntPlayers)?.toLocaleStringVe()} per player)`
					: "",
			);

			const infoEntry = _EncounterBuilderUiHelp.getHelpEntry({partyMeta, encounterSpendInfo});

			if (infoHoverId == null) {
				const hoverMeta = Renderer.hover.getMakePredefinedHover(infoEntry, {isBookContent: true});
				infoHoverId = hoverMeta.id;

				hovXpAdjustedInfo
					.off("mouseover")
					.off("mousemove")
					.off("mouseleave")
					.onn("mouseover", function (event) { hoverMeta.mouseOver(event, this); })
					.onn("mousemove", function (event) { hoverMeta.mouseMove(event, this); })
					.onn("mouseleave", function (event) { hoverMeta.mouseLeave(event, this); });
			} else {
				Renderer.hover.updatePredefinedHover(infoHoverId, infoEntry);
			}

			dispXpAdjustedTotal.html(`Adjusted XP <span class="ve-small ve-muted ve-ml-2" title="XP Multiplier">(×${encounterSpendInfo.playerAdjustedSpendMult})</span>: <b class="ve-ml-2">${encounterSpendInfo.adjustedSpend.toLocaleStringVe()}</b>`);

			dispXpAdjustedPerPlayer.txt(
				partyMeta?.cntPlayers
					? `(${Math.floor(encounterSpendInfo.adjustedSpend / partyMeta.cntPlayers).toLocaleStringVe()} per player)`
					: "",
			);
		})();

		return ee`<div class="ve-w-50 ve-text-right">
			${dispXpRawTotal}
			<div>${dispXpRawPerPlayer}</div>
			<div class="ve-flex-v-center ve-flex-h-right">${hovXpAdjustedInfo}${dispXpAdjustedTotal}</div>
			<div>${dispXpAdjustedPerPlayer}</div>
		</div>`;
	}

	_getEncounterPartyMeta (playerMetas) {
		return new EncounterPartyMetaClassic(playerMetas);
	}

	/* -------------------------------------------- */

	getDisplaySummary () {
		const encounterXpInfo = this
			.getEncounterPartyMeta()
			.getEncounterSpendInfo(this._comp.creatureMetas);

		return [
			`${encounterXpInfo.baseSpend.toLocaleStringVe()} XP`,
			encounterXpInfo.baseSpend !== encounterXpInfo.adjustedSpend
				? `(<span class="ve-help" title="Adjusted Encounter XP">Enc</span>: ${encounterXpInfo.adjustedSpend.toLocaleStringVe()} XP)`
				: "",
		]
			.filter(Boolean)
			.join(" ");
	}

	/* -------------------------------------------- */

	_getDefaultState () {
		return {
			...super._getDefaultState(),
			tierRandom: TIER_MEDIUM,
			tierAdjust: TIER_MEDIUM,
		};
	}
}
