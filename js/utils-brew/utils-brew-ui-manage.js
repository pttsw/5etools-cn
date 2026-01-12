import {SOURCE_UNKNOWN_ABBREVIATION, SOURCE_UNKNOWN_FULL} from "./utils-brew-constants.js";
import {BrewDoc} from "./utils-brew-models.js";
import {GetBrewUi} from "./utils-brew-ui-get.js";
import {ManageEditableBrewContentsUi} from "./utils-brew-ui-manage-editable-contents.js";
import {ManageExternalUtils} from "../manageexternal/manageexternal-utils.js";

export class ManageBrewUi {
	static _RenderState = class {
		constructor () {
			this.stgBrewList = null;
			this.list = null;
			this.listSelectClickHandler = null;
			this.brews = [];
			this.menuListMass = null;
			this.rowMetas = [];
		}
	};

	constructor ({brewUtil, isModal = false} = {}) {
		this._brewUtil = brewUtil;
		this._isModal = isModal;
	}

	/* -------------------------------------------- */

	static _CONTEXT_MENU_BTNGROUP_MANAGER = null;

	static bindBtngroupManager (btngroup) {
		btngroup
			.first(`[name="manage-content"]`)
			.onn("click", evt => this._pOnClickBtnManageContent({evt}));

		btngroup
			.first(`[name="manage-prerelease"]`)
			.onn("click", evt => this._onClickBtnManagePrereleaseBrew({brewUtil: PrereleaseUtil, isGoToPage: evt.shiftKey}));

		btngroup
			.first(`[name="manage-brew"]`)
			.onn("click", evt => this._onClickBtnManagePrereleaseBrew({brewUtil: BrewUtil2, isGoToPage: evt.shiftKey}));
	}

	static bindBtnOpen (btn, {brewUtil = null} = {}) {
		brewUtil = brewUtil || BrewUtil2;

		btn.onn("click", evt => this._onClickBtnManagePrereleaseBrew({brewUtil, isGoToPage: evt.shiftKey}));
	}

	static _pOnClickBtnManageContent ({evt}) {
		this._CONTEXT_MENU_BTNGROUP_MANAGER ||= ContextUtil.getMenu([
			new ContextUtil.Action(
				I18nUtil.get("page.manageprelease.manage_prerelease_content"),
				async evt => {
					this._onClickBtnManagePrereleaseBrew({brewUtil: PrereleaseUtil, isGoToPage: evt.shiftKey});
				},
			),
			new ContextUtil.Action(
				"管理自制内容",
				async evt => {
					this._onClickBtnManagePrereleaseBrew({brewUtil: BrewUtil2, isGoToPage: evt.shiftKey});
				},
			),
			null,
			new ContextUtil.Action(
				"加载所有第三方合作内容",
				async evt => {
					await this.pOnClickBtnLoadAllPartnered();
				},
			),
			null,
			new ContextUtil.Action(
				"删除所有已加载内容",
				async evt => {
					await this._pOnClickBtnDeleteAllLoadedContent();
				},
			),
		]);

		return ContextUtil.pOpenMenu(evt, this._CONTEXT_MENU_BTNGROUP_MANAGER);
	}

	static _onClickBtnManagePrereleaseBrew ({brewUtil, isGoToPage}) {
		if (isGoToPage) return window.location = brewUtil.PAGE_MANAGE;
		return this.pDoManageBrew({brewUtil});
	}

	static async pOnClickBtnLoadAllPartnered () {
		const cntAvailable = (await Promise.all([
			PrereleaseUtil.pGetCntBrewsPartnered({isSilent: true}),
			BrewUtil2.pGetCntBrewsPartnered({isSilent: true}),
		])).sum();
		if (!cntAvailable) {
			JqueryUtil.doToast({type: "warning", content: `没有可用的第三方合作内容！`});
			return;
		}

		if (
			!await InputUiUtil.pGetUserBoolean({
				title: I18nUtil.get("page.manageprelease.load_partnered_content"),
				htmlDescription: `<p>${I18nUtil.get("page.manageprelease.are_you_sure_you_want_to_load_all_partnered_content")}<br>${cntAvailable} partnered content source${cntAvailable === 1 ? "" : "s"} will be loaded.</p>`,
				textYes: I18nUtil.get("common.button.yes"),
				textNo: I18nUtil.get("common.button.cancel"),
			})
		) return;

		const brewDocs = [];
		try {
			const [brewDocsPrerelease, brewDocsHomebrew] = await Promise.all([
				PrereleaseUtil.pAddBrewsPartnered({isSilent: true}),
				BrewUtil2.pAddBrewsPartnered({isSilent: true}),
			]);
			brewDocs.push(
				...brewDocsPrerelease,
				...brewDocsHomebrew,
			);
		} catch (e) {
			JqueryUtil.doToast({type: "danger", content: `Failed to load partnered content! ${VeCt.STR_SEE_CONSOLE}`});
			throw e;
		}

		if (brewDocs.length) JqueryUtil.doToast(`已加载第三方合作内容！`);

		if (PrereleaseUtil.isReloadRequired()) PrereleaseUtil.doLocationReload();
		if (BrewUtil2.isReloadRequired()) BrewUtil2.doLocationReload();
	}

