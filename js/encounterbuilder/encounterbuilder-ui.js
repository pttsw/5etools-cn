import {EncounterBuilderRandomizer} from "./encounterbuilder-randomizer.js";
import {EncounterBuilderCreatureMeta, EncounterBuilderXpInfo, EncounterPartyMeta} from "./encounterbuilder-models.js";
import {EncounterBuilderUiTtk} from "./encounterbuilder-ui-ttk.js";
import {EncounterBuilderUiHelp} from "./encounterbuilder-ui-help.js";
import {EncounterBuilderRenderableCollectionPlayersSimple} from "./encounterbuilder-playerssimple.js";
import {EncounterBuilderRenderableCollectionColsExtraAdvanced} from "./encounterbuilder-colsextraadvanced.js";
import {EncounterBuilderRenderableCollectionPlayersAdvanced} from "./encounterbuilder-playersadvanced.js";
import {EncounterBuilderAdjuster} from "./encounterbuilder-adjuster.js";

/**
 * TODO rework this to use doubled multipliers for XP, so we avoid the 0.5x issue for 6+ party sizes. Then scale
 *   everything back down at the end.
 */
export class EncounterBuilderUi extends BaseComponent {
	static _RenderState = class {
		constructor () {
			this.wrpRowsSimple = null;
			this.wrpRowsAdvanced = null;
			this.wrpHeadersAdvanced = null;
			this.wrpFootersAdvanced = null;

			this.infoHoverId = null;

			this._collectionPlayersSimple = null;
			this._collectionColsExtraAdvanced = null;
			this._collectionPlayersAdvanced = null;
		}
	};

	/* -------------------------------------------- */

	_cache = null;
	_comp = null;

	constructor ({cache, comp}) {
		super();

		this._cache = cache;
		this._comp = comp;
	}

	/**
	 * @param {?HTMLElementExtended} parentRandomAndAdjust
	 * @param {?HTMLElementExtended} parentViewer
	 * @param {?HTMLElementExtended} parentGroupAndDifficulty
	 */
	render (
		{
			parentRandomAndAdjust = null,
			parentViewer = null,
			parentGroupAndDifficulty = null,
		},
	) {
		const rdState = new this.constructor._RenderState();

		this._render_randomAndAdjust({rdState, parentRandomAndAdjust});
		this._render_viewer({rdState, parentViewer});
		this._render_groupAndDifficulty({rdState, parentGroupAndDifficulty});
		this._render_addHooks({rdState});
	}

	/* -------------------------------------------- */

	_render_randomAndAdjust ({parentRandomAndAdjust}) {
		const {
			btnRandom,
			btnRandomMode,
			liRandomEasy,
			liRandomMedium,
			liRandomHard,
			liRandomDeadly,
		} = this._render_randomAndAdjust_getRandomMeta();

		const {
			btnAdjust,
			btnAdjustMode,
			liAdjustEasy,
			liAdjustMedium,
			liAdjustHard,
			liAdjustDeadly,
		} = this._render_randomAndAdjust_getAdjustMeta();

		ee(parentRandomAndAdjust)`<div class="ve-flex-col">
			<div class="ve-flex-h-right mb-3">${Renderer.get().render(`{@note ${I18nUtil.get("page.enconterbuilder.rules_note")} {@book ${Parser.sourceJsonToFull(Parser.SRC_DMG)}|DMG|3|Creating a Combat Encounter}}`)}</div>

			<div class="ve-flex-h-right">
				<div class="ve-btn-group mr-3">
					${btnRandom}
					${btnRandomMode}
					<ul class="ve-dropdown-menu">
						${liRandomEasy}
						${liRandomMedium}
						${liRandomHard}
						${liRandomDeadly}
					</ul>
				</div>

				<div class="ve-btn-group">
					${btnAdjust}
					${btnAdjustMode}
					<ul class="ve-dropdown-menu">
						${liAdjustEasy}
						${liAdjustMedium}
						${liAdjustHard}
						${liAdjustDeadly}
					</ul>
				</div>
			</div>
		</div>`;
	}

