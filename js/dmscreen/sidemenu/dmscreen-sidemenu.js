import {RenderableCollectionSaveSlotStatesManager, RenderableCollectionSaveSlotStatesSidebar} from "./dmscreen-sidemenu-saveslots.js";
import {DmScreenSidemenuHistory} from "./dmscreen-sidemenu-history.js";

export class DmScreenSideMenu extends BaseComponent {
	constructor ({board}) {
		super();

		this._state.isLocked = !!board.isLocked;
		this._state.isFullscreen = !!board.isFullscreen;

		this._board = board;

		this._wrpSideMenuControls = null;

		this._compHistory = new DmScreenSidemenuHistory({board});
	}

	/* -------------------------------------------- */

	init () {
		this._wrpSideMenuControls = es(`#dm-screen-sidemenu-controls`);

		this._wrpSideMenuControls.onn("mouseover", () => {
			this._board.setHoveringPanel(null);
			this._board.setVisiblyHoveringPanel(false);
			this._board.resetHoveringButton();
		});

		this._addHookBase("isFullscreen", () => {
			this._wrpSideMenuControls.toggleClass("ve-mt-3p", !this._state.isFullscreen);
			this._wrpSideMenuControls.toggleClass("ve-bt-1p", !this._state.isFullscreen);

			this._compHistory.setIsFullscreen(this._state.isFullscreen);
		})();

		this._addHookBase("saveSlotStates", () => {
			this._board.setSaveSlotInfo({
				idSaveSlotActive: this._state.saveSlotStates
					.filter(saveSlotState => saveSlotState.entity.isActive)
					.map(saveSlotState => saveSlotState.id)[0],

				saveSlotStates: Object.fromEntries(
					this._state.saveSlotStates
						.map(saveSlotState => {
							const out = MiscUtil.copyFast(saveSlotState.entity);
							this._mutCompressSaveSlotStateEntity(out);
							return [saveSlotState.id, out];
						}),
				),
			});
		});

		this._compHistory.init();
	}

	/* -------------------------------------------- */

	_mutExpandSaveSlotStateEntity (obj, {isActive}) {
		obj.isActive = isActive;
		return obj;
	}

	_mutCompressSaveSlotStateEntity (obj) {
		delete obj.isActive;
		return obj;
	}

	/* ----- */

	setSaveSlotInfo ({idSaveSlotActive, saveSlotStates}) {
		this._proxyAssignSimple("state", {
			saveSlotStates: Object.entries(saveSlotStates)
				.map(([id, saveSlotState]) => ({
					id,
					entity: this._mutExpandSaveSlotStateEntity(
						MiscUtil.copyFast(saveSlotState),
						{
							isActive: idSaveSlotActive === id,
						},
					),
				})),
		});
	}

	setIsLocked (isLocked) { this._state.isLocked = !!isLocked; }
	setIsFullscreen (isFullscreen) { this._state.isFullscreen = !!isFullscreen; }

	/* -------------------------------------------- */

	render () {
		this._render_saveSlots();
		this._render_footer();

		this._compHistory.render();
	}

	/* -------------------------------------------- */

	_render_getWrpSaveSlots () {
		const wrp = ee`<div class="ve-flex-col ve-mb-2 ve-min-h-0 ve-overflow-y-auto"></div>`;

		const renderableCollection = new RenderableCollectionSaveSlotStatesSidebar({
			board: this._board,
			comp: this,
			wrpRows: wrp,
		});

		this._addHookBase("saveSlotStates", () => {
			renderableCollection.render();
		})();

		return wrp;
	}

	/* ----- */

	_render_getBtnNewSaveSlot () {
		return ee`<button class="ve-btn ve-btn-default ve-bc-0 ve-bb-0 ve-br-0 ve-bl-0" title="新建存档面板"><span class="glyphicon glyphicon-plus"></span></button>`
			.onn("click", async () => {
				await this._board.pHandleClick_doNewSaveSlot();
			});
	}