	static async _pOnClickBtnDeleteAllLoadedContent () {
		if (
			!await InputUiUtil.pGetUserBoolean({
				title: `删除所以已加载的${PrereleaseUtil.DISPLAY_NAME.toTitleCase()}和${BrewUtil2.DISPLAY_NAME.toTitleCase()}`,
				htmlDescription: `<div>
					<div>你确定吗？</div>
					<div class="ve-muted"><i>注意：这将<b>不会</b>删除您的可编辑${PrereleaseUtil.DISPLAY_NAME.toTitleCase()}和可编辑${BrewUtil2.DISPLAY_NAME.toTitleCase()}。</i></div>
				</div>`,
				textYes: "是",
				textNo: "取消",
			})
		) return;

		try {
			await Promise.all([
				PrereleaseUtil.pDeleteUneditableBrews(),
				BrewUtil2.pDeleteUneditableBrews(),
			]);
		} catch (e) {
			JqueryUtil.doToast({type: "danger", content: `删除所有已加载内容失败！ ${VeCt.STR_SEE_CONSOLE}`});
			throw e;
		}

		if (PrereleaseUtil.isReloadRequired()) PrereleaseUtil.doLocationReload();
		if (BrewUtil2.isReloadRequired()) BrewUtil2.doLocationReload();
	}

	/* -------------------------------------------- */

	static async pOnClickBtnExportListAsUrl ({ele}) {
		const url = await ManageExternalUtils.pGetUrl();
		await MiscUtil.pCopyTextToClipboard(url);
		JqueryUtil.showCopiedEffect(ele);

		if (
			!await PrereleaseUtil.pHasEditableSourceJson()
			&& !await BrewUtil2.pHasEditableSourceJson()
		) return;

		JqueryUtil.doToast({type: "warning", content: `警告：您有可编辑的${PrereleaseUtil.DISPLAY_NAME}或${BrewUtil2.DISPLAY_NAME}。这不能作为URL的一部分导出，因此未包含在内。`});
	}

	/* -------------------------------------------- */

	static async pDoManageBrew ({brewUtil = null} = {}) {
		brewUtil = brewUtil || BrewUtil2;

		const ui = new this({isModal: true, brewUtil});
		const rdState = new this._RenderState();
		const {eleModalInner} = UiUtil.getShowModal({
			isHeight100: true,
			isWidth100: true,
			title: `管理${brewUtil.DISPLAY_NAME.toTitleCase()}`,
			isUncappedHeight: true,
			eleTitleSplit: ee`<div class="ve-flex-v-center ve-btn-group">
				${ui._getBtnPullAll(rdState)}
				${ui._getBtnDeleteAll(rdState)}
			</div>`,
			isHeaderBorder: true,
			cbClose: () => {
				if (!brewUtil.isReloadRequired()) return;
				brewUtil.doLocationReload();
			},
		});
		await ui.pRender(eleModalInner, {rdState});
	}

	_getBtnDeleteAll (rdState) {
		const brewUtilOther = this._brewUtil === PrereleaseUtil ? BrewUtil2 : PrereleaseUtil;

		return ee`<button class="ve-btn ve-btn-danger" title="SHIFT to also delete all ${brewUtilOther.DISPLAY_NAME.toTitleCase()}">${I18nUtil.get("common.button.delete_all")}</button>`
			.addClass(this._isModal ? "ve-btn-xs" : "ve-btn-sm")
			.onn("click", async evt => {
				if (!evt.shiftKey) {
					if (!await InputUiUtil.pGetUserBoolean({title: `删除所有${this._brewUtil.DISPLAY_NAME.toTitleCase()}`, htmlDescription: "你确定吗？", textYes: "是", textNo: "取消"})) return;

					await this._pDoDeleteAll(rdState);

					return;
				}

				if (
					!await InputUiUtil.pGetUserBoolean({
						title: `删除所有${this._brewUtil.DISPLAY_NAME.toTitleCase()}和${brewUtilOther.DISPLAY_NAME.toTitleCase()}`,
						htmlDescription: "你确定吗？",
						textYes: "是",
						textNo: "取消",
					})
				) return;

				await brewUtilOther.pSetBrew([]);
				await this._pDoDeleteAll(rdState);
			});
	}

	_getBtnPullAll (rdState) {
		const btn = ee`<button class="ve-btn ve-btn-default w-80p">${I18nUtil.get("common.button.update_all")}</button>`
			.addClass(this._isModal ? "ve-btn-xs" : "ve-btn-sm")
			.onn("click", async () => {
				const cachedHtml = btn.html();

				try {
					btn.txt(`Updating...`).prop("disabled", true);
					await this._pDoPullAll({rdState, isReload: true});
				} catch (e) {
					btn.txt(`Failed!`);
					setTimeout(() => btn.html(cachedHtml).prop("disabled", false), VeCt.DUR_INLINE_NOTIFY);
					throw e;
				}

				btn.txt(`Done!`);
				setTimeout(() => btn.html(cachedHtml).prop("disabled", false), VeCt.DUR_INLINE_NOTIFY);
			});
		return btn;
	}

	async _pDoDeleteAll (rdState) {
		await this._brewUtil.pSetBrew([]);

		rdState.list.removeAllItems();
		rdState.list.update();

		if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
	}