	_render_randomAndAdjust_getRandomMeta () {
		let modeRandom = "medium";

		const pSetRandomMode = async (mode) => {
			const randomizer = new EncounterBuilderRandomizer({
				partyMeta: this._getPartyMeta(),
				cache: this._cache,
			});
			const randomCreatureMetas = await randomizer.pGetRandomEncounter({
				difficulty: mode,
				lockedEncounterCreatures: this._comp.creatureMetas.filter(creatureMeta => creatureMeta.isLocked),
			});

			if (randomCreatureMetas != null) this._comp.creatureMetas = randomCreatureMetas;

			modeRandom = mode;
			btnRandom
				.txt(`Random ${mode.toTitleCase()}`)
				.tooltip(`Randomly generate ${Parser.getArticle(mode)} ${Parser.encounterDifficultyToCn(mode)} encounter`);
		};

		const getLiRandom = (mode) => {
			return ee`<li title="随机生成${Parser.getArticle(mode)}${Parser.encounterDifficultyToCn(mode)}难度遭遇"><a href="#">随机${Parser.encounterDifficultyToCn(mode)}难度</a></li>`
				.onn("click", async (evt) => {
					evt.preventDefault();
					await pSetRandomMode(mode);
				});
		};

		const btnRandom = ee`<button class="ve-btn ve-btn-primary ecgen__btn-random-adjust" title="随机生成一个中等难度遭遇">随机中等难度</button>`
			.onn("click", async evt => {
				evt.preventDefault();
				await pSetRandomMode(modeRandom);
			});

		const btnRandomMode = ee`<button class="ve-btn ve-btn-primary ve-dropdown-toggle"><span class="caret"></span></button>`;
		JqueryUtil.bindDropdownButton(btnRandomMode);

		return {
			btnRandom,
			btnRandomMode,
			liRandomEasy: getLiRandom("easy"),
			liRandomMedium: getLiRandom("medium"),
			liRandomHard: getLiRandom("hard"),
			liRandomDeadly: getLiRandom("deadly"),
		};
	}

	_render_randomAndAdjust_getAdjustMeta () {
		let modeAdjust = "medium";

		const pSetAdjustMode = async (mode) => {
			const adjuster = new EncounterBuilderAdjuster({
				partyMeta: this._getPartyMeta(),
			});
			const adjustedCreatureMetas = await adjuster.pGetAdjustedEncounter({
				difficulty: mode,
				creatureMetas: this._comp.creatureMetas,
			});

			if (adjustedCreatureMetas != null) this._comp.creatureMetas = adjustedCreatureMetas;

			modeAdjust = mode;
			btnAdjust
				.txt(`调整至${Parser.encounterDifficultyToCn(mode)}难度`)
				.tooltip(`调整当前遭遇至${Parser.encounterDifficultyToCn(mode)}难度`);
		};

		const getLiAdjust = (mode) => {
			return ee`<li title="调整当前遭遇至${Parser.encounterDifficultyToCn(mode)}难度"><a href="#">调整至${Parser.encounterDifficultyToCn(mode)}难度</a></li>`
				.onn("click", async (evt) => {
					evt.preventDefault();
					await pSetAdjustMode(mode);
				});
		};

		const btnAdjust = ee`<button class="ve-btn ve-btn-primary ecgen__btn-random-adjust" title="调整当前遭遇至中等难度">调整至中等难度</button>`
			.onn("click", async evt => {
				evt.preventDefault();
				await pSetAdjustMode(modeAdjust);
			});

		const btnAdjustMode = ee`<button class="ve-btn ve-btn-primary ve-dropdown-toggle"><span class="caret"></span></button>`;
		JqueryUtil.bindDropdownButton(btnAdjustMode);

		return {
			btnAdjust,
			btnAdjustMode,
			liAdjustEasy: getLiAdjust("easy"),
			liAdjustMedium: getLiAdjust("medium"),
			liAdjustHard: getLiAdjust("hard"),
			liAdjustDeadly: getLiAdjust("deadly"),
		};
	}

