"use strict";

class PageFilterActions extends PageFilterBase {
	static getTimeText (time) {
		return typeof time === "string" ? time : Parser.getTimeToFull(time);
	}

	constructor () {
		super();

		this._timeFilter = new Filter({
			header: "Type",
			cnHeader: "类型",
			displayFn: (time)=> {
				switch (time) {
					case "action":
						return "动作";
					case "bonus":
						return "附赠动作";
					case "minute":
						return "分钟";
					case "reaction":
						return "反应";
					default:
						return StrUtil.uppercaseFirst(time)
				}
			},
			itemSortFn: SortUtil.ascSortLower,
		});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["可选/变体动作", "传奇"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
	}

	static mutateForFilters (it) {
		this._mutateForFilters_commonSources(it);
		it._fTime = it.time ? it.time.map(it => it.unit || it) : null;
		this._mutateForFilters_commonMisc(it);
		if (it.fromVariant) it._fMisc.push("可选/变体动作");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it._fSources);
		this._timeFilter.addItem(it._fTime);
		this._miscFilter.addItem(it._fMisc);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._timeFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it._fSources,
			it._fTime,
			it._fMisc,
		);
	}
}

globalThis.PageFilterActions = PageFilterActions;