	async _pDoPullAll ({rdState, brews = null, isReload = false}) {
		if (brews && !brews.length) return;

		let brewDocsUpdated;
		try {
			brewDocsUpdated = await this._brewUtil.pPullAllBrews({brews});
		} catch (e) {
			JqueryUtil.doToast({content: `Update failed! ${VeCt.STR_SEE_CONSOLE}`, type: "danger"});
			throw e;
		}
		if (!brewDocsUpdated?.length) return JqueryUtil.doToast(`更新完成！没有${this._brewUtil.DISPLAY_NAME}被更新。`);

		await this._pRender_pBrewList(rdState);

		const brewDocsUpdatedMetas = brewDocsUpdated
			.map(brewDoc => {
				return {
					brewName: this.constructor._getBrewName(brewDoc),
					sources: MiscUtil.copyFast(brewDoc.body._meta?.sources || []),
				};
			});

		const htmlListRows = brewDocsUpdatedMetas
			.sort((a, b) => SortUtil.ascSortLower(a.brewName, b.brewName))
			.map(({sources}) => {
				if (!sources.length) return "";

				const htmlListItems = sources
					.sort((a, b) => SortUtil.ascSortLower(a.full || SOURCE_UNKNOWN_FULL, b.full || SOURCE_UNKNOWN_FULL))
					.map(brewSource => `<li>${brewSource.full || SOURCE_UNKNOWN_FULL}</li>`);

				if (htmlListItems.length === 1) return htmlListItems[0];

				return `<ul>${htmlListItems.join("")}</ul>`;
			})
			.filter(Boolean)
			.join("");

		const messageInfo = {
			isAutoHide: false,
			contentHtml: `<div>
				<div>更新完成！${brewDocsUpdated.length} ${brewDocsUpdated.length === 1 ? `${this._brewUtil.DISPLAY_NAME}被` : `${this._brewUtil.DISPLAY_NAME_PLURAL}被`}更新。</div>
				${htmlListRows ? `<ul class="mt-2 mb-0">${htmlListRows}</ul>` : ""}
			</div>`,
		};

		if (isReload) {
			await this._brewUtil.pSetReloadMessage(messageInfo);
			if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
			return;
		}

		JqueryUtil.doToast({
			...messageInfo,
			content: e_({outer: messageInfo.contentHtml}),
		});
	}

	async pRender (wrp, {rdState = null} = {}) {
		rdState = rdState || new this.constructor._RenderState();

		rdState.stgBrewList = ee`<div class="manbrew__current_brew ve-flex-col h-100 mt-1 min-h-0"></div>`;

		await this._pRender_pBrewList(rdState);

		const btnGet = ee`<button class="ve-btn ${this._brewUtil.STYLE_BTN} ve-btn-sm">${I18nUtil.get("common.button.get")} ${this._brewUtil.DISPLAY_NAME.toTitleCase()}</button>`
			.onn("click", () => this._pHandleClick_btnGetBrew(rdState));

		const btnCustomUrl = ee`<button class="ve-btn ${this._brewUtil.STYLE_BTN} ve-btn-sm px-2" title="设置自定义仓库URL"><span class="glyphicon glyphicon-cog"></span></button>`
			.onn("click", () => this._pHandleClick_btnSetCustomRepo());

		const btnLoadPartnered = ee`<button class="ve-btn ve-btn-default ve-btn-sm">加载所有合作内容</button>`
			.onn("click", () => this._pHandleClick_btnLoadPartnered(rdState));

		const btnLoadFromFile = ee`<button class="ve-btn ve-btn-default ve-btn-sm">${I18nUtil.get("common.button.load_from_file")}</button>`
			.onn("click", () => this._pHandleClick_btnLoadFromFile(rdState));

		const btnLoadFromUrl = ee`<button class="ve-btn ve-btn-default ve-btn-sm">${I18nUtil.get("common.button.load_from_url")}</button>`
			.onn("click", () => this._pHandleClick_btnLoadFromUrl(rdState));

		const btnPullAll = this._isModal ? null : this._getBtnPullAll(rdState);
		const btnDeleteAll = this._isModal ? null : this._getBtnDeleteAll(rdState);

		const btnSaveToUrl = ee`<button class="ve-btn ve-btn-default ve-btn-sm" title="Note that this does not include &quot;Editable&quot; or &quot;Local&quot; content.">${I18nUtil.get("common.button.export_list_as_url")}</button>`
			.onn("click", async evt => {
				await this.constructor.pOnClickBtnExportListAsUrl({ele: evt.currentTarget});
			});

		const wrpBtnLoadAll = this._brewUtil.IS_ADD_BTN_ALL_PARTNERED
			? ee`<div class="ve-flex-v-center ve-btn-group mr-2">
				${btnLoadPartnered}
			</div>`
			: null;

		const wrpBtns = ee`<div class="ve-flex-v-center no-shrink mobile-sm__ve-flex-col">
			<div class="ve-flex-v-center mobile-sm__mb-2">
				<div class="ve-flex-v-center ve-btn-group mr-2">
					${btnGet}
					${btnCustomUrl}
				</div>
				${wrpBtnLoadAll}
				<div class="ve-flex-v-center ve-btn-group mr-2">
					${btnLoadFromFile}
					${btnLoadFromUrl}
				</div>
			</div>
			<div class="ve-flex-v-center">
				<a href="${this._brewUtil.URL_REPO_DEFAULT}" class="ve-flex-v-center" target="_blank" rel="noopener noreferrer"><button class="ve-btn ve-btn-default ve-btn-sm mr-2">${I18nUtil.get("common.button.browse_source_repository")}</button></a>

				<div class="ve-flex-v-center ve-btn-group mr-2">
					${btnSaveToUrl}
				</div>

				<div class="ve-flex-v-center ve-btn-group">
					${btnPullAll}
					${btnDeleteAll}
				</div>
			</div>
		</div>`;

		if (this._isModal) {
			ee(wrp)`
			${rdState.stgBrewList}
			${wrpBtns.addClass("mb-2")}`;
		} else {
			ee(wrp)`
			${wrpBtns.addClass("mb-3")}
			${rdState.stgBrewList}`;
		}
	}