	/* -------------------------------------------- */

	_render_viewer ({parentViewer}) {
		if (!parentViewer) return;

		const wrpOutput = ee`<div class="py-2 mt-5 ecgen-viewer__wrp-output"></div>`
			.hideVe();

		ee(parentViewer)`${wrpOutput}`;

		this._comp.addHookCreatureMetas(() => {
			const lis = this._comp.creatureMetas
				.map(creatureMeta => {
					const btnShuffle = ee`<button class="ve-btn ve-btn-default ve-btn-xs"><span class="glyphicon glyphicon-random"></span></button>`
						.onn("click", () => {
							this._doShuffle({creatureMeta});
						});

					return ee`<li>${btnShuffle} <span>${Renderer.get().render(`${creatureMeta.count}× {@creature ${creatureMeta.creature.name}|${creatureMeta.creature.source}}`)}</span></li>`;
				});

			if (lis.length) wrpOutput.showVe();

			ee(wrpOutput.empty())`<ul class="mb-0">
				${lis}
			</ul>`;
		})();
	}

	/* -------------------------------------------- */

	_render_groupAndDifficulty ({rdState, parentGroupAndDifficulty}) {
		const {
			stg: stgSimple,
			wrpRows: wrpRowsSimple,
		} = this._renderGroupAndDifficulty_getGroupEles_simple();
		rdState.wrpRowsSimple = wrpRowsSimple;

		const {
			stg: stgAdvanced,
			wrpRows: wrpRowsAdvanced,
			wrpHeaders: wrpHeadersAdvanced,
			wrpFooters: wrpFootersAdvanced,
		} = this._renderGroupAndDifficulty_getGroupEles_advanced();
		rdState.wrpRowsAdvanced = wrpRowsAdvanced;
		rdState.wrpHeadersAdvanced = wrpHeadersAdvanced;
		rdState.wrpFootersAdvanced = wrpFootersAdvanced;

		const hrHasCreatures = ee`<hr class="hr-1">`;
		const wrpDifficulty = ee`<div class="ve-flex">
			${this._renderGroupAndDifficulty_getDifficultyLhs()}
			${this._renderGroupAndDifficulty_getDifficultyRhs({rdState})}
		</div>`;

		this._addHookBase("derivedGroupAndDifficulty", () => {
			const {
				encounterXpInfo = EncounterBuilderXpInfo.getDefault(),
			} = this._state.derivedGroupAndDifficulty;
			hrHasCreatures.toggleVe(encounterXpInfo.relevantCount);
			wrpDifficulty.toggleVe(encounterXpInfo.relevantCount);
		})();

		ee(parentGroupAndDifficulty)`
		<h3 class="mt-1 m-2">队伍信息</h3>
		<div class="ve-flex">
			${stgSimple}
			${stgAdvanced}
			${this._renderGroupAndDifficulty_getGroupInfoRhs()}
		</div>

		${hrHasCreatures}
		${wrpDifficulty}`;

		rdState.collectionPlayersSimple = new EncounterBuilderRenderableCollectionPlayersSimple({
			comp: this._comp,
			rdState,
		});

		rdState.collectionColsExtraAdvanced = new EncounterBuilderRenderableCollectionColsExtraAdvanced({
			comp: this._comp,
			rdState,
		});

		rdState.collectionPlayersAdvanced = new EncounterBuilderRenderableCollectionPlayersAdvanced({
			comp: this._comp,
			rdState,
		});
	}