	_render_getBtnOpenSaveSlot () {
		let isModalActive = false;

		const selectClickHandler = new RenderableCollectionSelectClickHandler({
			comp: this,
			prop: "saveSlotStates",
			namespace: "manager",
		});

		const menuMass = ContextUtil.getMenu([
			new ContextUtil.Action(
				"删除",
				async () => {
					const saveSlotIdActive = this._state.saveSlotStates
						.filter(rowState => rowState.entity.isActive)[0]?.id;
					if (saveSlotIdActive == null) throw new Error(`No active save slot ID! This is a bug!`);

					const selectedSaveSlotIds = selectClickHandler.getSelectedIds()
						.filter(id => id !== saveSlotIdActive);
					if (!selectedSaveSlotIds.length) return JqueryUtil.doToast({content: `请先选中非激活的存档面板！`, type: "warning"});

					if (!await InputUiUtil.pGetUserBoolean({title: "删除存档面板", htmlDescription: `此操作将删除 ${selectedSaveSlotIds.length} 个存档面板。你确定要这么做吗？`, textYes: "确定", textNo: "取消"})) return;

					const toDelete = new Set(selectedSaveSlotIds);

					this._state.saveSlotStates = this._state.saveSlotStates
						.filter(rowState => !toDelete.has(rowState.id));
				},
			),
		]);

		const wrpRenderableCollection = ee`<div class="ve-flex-col ve-w-100 ve-h-100 ve-min-h-0"></div>`;

		const menuRowOptions = ContextUtil.getMenu([
			new ContextUtil.Action(
				"拷贝",
				async () => {
					await this._board.pHandleClick_doDuplicateSaveSlot(menuRowOptions.userData.entityId);
				},
			),
		]);

		const renderableCollection = new RenderableCollectionSaveSlotStatesManager({
			board: this._board,
			menu: menuRowOptions,
			comp: this,
			selectClickHandler,
			wrpRows: wrpRenderableCollection,
		});

		this._addHookBase("saveSlotStates", () => {
			if (!isModalActive) return;
			renderableCollection.render();
		})();

		return ee`<button class="ve-btn ve-btn-default ve-bc-0 ve-br-0 ve-bl-0 ve-mb-4" title="查看/管理存档面板"><span class="glyphicon glyphicon-folder-open"></span></button>`
			.onn("click", async () => {
				isModalActive = true;
				renderableCollection.render();

				const {eleModalInner, doClose} = UiUtil.getShowModal({
					title: "查看/管理存档面板",
					isHeight100: true,
					isUncappedHeight: true,
					isHeaderBorder: true,
					cbClose: () => {
						wrpRenderableCollection.detach();
						isModalActive = false;
					},
				});

				renderableCollection.setFnCloseModal(doClose);
				eleModalInner.addClass("ve-py-2");

				const btnMass = ee`<button class="ve-btn ve-btn-default ve-btn-xs ve-mr-2">批处理...</button>`
					.onn("click", async evt => {
						await ContextUtil.pOpenMenu(evt, menuMass);
					});

				const cbMulti = ee`<input type="checkbox">`;
				selectClickHandler.bindSelectAllCheckbox(cbMulti);

				ee(eleModalInner)`
					<div class="ve-w-100 ve-flex-col ve-mb-1">
						<div class="ve-flex-v-center">
							${btnMass}
						</div>
					</div>

					<div class="ve-flex-v-center ve-my-1 ve-px-2p ve-btn-group">
						<label class="ve-btn ve-btn-default ve-btn-xs ve-col-0-5 ve-flex-vh-center ve-h-100">
							${cbMulti}
						</label>
						<button class="ve-btn ve-btn-default ve-btn-xs ve-col-1" disabled>&nbsp;</button>
						<button class="ve-btn ve-btn-default ve-btn-xs ve-col-1" title="标识符。展示在侧边栏的缩写。" disabled>标识</button>
						<button class="ve-btn ve-btn-default ve-btn-xs ve-col-7" title="更长的名字，展示在工具栏和列表中。" disabled>名称</button>
						<button class="ve-btn ve-btn-default ve-btn-xs ve-grow" disabled>&nbsp;</button>
					</div>
					
					${wrpRenderableCollection}
				`;
			});
	}