	async _pHandleClick_btnLoadPartnered (rdState) {
		await this._brewUtil.pAddBrewsPartnered();
		if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
		await this._pRender_pBrewList(rdState);
	}

	async _pHandleClick_btnLoadFromFile (rdState) {
		const {files, errors} = await InputUiUtil.pGetUserUploadJson({isMultiple: true, expectedFileTypes: []});

		DataUtil.doHandleFileLoadErrorsGeneric(errors);

		await this._brewUtil.pAddBrewsFromFiles(files);
		if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
		await this._pRender_pBrewList(rdState);
	}

	async _pHandleClick_btnLoadFromUrl (rdState) {
		const enteredUrl = await InputUiUtil.pGetUserString({
			title: `${this._brewUtil.DISPLAY_NAME.toTitleCase()} URL`,
			htmlDescription: `<p>
				提供${this._brewUtil.DISPLAY_NAME} 的JSON链接。
				<br><span class="ve-muted">注意：对于GitHub链接，这应该是仓库根路径链接。</span>
			</p>`,
		});
		if (!enteredUrl || !enteredUrl.trim()) return;

		const parsedUrl = this.constructor._getParsedCustomUrl(enteredUrl);
		if (!parsedUrl) {
			return JqueryUtil.doToast({
				content: `The URL was not valid!`,
				type: "danger",
			});
		}

		// If mistakenly passed an "export as URL" link, navigate
		if (ManageExternalUtils.isLoadExternalUrl(parsedUrl.href)) {
			parsedUrl.hostname = window.location.hostname;
			parsedUrl.protocol = window.location.protocol;
			parsedUrl.port = window.location.port;
			window.location = parsedUrl;
		}

		await this._brewUtil.pAddBrewFromUrl(parsedUrl.href);
		if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
		await this._pRender_pBrewList(rdState);
	}

	static _getParsedCustomUrl (enteredUrl) {
		try {
			return new URL(enteredUrl);
		} catch (e) {
			return null;
		}
	}

	async _pHandleClick_btnGetBrew (rdState) {
		await GetBrewUi.pDoGetBrew({brewUtil: this._brewUtil, isModal: this._isModal});
		if (this._brewUtil.isReloadRequired()) this._brewUtil.doLocationReload();
		await this._pRender_pBrewList(rdState);
	}

	async _pHandleClick_btnSetCustomRepo () {
		const customBrewUtl = await this._brewUtil.pGetCustomUrl();

		const nxtUrl = await InputUiUtil.pGetUserString({
			title: `${this._brewUtil.DISPLAY_NAME.toTitleCase()} 自定义仓库URL`,
			elePre: ee`<div>
				<p>请输入自定义${this._brewUtil.DISPLAY_NAME} 仓库URL。留空则使用默认${this._brewUtil.DISPLAY_NAME} 仓库。</p>
				<div>注意：对于GitHub链接，这应该是仓库根路径链接。例如，<code>${this._brewUtil.URL_REPO_ROOT_DEFAULT.replace(/TheGiddyLimit/g, "YourUsernameHere")}</code></div>
				<hr class="hr-3">
			</div>`,
			default: customBrewUtl,
		});
		if (nxtUrl == null) return;

		await this._brewUtil.pSetCustomUrl(nxtUrl);
	}

	async _pRender_pBrewList (rdState) {
		rdState.stgBrewList.empty();
		rdState.rowMetas.splice(0, rdState.rowMetas.length)
			.forEach(({menu}) => ContextUtil.deleteMenu(menu));

		const btnMass = ee`<button class="ve-btn ve-btn-default bbl-0 ve-self-flex-stretch">${I18nUtil.get("common.button.mass")}...</button>`
			.onn("click", evt => this._pHandleClick_btnListMass({evt, rdState}));
		const iptSearch = ee`<input type="search" class="search manbrew__search form-control bbr-0" placeholder="${I18nUtil.get("common.button.search")} ${this._brewUtil.DISPLAY_NAME}...">`;
		const cbAll = ee`<input type="checkbox">`;
		const wrpList = ee`<div class="list-display-only max-h-unset smooth-scroll ve-overflow-y-auto h-100 min-h-0 brew-list brew-list--target manbrew__list relative ve-flex-col w-100 mb-3"></div>`;

		rdState.list = new List({
			iptSearch,
			wrpList,
			isFuzzy: true,
			sortByInitial: rdState.list ? rdState.list.sortBy : undefined,
			sortDirInitial: rdState.list ? rdState.list.sortDir : undefined,
		});

		const wrpBtnsSort = ee`<div class="filtertools manbrew__filtertools ve-btn-group input-group input-group--bottom ve-flex no-shrink">
			<label class="ve-col-0-5 pr-0 ve-btn ve-btn-default ve-btn-xs ve-flex-vh-center">${cbAll}</label>
			<button class="ve-col-1 ve-btn ve-btn-default ve-btn-xs" disabled>${I18nUtil.get("common.type")}</button>
			<button class="ve-col-3 ve-btn ve-btn-default ve-btn-xs" data-sort="source">${I18nUtil.get("common.source")}</button>
			<button class="ve-col-3 ve-btn ve-btn-default ve-btn-xs" data-sort="authors">${I18nUtil.get("common.authors")}</button>
			<button class="ve-col-3 ve-btn ve-btn-default ve-btn-xs" data-sort="translator">翻译</button>
			<button class="ve-col-3 ve-btn ve-btn-default ve-btn-xs" disabled>${I18nUtil.get("common.origin")}</button>
			<button class="ve-col-1-5 ve-btn ve-btn-default ve-btn-xs ve-grow" disabled>&nbsp;</button>
		</div>`;

		ee(rdState.stgBrewList)`
		<div class="ve-flex-col h-100">
			<div class="input-group ve-flex-vh-center">
				${btnMass}
				${iptSearch}
			</div>
			${wrpBtnsSort}
			<div class="ve-flex w-100 h-100 min-h-0 relative">${wrpList}</div>
		</div>`;

		rdState.listSelectClickHandler = new ListSelectClickHandler({list: rdState.list});
		rdState.listSelectClickHandler.bindSelectAllCheckbox(cbAll);
		SortUtil.initBtnSortHandlers(wrpBtnsSort, rdState.list);

		rdState.brews = (await this._brewUtil.pGetBrew()).map(brew => this._pRender_getProcBrew(brew));

		rdState.brews.forEach((brew, ix) => {
			const meta = this._pRender_getLoadedRowMeta(rdState, brew, ix);
			rdState.rowMetas.push(meta);
			rdState.list.addItem(meta.listItem);
		});

		rdState.list.init();
		iptSearch.focuse();
	}