	_renderGroupAndDifficulty_getGroupEles_simple () {
		const btnAddPlayers = ee`<button class="ve-btn ve-btn-primary ve-btn-xs"><span class="glyphicon glyphicon-plus"></span> 添加另一等级的队伍</button>`
			.onn("click", () => this._comp.doAddPlayer());

		const wrpRows = ee`<div class="ve-flex-col w-100"></div>`;

		const stg = ee`<div class="w-70 ve-flex-col">
			<div class="ve-flex">
				<div class="w-20">玩家:</div>
				<div class="w-20">等级:</div>
			</div>

			${wrpRows}

			<div class="mb-1 ve-flex">
				<div class="ecgen__wrp_add_players_btn_wrp">
					${btnAddPlayers}
				</div>
			</div>

			${this._renderGroupAndDifficulty_getPtAdvancedMode()}

		</div>`;

		this._comp.addHookIsAdvanced(() => {
			stg.toggleVe(!this._comp.isAdvanced);
		})();

		return {
			wrpRows,
			stg,
		};
	}

	_renderGroupAndDifficulty_getGroupEles_advanced () {
		const btnAddPlayers = ee`<button class="ve-btn ve-btn-primary ve-btn-xs"><span class="glyphicon glyphicon-plus"></span> 新增另一玩家</button>`
			.onn("click", () => this._comp.doAddPlayer());

		const btnAddAdvancedCol = ee`<button class="ve-btn ve-btn-primary ve-btn-xxs ecgen-player__btn-inline h-ipt-xs bl-0 bb-0 bbl-0 bbr-0 btl-0 ml-n1" title="新增列" tabindex="-1"><span class="glyphicon glyphicon-list-alt"></span></button>`
			.onn("click", () => this._comp.doAddColExtraAdvanced());

		const wrpHeaders = ee`<div class="ve-flex"></div>`;
		const wrpFooters = ee`<div class="ve-flex"></div>`;

		const wrpRows = ee`<div class="ve-flex-col"></div>`;

		const stg = ee`<div class="w-70 ve-overflow-x-auto ve-flex-col">
			<div class="ve-flex-h-center mb-2 bb-1p small-caps ve-self-flex-start">
				<div class="w-100p mr-1 h-ipt-xs no-shrink">名称</div>
				<div class="w-40p ve-text-center mr-1 h-ipt-xs no-shrink">等级</div>
				${wrpHeaders}
				${btnAddAdvancedCol}
			</div>

			${wrpRows}

			<div class="mb-1 ve-flex">
				<div class="ecgen__wrp_add_players_btn_wrp no-shrink no-grow">
					${btnAddPlayers}
				</div>
				${wrpFooters}
			</div>

			${this._renderGroupAndDifficulty_getPtAdvancedMode()}

			<div class="row">
				<div class="w-100">
					${Renderer.get().render(`{@note 额外的列将被导入到DM帷幕中。}`)}
				</div>
			</div>
		</div>`;

		this._comp.addHookIsAdvanced(() => {
			stg.toggleVe(this._comp.isAdvanced);
		})();

		return {
			stg,
			wrpRows,
			wrpHeaders,
			wrpFooters,
		};
	}

	_renderGroupAndDifficulty_getPtAdvancedMode () {
		const cbAdvanced = ComponentUiUtil.getCbBool(this._comp, "isAdvanced");

		return ee`<div class="ve-flex-v-center">
			<label class="ve-flex-v-center">
				<div class="mr-2">高级模式</div>
				${cbAdvanced}
			</label>
		</div>`;
	}

	static _TITLE_DIFFICULTIES = {
		easy: "一次简单的遭遇几乎不会消耗角色们的资源，也不会给他们造成严重的后果，他们可能只是失去几点生命值，但胜利几乎是板上钉钉的事。",
		medium: "一次中等的遭遇通常会让玩家们经历一两次惊心时刻，但是不会对角色们造成任何伤亡。只是其中若干人员可能会需要使用治疗资源。",
		hard: " 对冒险者们而言，一次困难的遭遇可能会发展得很糟糕。较弱的角色可能会在战斗中被清除，甚至有较小的可能导致一个或多个角色因此死亡。",
		deadly: "对某些玩家而言，致命的遭遇可以造成足以致命的后果。此时需要优秀的策略和快速的思考才能确保生还，而失败时也必须承当相应的风险。",
		absurd: "“荒谬”的遭遇按规则来说属于致命的遭遇，但在此处单独划分一类，旨在提供一种额外的工具，用于精准判断某场 “致命” 遭遇的实际致命程度。其XP的计算方式为：致命 +（致命 - 困难）",
	};
	static _TITLE_BUDGET_DAILY = "这样就可以粗略的计算出在角色们需要进行一次长休前，队伍可处理遭遇的校正XP值。";
	static _TITLE_XP_TO_NEXT_LEVEL = "队伍中每个角色都能升一级的总XP";
	static _TITLE_TTK = "Time to Kill: 队伍完成这次遭遇需要的预估回合数。假设每次攻击都是单目标攻击。";