	_render_saveSlots () {
		ee`<div class="ve-flex-col ve-min-h-0">
			${this._render_getWrpSaveSlots()}
			
			${this._render_getBtnNewSaveSlot()}
			${this._render_getBtnOpenSaveSlot()}
		</div>`
			.appendTo(this._wrpSideMenuControls);
	}

	/* -------------------------------------------- */

	_render_getBtnSaveToFile () {
		return ee`<button class="ve-btn ve-btn-primary ve-bc-0 ve-bb-0 ve-br-0 ve-bl-0" title="导出到文件"><span class="glyphicon glyphicon-download"></span></button>`
			.onn("click", () => {
				DataUtil.userDownload(`dm-screen`, this._board.getSaveableState(), {fileType: "dm-screen"});
			});
	}

	_render_getBtnLoadFromFile () {
		return ee`<button class="ve-btn ve-btn-primary ve-bc-0 ve-bb-0 ve-br-0 ve-bl-0" title="从文件导入 (按住SHIFT导入到当前帷幕)"><span class="glyphicon glyphicon-upload"></span></button>`
			.onn("click", async evt => {
				const isCombine = !!evt.shiftKey;

				const {jsons, errors} = await InputUiUtil.pGetUserUploadJson({expectedFileTypes: ["dm-screen"]});

				DataUtil.doHandleFileLoadErrorsGeneric(errors);

				if (!jsons?.length) return;
				await this._board.pDoLoadStateFrom(jsons[0], {isOptionallyPromptCombine: true, isCombine});
			});
	}

	_render_getBtnSaveToUrl () {
		const btnSaveLink = ee`<button class="ve-btn ve-btn-primary ve-bc-0 ve-br-0 ve-bl-0 ve-mb-1" title="导出为URL"><span class="glyphicon glyphicon-magnet"></span></button>`
			.onn("click", async () => {
				const encoded = `${window.location.href.split("#")[0]}#${encodeURIComponent(JSON.stringify(this._board.getSaveableState()))}`;
				await MiscUtil.pCopyTextToClipboard(encoded);
				JqueryUtil.showCopiedEffect(btnSaveLink);
			});
		return btnSaveLink;
	}

	/* ----- */

	_render_getBtnReset () {
		return ee`<button class="ve-btn ve-btn-danger ve-bc-0 ve-br-0 ve-bl-0 ve-mb-4" title="重置存档面板(按住SHIFT重置所有)"><span class="glyphicon glyphicon-refresh"></span></button>`
			.onn("click", async evt => {
				const isAll = !!evt.shiftKey;

				const comp = BaseComponent.fromObject({isRetainWidthHeight: true});
				const cbKeepWidthHeight = ComponentUiUtil.getCbBool(comp, "isRetainWidthHeight");

				const eleDescription = ee`<div class="ve-w-320p">
					<label class="ve-split-v-center ve-mb-2"><span>Keep Current Width/Height</span> ${cbKeepWidthHeight}</label>
					<hr class="ve-hr-1">
					<div>Are you sure?</div>
				</div>`;

				if (!await InputUiUtil.pGetUserBoolean({title: isAll ? "Reset All" : "Reset Save Slot", eleDescription, textYes: "Yes", textNo: "Cancel"})) return;

				if (!isAll) {
					this._board.doReset({isRetainWidthHeight: comp._state.isRetainWidthHeight});
					return;
				}

				await this._board.pDoResetAll({isRetainWidthHeight: comp._state.isRetainWidthHeight});
			});
	}

	/* ----- */

	_render_getBtnToggleLock () {
		const btnLockPanels = ee`<button class="ve-btn ve-btn-default ve-bc-0 ve-bb-0 ve-br-0 ve-bl-0" title="锁定面板"><span class="glyphicon glyphicon-lock"></span></button>`
			.onn("click", () => this._board.doToggleLocked());
		this._addHookBase("isLocked", () => btnLockPanels.toggleClass("ve-active", this._state.isLocked))();

		return btnLockPanels;
	}

