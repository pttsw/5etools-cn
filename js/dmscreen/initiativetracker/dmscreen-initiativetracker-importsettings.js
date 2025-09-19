export class InitiativeTrackerSettingsImport extends BaseComponent {
	static _PROPS_TRACKED = [
		"isRollInit",
		"isRollHp",
		"importIsRollGroups",
		"importIsAddPlayers",
		"importIsAppend",
	];

	constructor ({state}) {
		super();

		this._proxyAssignSimple(
			"state",
			InitiativeTrackerSettingsImport._PROPS_TRACKED
				.mergeMap(prop => ({[prop]: state[prop]})),
		);
	}

	/* -------------------------------------------- */

	getStateUpdate () {
		return MiscUtil.copyFast(this._state);
	}

	/* -------------------------------------------- */

	pGetShowModalResults () {
		const {$modalInner, $modalFooter, pGetResolved, doClose} = UiUtil.getShowModal({
			title: "导入设置",
			isUncappedHeight: true,
			hasFooter: true,
		});

		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_isRolls({$modalInner});
		UiUtil.addModalSep($modalInner);
		this._pGetShowModalResults_renderSection_import({$modalInner});

		this._pGetShowModalResults_renderFooter({$modalFooter, doClose});

		return pGetResolved();
	}

	/* -------------------------------------------- */

	_pGetShowModalResults_renderSection_isRolls ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRollInit", text: "掷骰生物先攻"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "isRollHp", text: "掷骰生物生命值"});
	}

	_pGetShowModalResults_renderSection_import ({$modalInner}) {
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "importIsRollGroups", text: "一起为一组生物掷骰"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "importIsAddPlayers", text: "添加玩家"});
		UiUtil.$getAddModalRowCb2({$wrp: $modalInner, comp: this, prop: "importIsAppend", text: "添加到现有追踪器状态"});
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