	static _getDifficultyKey ({partyMeta, encounterXpInfo}) {
		if (encounterXpInfo.adjustedXp >= partyMeta.easy && encounterXpInfo.adjustedXp < partyMeta.medium) return "easy";
		if (encounterXpInfo.adjustedXp >= partyMeta.medium && encounterXpInfo.adjustedXp < partyMeta.hard) return "medium";
		if (encounterXpInfo.adjustedXp >= partyMeta.hard && encounterXpInfo.adjustedXp < partyMeta.deadly) return "hard";
		if (encounterXpInfo.adjustedXp >= partyMeta.deadly && encounterXpInfo.adjustedXp < partyMeta.absurd) return "deadly";
		if (encounterXpInfo.adjustedXp >= partyMeta.absurd) return "absurd";
		return "trivial";
	}

	static _getDifficultyHtml ({partyMeta, difficulty}) {
		return `<span class="help-subtle" title="${this._TITLE_DIFFICULTIES[difficulty]}">${Parser.encounterDifficultyToCn(difficulty)}:</span> ${partyMeta[difficulty].toLocaleStringVe()} XP`;
	}

	_renderGroupAndDifficulty_getGroupInfoRhs () {
		const dispXpEasy = ee`<div></div>`;
		const dispXpMedium = ee`<div></div>`;
		const dispXpHard = ee`<div></div>`;
		const dispXpDeadly = ee`<div></div>`;
		const dispXpAbsurd = ee`<div></div>`;

		const dispsXpDifficulty = {
			"easy": dispXpEasy,
			"medium": dispXpMedium,
			"hard": dispXpHard,
			"deadly": dispXpDeadly,
			"absurd": dispXpAbsurd,
		};

		const dispTtk = ee`<div></div>`;

		const dispBudgetDaily = ee`<div></div>`;
		const dispExpToLevel = ee`<div class="ve-muted"></div>`;

		this._addHookBase("derivedGroupAndDifficulty", () => {
			const {
				partyMeta = EncounterPartyMeta.getDefault(),
				encounterXpInfo = EncounterBuilderXpInfo.getDefault(),
			} = this._state.derivedGroupAndDifficulty;

			const difficulty = this.constructor._getDifficultyKey({partyMeta, encounterXpInfo});

			Object.entries(dispsXpDifficulty)
				.forEach(([difficulty_, disp]) => {
					disp
						.toggleClass("bold", difficulty === difficulty_)
						.html(this.constructor._getDifficultyHtml({partyMeta, difficulty: difficulty_}));
				});

			dispTtk
				.html(`<span class="help" title="${this.constructor._TITLE_TTK}">TTK:</span> ${EncounterBuilderUiTtk.getApproxTurnsToKill({partyMeta, creatureMetas: this._comp.creatureMetas}).toFixed(2)}`);

			dispBudgetDaily
				.html(`<span class="help-subtle" title="${this.constructor._TITLE_BUDGET_DAILY}">每日XP:</span> ${partyMeta.dailyBudget.toLocaleStringVe()} XP`);

			dispExpToLevel
				.html(`<span class="help-subtle" title="${this.constructor._TITLE_XP_TO_NEXT_LEVEL}">升级XP:</span> ${partyMeta.xpToNextLevel.toLocaleStringVe()} XP`);
		})();

		return ee`<div class="w-30 ve-text-right">
			${dispXpEasy}
			${dispXpMedium}
			${dispXpHard}
			${dispXpDeadly}
			${dispXpAbsurd}
			<br>
			${dispTtk}
			<br>
			${dispBudgetDaily}
			${dispExpToLevel}
		</div>`;
	}

