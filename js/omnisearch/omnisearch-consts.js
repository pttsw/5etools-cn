export class OmnisearchConsts {
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
		this.BTN_META_BREW,
		this.BTN_META_UA,
		this.BTN_META_BLOCKLISTED,
		this.BTN_META_LEGACY,
		this.BTN_META_SRD_ONLY,
	];
}

export const PARTNERED_CONTENT_MODE_ALL = "all";
export const PARTNERED_CONTENT_MODE_LOCAL = "local";
export const PARTNERED_CONTENT_MODE_NONE = "none";

export const PARTNERED_CONTENT_MODES = [
	PARTNERED_CONTENT_MODE_ALL,
	PARTNERED_CONTENT_MODE_LOCAL,
	PARTNERED_CONTENT_MODE_NONE,
];

export const PARTNERED_CONTENT_MODE_TOOLTIP = {
	[PARTNERED_CONTENT_MODE_NONE]: "Do Not Include Partnered Content",
	[PARTNERED_CONTENT_MODE_LOCAL]: "Include Locally-Loaded Partnered Content",
	[PARTNERED_CONTENT_MODE_ALL]: "Include All Partnered Content",
};

export const PARTNERED_CONTENT_MODE_TEXT = {
	[PARTNERED_CONTENT_MODE_ALL]: "Partnered (All)",
	[PARTNERED_CONTENT_MODE_LOCAL]: "Partnered (Local)",
	[PARTNERED_CONTENT_MODE_NONE]: "Partnered",
};
