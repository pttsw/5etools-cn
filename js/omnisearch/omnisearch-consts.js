export class OmnisearchConsts {
	static BTN_META_PARTNERED = {
		propOmnisearch: "isShowPartnered",
		fnAddHookOmnisearch: "addHookPartnered",
		fnDoToggleOmnisearch: "doTogglePartnered",
		title: "包括合作资源",
		text: "合作",
	};
	static BTN_META_BREW = {
		propOmnisearch: "isShowBrew",
		fnAddHookOmnisearch: "addHookBrew",
		fnDoToggleOmnisearch: "doToggleBrew",
		title: "包括自制资源",
		text: "自制",
	};
	static BTN_META_UA = {
		propOmnisearch: "isShowUa",
		fnAddHookOmnisearch: "addHookUa",
		fnDoToggleOmnisearch: "doToggleUa",
		title: "包括UA和其他第三方资源",
		text: "UA等",
	};
	static BTN_META_BLOCKLISTED = {
		propOmnisearch: "isShowBlocklisted",
		fnAddHookOmnisearch: "addHookBlocklisted",
		fnDoToggleOmnisearch: "doToggleBlocklisted",
		title: "包括黑名单资源",
		text: "黑名单",
	};
	static BTN_META_LEGACY = {
		propOmnisearch: "isShowLegacy",
		fnAddHookOmnisearch: "addHookLegacy",
		fnDoToggleOmnisearch: "doToggleLegacy",
		title: "包括传奇资源",
		text: "传奇",
	};
	static BTN_META_SRD_ONLY = {
		propOmnisearch: "isSrdOnly",
		fnAddHookOmnisearch: "addHookSrdOnly",
		fnDoToggleOmnisearch: "doToggleSrdOnly",
		title: "仅显示系统参考文档内容",
		text: "SRD",
	};
	static BTN_METAS = [
		this.BTN_META_PARTNERED,
		this.BTN_META_BREW,
		this.BTN_META_UA,
		this.BTN_META_BLOCKLISTED,
		this.BTN_META_LEGACY,
		this.BTN_META_SRD_ONLY,
	];
}