	_renderGroupAndDifficulty_getDifficultyLhs () {
		const dispDifficulty = ee`<h3 class="mt-2"></h3>`;

		this._addHookBase("derivedGroupAndDifficulty", () => {
			const {
				partyMeta = EncounterPartyMeta.getDefault(),
				encounterXpInfo = EncounterBuilderXpInfo.getDefault(),
			} = this._state.derivedGroupAndDifficulty;

			const difficulty = this.constructor._getDifficultyKey({partyMeta, encounterXpInfo});

			dispDifficulty.txt(`难度: ${Parser.encounterDifficultyToCn(difficulty)}`);
		})();

		return ee`<div class="w-50">
			${dispDifficulty}
		</div>`;
	}

	_renderGroupAndDifficulty_getDifficultyRhs ({rdState}) {
		const dispXpRawTotal = ee`<h4></h4>`;
		const dispXpRawPerPlayer = ee`<i></i>`;

		const hovXpAdjustedInfo = ee`<span class="glyphicon glyphicon-info-sign mr-2"></span>`;

		const dispXpAdjustedTotal = ee`<h4 class="ve-flex-v-center"></h4>`;
		const dispXpAdjustedPerPlayer = ee`<i></i>`;

		this._addHookBase("derivedGroupAndDifficulty", () => {
			const {
				partyMeta = EncounterPartyMeta.getDefault(),
				encounterXpInfo = EncounterBuilderXpInfo.getDefault(),
			} = this._state.derivedGroupAndDifficulty;

			dispXpRawTotal.txt(`总XP: ${encounterXpInfo.baseXp.toLocaleStringVe()}`);
			dispXpRawPerPlayer.txt(`(每位玩家${Math.floor(encounterXpInfo.baseXp / partyMeta.cntPlayers).toLocaleStringVe()})`);

			const infoEntry = EncounterBuilderUiHelp.getHelpEntry({partyMeta, encounterXpInfo});

			if (rdState.infoHoverId == null) {
				const hoverMeta = Renderer.hover.getMakePredefinedHover(infoEntry, {isBookContent: true});
				rdState.infoHoverId = hoverMeta.id;

				hovXpAdjustedInfo
					.off("mouseover")
					.off("mousemove")
					.off("mouseleave")
					.onn("mouseover", evt => hoverMeta.mouseOver(evt, hovXpAdjustedInfo))
					.onn("mousemove", evt => hoverMeta.mouseMove(evt, hovXpAdjustedInfo))
					.onn("mouseleave", evt => hoverMeta.mouseLeave(evt, hovXpAdjustedInfo));
			} else {
				Renderer.hover.updatePredefinedHover(rdState.infoHoverId, infoEntry);
			}

			dispXpAdjustedTotal.html(`建议XP <span class="ve-small ve-muted ml-2" title="XP 乘数">(×${encounterXpInfo.playerAdjustedXpMult})</span>: <b class="ml-2">${encounterXpInfo.adjustedXp.toLocaleStringVe()}</b>`);
			dispXpAdjustedPerPlayer.txt(`(每位玩家${Math.floor(encounterXpInfo.adjustedXp / partyMeta.cntPlayers).toLocaleStringVe()})`);
		})();

		return ee`<div class="w-50 ve-text-right">
			${dispXpRawTotal}
			<div>${dispXpRawPerPlayer}</div>
			<div class="ve-flex-v-center ve-flex-h-right">${hovXpAdjustedInfo}${dispXpAdjustedTotal}</div>
			<div>${dispXpAdjustedPerPlayer}</div>
		</div>`;
	}

	/* -------------------------------------------- */

