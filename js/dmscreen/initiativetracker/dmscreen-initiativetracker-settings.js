import {InitiativeTrackerUi} from "./dmscreen-initiativetracker-ui.js";
import {
	GROUP_DISPLAY_NAMES,
	InitiativeTrackerStatColumnFactory,
	IS_PLAYER_VISIBLE_ALL,
	IS_PLAYER_VISIBLE_NONE,
	IS_PLAYER_VISIBLE_PLAYER_UNITS_ONLY,
} from "./dmscreen-initiativetracker-statcolumns.js";

class _RenderableCollectionStatsCols extends RenderableCollectionGenericRows {
	constructor (
		{
			comp,

			doClose,
			$wrpRows,
		},
	) {
		super(comp, "statsCols", $wrpRows);
		this._doClose = doClose;
	}

	_populateRow ({comp, $wrpRow, entity}) {
		$wrpRow.addClass("py-1p");

		const meta = InitiativeTrackerStatColumnFactory.fromPopulateWith({populateWith: comp._state.populateWith});

		const $iptAbv = ComponentUiUtil.$getIptStr(comp, "abbreviation");

		const $cbIsEditable = ComponentUiUtil.$getCbBool(comp, "isEditable");

		const $btnVisible = InitiativeTrackerUi.$getBtnPlayerVisible(
			comp._state.isPlayerVisible,
			() => comp._state.isPlayerVisible = $btnVisible.hasClass("ve-btn-primary--half")
				? IS_PLAYER_VISIBLE_PLAYER_UNITS_ONLY
				: $btnVisible.hasClass("ve-btn-primary")
					? IS_PLAYER_VISIBLE_ALL
					: IS_PLAYER_VISIBLE_NONE,
			true,
		);

		const $btnDelete = this._utils.$getBtnDelete({entity});

		const $padDrag = this._utils.$getPadDrag({$wrpRow});

		$$($wrpRow)`
			<div class="ve-col-5 pr-1">${meta.constructor.NAME}</div>
			<div class="ve-col-3 pr-1">${$iptAbv}</div>
			<div class="ve-col-1-5 ve-text-center">${$cbIsEditable}</div>
			<div class="ve-col-1-5 ve-text-center">${$btnVisible}</div>

			<div class="ve-col-0-5 ve-flex-vh-center">${$btnDelete}</div>
			<div class="ve-col-0-5 ve-flex-vh-center">${$padDrag}</div>
		`;
	}
}

export class InitiativeTrackerSettings extends BaseComponent {
	static _PROPS_TRACKED = [
		"isRollInit",
		"isRollHp",
		"isRollGroups",
		"isRerollInitiativeEachRound",
		"isInvertWoundDirection",
		"playerInitShowExactPlayerHp",
		"playerInitShowExactMonsterHp",
		"playerInitHideNewMonster",
		"playerInitShowOrdinals",
		"isStatsAddColumns",
		"statsCols",
	];

	constructor ({state}) {
		super();

		this._proxyAssignSimple(
			"state",
			{
				...InitiativeTrackerSettings._PROPS_TRACKED
					.mergeMap(prop => ({[prop]: state[prop]})),
				statsCols: this._getStatColsCollectionFormat(state.statsCols),
			},
		);
	}

	/* -------------------------------------------- */

	// Convert from classic "flat" format to renderable collection format
	_getStatColsCollectionFormat (statsCols) {
		return (statsCols || [])
			.map(data => {
				return InitiativeTrackerStatColumnFactory.fromStateData({data})
					.getAsCollectionRowStateData();
			});
	}

	// Convert from renderable collection format to classic "flat" format
	_getStatColsDataFormat (statsCols) {
		return (statsCols || [])
			.map(data => {
				return InitiativeTrackerStatColumnFactory.fromCollectionRowStateData({data})
					.getAsStateData();
			});
	}

	/* -------------------------------------------- */

	getStateUpdate () {
		const out = MiscUtil.copyFast(this._state);
		out.statsCols = this._getStatColsDataFormat(out.statsCols);
		return out;
	}

	/* -------------------------------------------- */

	pGetShowModalResults () {
		const {$modalInner, $modalFooter, pGetResolved, doClose} = UiUtil.getShowModal({
			title: "设置",
			isUncappedHeight: true,
			hasFooter: true,
		});

		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_isRolls({$modalInner});
		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_wounds({$modalInner});
		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_playerView({$modalInner});
		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_additionalCols({$modalInner});

		this._pGetShowModalResults_renderFooter({$modalFooter, doClose});

		return pGetResolved();
	}