	get _LBL_LIST_UPDATE () { return I18nUtil.get("common.button.update"); }
	get _LBL_LIST_MANAGE_CONTENTS () { return I18nUtil.get("common.button.manage_contents"); }
	get _LBL_LIST_EXPORT () { return I18nUtil.get("common.button.export"); }
	get _LBL_LIST_VIEW_CONTENTS () { return I18nUtil.get("common.button.view_contents"); }
	get _LBL_LIST_VIEW_JSON () { return I18nUtil.get("common.button.view_json"); }
	get _LBL_LIST_DELETE () { return I18nUtil.get("common.button.delete"); }
	get _LBL_LIST_MOVE_TO_EDITABLE () { return `Move to Editable ${this._brewUtil.DISPLAY_NAME.toTitleCase()} Document`; }

	_initListMassMenu ({rdState}) {
		if (rdState.menuListMass) return;

		const getSelBrews = ({fnFilter = null} = {}) => {
			const brews = rdState.list.items
				.filter(li => li.data.cbSel.checked)
				.map(li => rdState.brews[li.ix])
				.filter(brew => fnFilter ? fnFilter(brew) : true);

			if (!brews.length) JqueryUtil.doToast({content: `Please select some suitable ${this._brewUtil.DISPLAY_NAME_PLURAL} first!`, type: "warning"});

			return brews;
		};

		rdState.menuListMass = ContextUtil.getMenu([
			new ContextUtil.Action(
				this._LBL_LIST_UPDATE,
				async () => this._pDoPullAll({
					rdState,
					brews: getSelBrews(),
					isReload: true,
				}),
			),
			new ContextUtil.Action(
				this._LBL_LIST_EXPORT,
				async () => {
					for (const brew of getSelBrews()) await this._pRender_pDoDownloadBrew({brew});
				},
			),
			this._brewUtil.IS_EDITABLE
				? new ContextUtil.Action(
					this._LBL_LIST_MOVE_TO_EDITABLE,
					async () => this._pRender_pDoMoveToEditable({
						rdState,
						brews: getSelBrews({
							fnFilter: brew => this._isBrewOperationPermitted_moveToEditable(brew),
						}),
					}),
				)
				: null,
			new ContextUtil.Action(
				this._LBL_LIST_DELETE,
				async () => this._pRender_pDoDelete({
					rdState,
					brews: getSelBrews({
						fnFilter: brew => this._isBrewOperationPermitted_delete(brew),
					}),
				}),
			),
		].filter(Boolean));
	}

	_isBrewOperationPermitted_update (brew) { return this._brewUtil.isPullable(brew); }
	_isBrewOperationPermitted_moveToEditable (brew) { return BrewDoc.isOperationPermitted_moveToEditable({brew}); }
	_isBrewOperationPermitted_delete (brew) { return !brew.head.isLocal; }

	async _pHandleClick_btnListMass ({evt, rdState}) {
		this._initListMassMenu({rdState});
		await ContextUtil.pOpenMenu(evt, rdState.menuListMass);
	}

	static _getBrewName (brew) {
		const sources = brew.body._meta?.sources || [];

		return sources
			.map(brewSource => brewSource.full || SOURCE_UNKNOWN_FULL)
			.sort(SortUtil.ascSortLower)
			.join(", ");
	}