	_render_addHooks ({rdState}) {
		this._comp.addHookPlayersSimple((valNotFirstRun) => {
			rdState.collectionPlayersSimple.render();

			if (valNotFirstRun == null) return;
			this._render_hk_setDerivedGroupAndDifficulty();
			this._render_hk_doUpdateExternalStates();
		})();

		this._comp.addHookPlayersAdvanced((valNotFirstRun) => {
			rdState.collectionPlayersAdvanced.render();

			if (valNotFirstRun == null) return;
			this._render_hk_setDerivedGroupAndDifficulty();
			this._render_hk_doUpdateExternalStates();
		})();

		this._comp.addHookIsAdvanced((valNotFirstRun) => {
			if (valNotFirstRun == null) return;
			this._render_hk_setDerivedGroupAndDifficulty();
			this._render_hk_doUpdateExternalStates();
		})();

		this._comp.addHookCreatureMetas(() => {
			this._render_hk_setDerivedGroupAndDifficulty();
			this._render_hk_doUpdateExternalStates();
		})();

		this._comp.addHookColsExtraAdvanced(() => {
			rdState.collectionColsExtraAdvanced.render();
			this._render_hk_doUpdateExternalStates();
		})();
	}

	_render_hk_setDerivedGroupAndDifficulty () {
		const partyMeta = this._getPartyMeta();
		const encounterXpInfo = EncounterBuilderCreatureMeta.getEncounterXpInfo(this._comp.creatureMetas, this._getPartyMeta());

		this._state.derivedGroupAndDifficulty = {
			partyMeta,
			encounterXpInfo,
		};
	}

	_render_hk_doUpdateExternalStates () {
		/* Implement as required */
	}

	/* -------------------------------------------- */

	_doShuffle ({creatureMeta}) {
		if (creatureMeta.isLocked) return;

		const ix = this._comp.creatureMetas.findIndex(creatureMeta_ => creatureMeta_.isSameCreature(creatureMeta));
		if (!~ix) throw new Error(`Could not find creature ${creatureMeta.getHash()} (${creatureMeta.customHashId})`);

		const creatureMeta_ = this._comp.creatureMetas[ix];
		if (creatureMeta_.isLocked) return;

		const lockedHashes = new Set(
			this._comp.creatureMetas
				.filter(creatureMeta => creatureMeta.isLocked)
				.map(creatureMeta => creatureMeta.getHash()),
		);

		const monRolled = this._doShuffle_getShuffled({creatureMeta: creatureMeta_, lockedHashes});
		if (!monRolled) return JqueryUtil.doToast({content: "Could not find another creature worth the same amount of XP!", type: "warning"});

		const creatureMetaNxt = new EncounterBuilderCreatureMeta({
			creature: monRolled,
			count: creatureMeta_.count,
		});

		const creatureMetasNxt = [...this._comp.creatureMetas];
		const withMonRolled = creatureMetasNxt.find(creatureMeta_ => creatureMeta_.hasCreature(monRolled));
		if (withMonRolled) {
			withMonRolled.count += creatureMetaNxt.count;
			creatureMetasNxt.splice(ix, 1);
		} else {
			creatureMetasNxt[ix] = creatureMetaNxt;
		}

		this._comp.creatureMetas = creatureMetasNxt;
	}

	_doShuffle_getShuffled ({creatureMeta, lockedHashes}) {
		const xp = creatureMeta.getXp();
		const hash = creatureMeta.getHash();

		const availMons = this._cache.getCreaturesByXp(xp)
			.filter(mon => {
				const hash_ = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY](mon);
				return !lockedHashes.has(hash) && hash_ !== hash;
			});
		if (!availMons.length) return null;

		return RollerUtil.rollOnArray(availMons);
	}

	/* -------------------------------------------- */

	_getPartyMeta () {
		return this._comp.getPartyMeta();
	}

	_getDefaultState () {
		return {
			derivedGroupAndDifficulty: {},
		};
	}
}