	_render_getBtnToggleFullscreen () {
		const btnFullscreen = ee`<button class="ve-btn ve-btn-default ve-bc-0 ve-br-0 ve-bl-0 ve-mb-4" title="切换全屏"><span class="glyphicon glyphicon-fullscreen"></span></button>`
			.onn("click", () => this._board.doToggleFullscreen());
		this._addHookBase("isFullscreen", () => btnFullscreen.toggleClass("ve-active", this._state.isFullscreen))();

		return btnFullscreen;
	}

	/* ----- */

	_render_getBtnSettings () {
		return ee`<button class="ve-btn ve-btn-default ve-bc-0 ve-bb-0 ve-br-0 ve-bl-0" title="设置"><span class="glyphicon glyphicon-cog"></span></button>`
			.onn("click", () => {
				const {eleModalInner, eleModalFooter, doClose} = UiUtil.getShowModal({
					title: "设置",
					isUncappedWidth: true,
					isUncappedHeight: true,
					headerType: 3,
					isHeaderBorder: true,
					overlayColor: "transparent",
					hasFooter: true,
				});
				eleModalInner.addClass("ve-py-2");

				const btnClose = ee`<button class="ve-btn ve-btn-default ve-btn-sm ve-ml-auto">关闭</button>`
					.onn("click", () => doClose());

				ee`<div class="ve-py-1 ve-w-100 ve-flex-v-center">
					${btnClose}
				</div>`
					.appendTo(eleModalFooter);

				const iptWidth = ee`<input class="ve-form-control form-control--minimal ve-input-xs ve-text-center ve-mr-1" type="number" value="${this._board.width}" title="Width">`;
				const iptHeight = ee`<input class="ve-form-control form-control--minimal ve-input-xs ve-text-center ve-mr-1" type="number" value="${this._board.height}" title="Height">`;

				const btnSetDim = ee`<button class="ve-btn ve-btn-default ve-ml-auto ve-btn-xs">设置槽位</div>`
					.onn("click", async () => {
						const w = Number(iptWidth.val());
						const h = Number(iptHeight.val());

						if (w > 10 || h > 10) {
							if (!await InputUiUtil.pGetUserBoolean({title: "Too Many Panels", htmlDescription: "That's a lot of panels. Are you sure?", textYes: "Yes", textNo: "Cancel"})) return;
						}

						this._board.setDimensions(w, h);
					});

				ee`<div class="ve-py-1 ve-w-100 ve-split-v-center">
					<div class="ve-w-66 ve-no-shrink ve-flex-v-center">槽位</div>
					<div class="ve-flex-v-center">
						${iptWidth}
						<div title="Width">宽</div>
						<div class="ve-mx-1 ve-muted">×</div>
						${iptHeight}
						<div title="Height">高</div>
					</div>
				</div>`
					.appendTo(eleModalInner);

				ee`<div class="ve-py-1 ve-w-100 ve-split-v-center">
					<div class="ve-w-66 ve-no-shrink"></div>
					${btnSetDim}
				</div>`
					.appendTo(eleModalInner);

				ee`<hr class="ve-hr-3">`.appendTo(eleModalInner);

				this._board.cbConfirmTabClose = ee`<input type="checkbox">`;
				ee`<label class="ve-py-1 ve-w-100 ve-split-v-center">
					<span class="ve-w-66 ve-no-shrink ve-flex-v-center">关闭帷幕时是否需要确认</span>
					${this._board.cbConfirmTabClose}
				</label>`
					.appendTo(eleModalInner);
			});
	}

	/* ----- */

	_render_footer () {
		ee`<div class="ve-flex-col ve-mt-auto">
			${this._compHistory.getBtnToggle()}

			${this._render_getBtnSaveToFile()}
			${this._render_getBtnLoadFromFile()}
			${this._render_getBtnSaveToUrl()}
			${this._render_getBtnReset()}

			${this._render_getBtnToggleLock()}
			${this._render_getBtnToggleFullscreen()}
	
			${this._render_getBtnSettings()}
		</div>`
			.appendTo(this._wrpSideMenuControls);
	}

	doUpdateHistory () {
		this._compHistory.doUpdateRender();
	}

	/* -------------------------------------------- */

	_getDefaultState () {
		return {
			saveSlotStates: [],

			isLocked: false,
			isFullscreen: false,
		};
	}
}