	/* -------------------------------------------- */

	_pGetShowModalResults_renderSection_isRolls ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRollInit", text: "掷先攻骰"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRollHp", text: "掷生命值骰"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRollGroups", text: "一组生物一起掷骰"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRerollInitiativeEachRound", text: "每轮重新掷先攻骰"});
	}

	_pGetShowModalResults_renderSection_wounds ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isInvertWoundDirection", text: "Track Hit Points as Damage", title: `For example, by default a creature might have "100/100" hit points when at full HP. When tracking damage, this would instead be displayed as "0/100" when the creature is at full HP.`});
	}

	_pGetShowModalResults_renderSection_playerView ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "playerInitShowExactPlayerHp", text: "玩家视图：显示玩家生命值"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "playerInitShowExactMonsterHp", text: "玩家视图：显示怪物生命值"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "playerInitHideNewMonster", text: "玩家视图：自动隐藏新怪物"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "playerInitShowOrdinals", text: "玩家视图：显示序号", title: "例如，如果你添加了两个地精，一个将是地精（1），另一个将是地精（2），而不是具有相同名称的两个地精。"});
	}

	_pGetShowModalResults_renderSection_additionalCols ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isStatsAddColumns", text: "额外列"});
		this._pGetShowModalResults_renderSection_additionalCols_head({$modalInner});
		this._pGetShowModalResults_renderSection_additionalCols_body({$modalInner});
	}

	_pGetShowModalResults_renderSection_additionalCols_head ({$modalInner}) {
		const getAction = Cls => new ContextUtil.Action(
			Cls.NAME,
			() => {
				this._state.statsCols = [...this._state.statsCols, new Cls().getAsCollectionRowStateData()];
			},
		);

		const menuAddStatsCol = ContextUtil.getMenu(
			InitiativeTrackerStatColumnFactory.getGroupedByUi()
				.map(group => {
					const [ClsHead] = group;

					if (group.length === 1) return getAction(ClsHead);

					return new ContextUtil.ActionSubMenu(
						GROUP_DISPLAY_NAMES[ClsHead.GROUP],
						group.map(Cls => getAction(Cls)),
					);
				}),
		);

		const $btnAddRow = $(`<button class="ve-btn ve-btn-default ve-btn-xs bb-0 bbr-0 bbl-0" title="Add"><span class="glyphicon glyphicon-plus"></span></button>`)
			.click(evt => ContextUtil.pOpenMenu(evt, menuAddStatsCol));

		const $wrpTblStatsHead = $$`<div class="ve-flex-vh-center w-100 mb-2 bb-1p-trans">
			<div class="ve-col-5">内容</div>
			<div class="ve-col-3">缩写</div>
			<div class="ve-col-1-5 ve-text-center help" title="只影响生物行。玩家行总是可编辑的">可编辑</div>
			<div class="ve-col-1-5">&nbsp;</div>
			<div class="ve-col-1 ve-flex-v-center ve-flex-h-right">${$btnAddRow}</div>
		</div>`
			.appendTo($modalInner);

		this._addHookBase("isStatsAddColumns", () => $wrpTblStatsHead.toggleVe(this._state.isStatsAddColumns))();
	}

	_pGetShowModalResults_renderSection_additionalCols_body ({$modalInner}) {
		const $wrpRows = $(`<div class="pr-1 h-120p ve-flex-col ve-overflow-y-auto relative"></div>`).appendTo($modalInner);
		this._addHookBase("isStatsAddColumns", () => $wrpRows.toggleVe(this._state.isStatsAddColumns))();

		const renderableCollectionStatsCols = new _RenderableCollectionStatsCols(
			{
				comp: this,
				$wrpRows,
			},
		);

		this._addHookBase("statsCols", () => {
			renderableCollectionStatsCols.render();
		})();
	}

	/* -------------------------------------------- */

	_pGetShowModalResults_renderFooter ({$modalFooter, doClose}) {
		const $btnSave = $(`<button class="ve-btn ve-btn-primary ve-btn-sm w-100">Save</button>`)
			.click(() => doClose(true));

		$$($modalFooter)`<div class="w-100 py-3 no-shrink">
			${$btnSave}
		</div>`;
	}
}