	_pRender_getLoadedRowMeta (rdState, brew, ix) {
		const sources = brew.body._meta?.sources || [];

		const rowsSubMetas = sources
			.map(brewSource => {
				const hasConverters = !!brewSource.convertedBy?.length;
				const btnConvertedBy = e_({
					tag: "button",
					clazz: `ve-btn ve-btn-xxs ve-btn-default ${!hasConverters ? "disabled" : ""}`,
					title: hasConverters ? `Converted by: ${brewSource.convertedBy.join(", ").qq()}` : "(No conversion credit given)",
					children: [
						e_({tag: "span", clazz: "mobile-sm__hidden", text: "查看编辑"}),
						e_({tag: "span", clazz: "mobile-sm__visible", text: "编辑", title: "查看编辑"}),
					],
					click: () => {
						if (!hasConverters) return;
						const {eleModalInner} = UiUtil.getShowModal({
							title: `编辑者:${brewSource.convertedBy.length === 1 ? ` ${brewSource.convertedBy.join("")}` : ""}`,
							isMinHeight0: true,
						});

						if (brewSource.convertedBy.length === 1) return;
						eleModalInner.appends(`<ul>${brewSource.convertedBy.map(it => `<li>${it.qq()}</li>`).join("")}</ul>`);
					},
				});

				const authorsFull = [(brewSource.authors || [])].flat(2).join(", ");
				const translatorsFull = [(brewSource.translators || [])].flat(2).join(", ");

				const lnkUrl = brewSource.url
					? e_({
						tag: "a",
						clazz: "ve-col-2 ve-text-center",
						href: brewSource.url,
						attrs: {
							target: "_blank",
							rel: "noopener noreferrer",
						},
						text: I18nUtil.get("page.manageprelease.view_source"),
					})
					: e_({
						tag: "span",
						clazz: "ve-col-2 ve-text-center",
					});

				const eleRow = e_({
					tag: "div",
					clazz: `w-100 ve-flex-v-center`,
					children: [
						e_({
							tag: "span",
							clazz: `ve-col-4 manbrew__source px-1`,
							text: brewSource.full,
						}),
						e_({
							tag: "span",
							clazz: `ve-col-4 px-1`,
							text: authorsFull,
						}),
						e_({
							tag: "span",
							clazz: `ve-col-4 px-1`,
							text: translatorsFull,
						}),
						lnkUrl,
						e_({
							tag: "div",
							clazz: `ve-flex-vh-center ve-grow`,
							children: [
								btnConvertedBy,
							],
						}),
					],
				});

				return {
					eleRow,
					authorsFull,
					translatorsFull,
					name: brewSource.full || SOURCE_UNKNOWN_FULL,
					abbreviation: brewSource.abbreviation || SOURCE_UNKNOWN_ABBREVIATION,
				};
			})
			.sort((a, b) => SortUtil.ascSortLower(a.name, b.name));

		const brewName = this.constructor._getBrewName(brew);

		// region These are mutually exclusive
		const btnPull = this._pRender_getBtnPull({rdState, brew});
		const btnEdit = this._pRender_getBtnEdit({rdState, brew, brewName});
		const btnPullEditPlaceholder = (btnPull || btnEdit) ? null : this.constructor._pRender_getBtnPlaceholder();
		// endregion

		const btnViewContents = e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-lg__hidden w-24p`,
			title: `${this._LBL_LIST_VIEW_CONTENTS}: ${this.constructor._getBrewJsonTitle({brew, brewName})}`,
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-list-alt manbrew-row__icn-btn",
				}),
			],
			click: evt => this._pRender_pDoViewBrewContents({evt, brew}),
		});

		const btnDownload = e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-sm__hidden w-24p`,
			title: this._LBL_LIST_EXPORT,
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-download manbrew-row__icn-btn",
				}),
			],
			click: () => this._pRender_pDoDownloadBrew({brew, brewName}),
		});

		const btnViewJson = e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-lg__hidden w-24p`,
			title: `${this._LBL_LIST_VIEW_JSON}: ${this.constructor._getBrewJsonTitle({brew, brewName})}`,
			children: [
				e_({
					tag: "span",
					clazz: "ve-bolder code relative manbrew-row__icn-btn--text",
					text: "{}",
				}),
			],
			click: evt => this._pRender_doViewBrew({evt, brew, brewName}),
		});

		const btnOpenMenu = e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs w-24p`,
			title: "Menu",
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-option-vertical manbrew-row__icn-btn",
				}),
			],
			click: evt => this._pRender_pDoOpenBrewMenu({evt, rdState, brew, brewName, rowMeta}),
		});

		const btnDelete = this._isBrewOperationPermitted_delete(brew) ? e_({
			tag: "button",
			clazz: `ve-btn ve-btn-danger ve-btn-xs mobile-sm__hidden w-24p`,
			title: this._LBL_LIST_DELETE,
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-trash manbrew-row__icn-btn",
				}),
			],
			click: () => this._pRender_pDoDelete({rdState, brews: [brew]}),
		}) : this.constructor._pRender_getBtnPlaceholder();

		// Weave in HRs
		const elesSub = rowsSubMetas.map(it => it.eleRow);
		for (let i = rowsSubMetas.length - 1; i > 0; --i) elesSub.splice(i, 0, e_({tag: "hr", clazz: `hr-1 hr--dotted`}));

		const cbSel = e_({
			tag: "input",
			clazz: "no-events",
			type: "checkbox",
		});

		const ptCategory = brew.head.isLocal
			? {short: `Local`, title: `Local Document`}
			: brew.head.isEditable
				? {short: `Editable`, title: `Editable Document`}
				: {short: `Standard`, title: `Standard Document`};

		const eleLi = e_({
			tag: "div",
			clazz: `manbrew__row ve-flex-v-center lst__row lst__row-border lst__row-inner no-shrink py-1 no-select`,
			children: [
				e_({
					tag: "label",
					clazz: `ve-col-0-5 ve-flex-vh-center ve-self-flex-stretch`,
					children: [cbSel],
				}),
				e_({
					tag: "div",
					clazz: `ve-col-1 ve-text-center italic mobile-sm__text-clip-ellipsis`,
					title: ptCategory.title,
					text: ptCategory.short,
				}),
				e_({
					tag: "div",
					clazz: `ve-col-9 ve-flex-col`,
					children: elesSub,
				}),
				e_({
					tag: "div",
					clazz: `ve-col-1-5 ve-btn-group ve-flex-vh-center`,
					children: [
						btnPull,
						btnEdit,
						btnPullEditPlaceholder,
						btnDownload,
						brew.head.isEditable ? btnViewJson : btnViewContents,
						btnOpenMenu,
						btnDelete,
					]
						.filter(Boolean),
				}),
			],
		});

		const listItem = new ListItem(
			ix,
			eleLi,
			brewName,
			{
				authors: rowsSubMetas.map(it => it.authorsFull).join(", "),
				translators: rowsSubMetas.map(it => it.translatorsFull).join(", "),
				abbreviation: rowsSubMetas.map(it => it.abbreviation).join(", "),
				ENG_name: rowsSubMetas.ENG_name || rowsSubMetas.name,
				ENG_hash: UrlUtil.autoEncodeEngHash(rowsSubMetas),
			},
			{
				cbSel,
			},
		);

		eleLi.addEventListener("click", evt => rdState.listSelectClickHandler.handleSelectClick(listItem, evt, {isPassThroughEvents: true}));

		const rowMeta = {
			listItem,
			menu: null,
		};
		return rowMeta;
	}

	static _pRender_getBtnPlaceholder () {
		return e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-sm__hidden w-24p`,
			html: "&nbsp;",
		})
			.attr("disabled", true);
	}

	_pRender_getBtnPull ({rdState, brew}) {
		if (!this._isBrewOperationPermitted_update(brew)) return null;

		const btnPull = e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-sm__hidden w-24p`,
			title: this._LBL_LIST_UPDATE,
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-refresh manbrew-row__icn-btn",
				}),
			],
			click: () => this._pRender_pDoPullBrew({rdState, brew}),
		});
		if (!this._brewUtil.isPullable(brew)) btnPull.attr("disabled", true).attr("title", `(Update disabled\u2014no URL available)`);
		return btnPull;
	}

	_pRender_getBtnEdit ({rdState, brew, brewName}) {
		if (!brew.head.isEditable) return null;

		return e_({
			tag: "button",
			clazz: `ve-btn ve-btn-default ve-btn-xs mobile-sm__hidden w-24p`,
			title: `${this._LBL_LIST_MANAGE_CONTENTS}: ${this.constructor._getBrewJsonTitle({brew, brewName})}`,
			children: [
				e_({
					tag: "span",
					clazz: "glyphicon glyphicon-pencil manbrew-row__icn-btn",
				}),
			],
			click: () => this._pRender_pDoEditBrew({rdState, brew}),
		});
	}

	async _pRender_pDoPullBrew ({rdState, brew}) {
		const isPull = await this._brewUtil.pPullBrew(brew);

		JqueryUtil.doToast(
			isPull
				? `${this._brewUtil.DISPLAY_NAME.uppercaseFirst()} updated!`
				: `${this._brewUtil.DISPLAY_NAME.uppercaseFirst()} is already up-to-date.`,
		);

		if (!isPull) return;

		await this._pRender_pBrewList(rdState);
	}

	async _pRender_pDoEditBrew ({rdState, brew}) {
		const {isDirty, brew: nxtBrew} = await ManageEditableBrewContentsUi.pDoOpen({brewUtil: this._brewUtil, brew, isModal: this._isModal});
		if (!isDirty) return;

		await this._brewUtil.pUpdateBrew(nxtBrew);
		await this._pRender_pBrewList(rdState);
	}

	async _pRender_pDoDownloadBrew ({brew, brewName = null}) {
		const filename = (brew.head.filename || "").split(".").slice(0, -1).join(".");

		// For the editable brew, if there are multiple sources, present the user with a selection screen. We then filter
		//   the editable brew down to whichever sources they selected.
		const isChooseSources = brew.head.isEditable && (brew.body._meta?.sources || []).length > 1;

		if (!isChooseSources) {
			const outFilename = filename || brewName || this.constructor._getBrewName(brew);
			const json = brew.head.isEditable ? MiscUtil.copyFast(brew.body) : brew.body;
			this.constructor._mutExportableEditableData({json: json});
			return DataUtil.userDownload(outFilename, json, {isSkipAdditionalMetadata: true});
		}

		// region Get chosen sources
		const getSourceAsText = source => `[${(source.abbreviation || "").qq()}] ${(source.full || "").qq()}`;

		const choices = await InputUiUtil.pGetUserMultipleChoice({
			title: `Choose Sources`,
			values: brew.body._meta.sources,
			fnDisplay: getSourceAsText,
			isResolveItems: true,
			max: Number.MAX_SAFE_INTEGER,
			isSearchable: true,
			fnGetSearchText: getSourceAsText,
		});
		if (choices == null || choices.length === 0) return;
		// endregion

		// region Filter output by selected sources
		const cpyBrew = MiscUtil.copyFast(brew.body);
		const sourceAllowlist = new Set(choices.map(it => it.json));

		cpyBrew._meta.sources = cpyBrew._meta.sources.filter(it => sourceAllowlist.has(it.json));

		Object.entries(cpyBrew)
			.forEach(([k, v]) => {
				if (!v || !(v instanceof Array)) return;
				if (k.startsWith("_")) return;
				cpyBrew[k] = v.filter(it => {
					const source = SourceUtil.getEntitySource(it);
					if (!source) return true;
					return sourceAllowlist.has(source);
				});
			});
		// endregion

		const reducedFilename = filename || this.constructor._getBrewName({body: cpyBrew});

		this.constructor._mutExportableEditableData({json: cpyBrew});

		return DataUtil.userDownload(reducedFilename, cpyBrew, {isSkipAdditionalMetadata: true});
	}

	/**
	 * The editable brew may contain `uniqueId` references from the builder, which should be stripped before export.
	 */
	static _mutExportableEditableData ({json}) {
		Object.values(json)
			.forEach(arr => {
				if (arr == null || !(arr instanceof Array)) return;
				arr.forEach(ent => delete ent.uniqueId);
			});
		return json;
	}

	static _getBrewJsonTitle ({brew, brewName}) {
		brewName = brewName || this._getBrewName(brew);
		return brew.head.filename || brewName;
	}

	async _pRender_pDoViewBrewContents ({evt, brew}) {
		evt.stopPropagation();
		await ManageEditableBrewContentsUi.pDoOpen({brewUtil: this._brewUtil, brew, isModal: true, isReadOnly: true});
	}

	_pRender_doViewBrew ({evt, brew, brewName}) {
		const title = this.constructor._getBrewJsonTitle({brew, brewName});
		// eslint-disable-next-line vet-jquery/jquery
		const $content = Renderer.hover.$getHoverContent_statsCode(brew.body, {isSkipClean: true, title});
		Renderer.hover.getShowWindow(
			// eslint-disable-next-line vet-jquery/jquery
			$content,
			Renderer.hover.getWindowPositionFromEvent(evt),
			{
				title,
				isPermanent: true,
				isBookContent: true,
			},
		);
	}

	async _pRender_pDoOpenBrewMenu ({evt, rdState, brew, brewName, rowMeta}) {
		rowMeta.menu = rowMeta.menu || this._pRender_getBrewMenu({rdState, brew, brewName});

		await ContextUtil.pOpenMenu(evt, rowMeta.menu);
	}

	_pRender_getBrewMenu ({rdState, brew, brewName}) {
		const menuItems = [];

		if (this._isBrewOperationPermitted_update(brew)) {
			menuItems.push(
				new ContextUtil.Action(
					this._LBL_LIST_UPDATE,
					async () => this._pRender_pDoPullBrew({rdState, brew}),
				),
			);
		} else if (brew.head.isEditable) {
			menuItems.push(
				new ContextUtil.Action(
					this._LBL_LIST_MANAGE_CONTENTS,
					async () => this._pRender_pDoEditBrew({rdState, brew}),
				),
			);
		}

		menuItems.push(
			new ContextUtil.Action(
				this._LBL_LIST_EXPORT,
				async () => this._pRender_pDoDownloadBrew({brew, brewName}),
			),
			new ContextUtil.Action(
				this._LBL_LIST_VIEW_JSON,
				async evt => this._pRender_doViewBrew({evt, brew, brewName}),
			),
		);

		if (this._brewUtil.IS_EDITABLE && this._isBrewOperationPermitted_moveToEditable(brew)) {
			menuItems.push(
				new ContextUtil.Action(
					this._LBL_LIST_MOVE_TO_EDITABLE,
					async () => this._pRender_pDoMoveToEditable({rdState, brews: [brew]}),
				),
			);
		}

		if (this._isBrewOperationPermitted_delete(brew)) {
			menuItems.push(
				new ContextUtil.Action(
					this._LBL_LIST_DELETE,
					async () => this._pRender_pDoDelete({rdState, brews: [brew]}),
				),
			);
		}

		return ContextUtil.getMenu(menuItems);
	}

	_pGetUserBoolean_isMoveBrewsToEditable ({brews}) {
		return InputUiUtil.pGetUserBoolean({
			title: `Move to Editable ${this._brewUtil.DISPLAY_NAME.toTitleCase()} Document`,
			htmlDescription: `Moving ${brews.length === 1 ? `this ${this._brewUtil.DISPLAY_NAME}` : `these
			${this._brewUtil.DISPLAY_NAME_PLURAL}`} to the editable document will prevent ${brews.length === 1 ? "it" : "them"} from being automatically updated in future.<br>Are you sure you want to move ${brews.length === 1 ? "it" : "them"}?`,
			textYes: "Yes",
			textNo: "Cancel",
		});
	}

	async _pRender_pDoMoveToEditable ({rdState, brews}) {
		if (!brews?.length) return;

		if (!await this._pGetUserBoolean_isMoveBrewsToEditable({brews})) return;

		await this._brewUtil.pMoveToEditable({brews});

		await this._pRender_pBrewList(rdState);

		JqueryUtil.doToast(`${`${brews.length === 1 ? this._brewUtil.DISPLAY_NAME : this._brewUtil.DISPLAY_NAME_PLURAL}`.uppercaseFirst()} moved to editable document!`);
	}

	_pGetUserBoolean_isDeleteBrews ({brews}) {
		if (!brews.some(brew => brew.head.isEditable)) return true;

		const htmlDescription = brews.length === 1
			? `This document contains all your locally-created or edited ${this._brewUtil.DISPLAY_NAME_PLURAL}.<br>Are you sure you want to delete it?`
			: `One of the documents you are about to delete contains all your locally-created or edited ${this._brewUtil.DISPLAY_NAME_PLURAL}.<br>Are you sure you want to delete these documents?`;

		return InputUiUtil.pGetUserBoolean({
			title: `Delete ${this._brewUtil.DISPLAY_NAME}`,
			htmlDescription,
			textYes: "Yes",
			textNo: "Cancel",
		});
	}

	async _pRender_pDoDelete ({rdState, brews}) {
		if (!brews?.length) return;

		if (!await this._pGetUserBoolean_isDeleteBrews({brews})) return;

		await this._brewUtil.pDeleteBrews(brews);

		await this._pRender_pBrewList(rdState);
	}

	_pRender_getProcBrew (brew) {
		brew = MiscUtil.copyFast(brew);
		brew.body._meta.sources.sort((a, b) => SortUtil.ascSortLower(a.full || "", b.full || ""));
		return brew;
	}
}
