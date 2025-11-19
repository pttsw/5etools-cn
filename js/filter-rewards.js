"use strict";

class PageFilterRewards extends PageFilterBase {
	constructor () {
		super();

		this._typeFilter = new Filter({
			header: "Type",
			cnHeader: "类型",
			items: [
				"Blessing",
				"Boon",
				"Charm",
				"Curse",
			],
			displayFn: Parser.rewardTypeToCN.bind(Parser),
		});
		this._rarityFilter = new Filter({
			header: "Rarity",
			cnHeader: "稀有度",
			items: ["unknown", ...Parser.RARITIES],
			itemSortFn: null,
			displayFn: Parser.rarityToCN.bind(Parser),
		});
		this._benefitsFilter = new Filter({
			header: "Benefits",
			cnHeader: "增益",
			items: [
				"施法",
			],
		});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["传奇", "有图片", "有简介"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
	}

	static mutateForFilters (it) {
		this._mutateForFilters_commonSources(it);

		it._fRarity = it.rarity || "unknown";
		it._fBenefits = [
			it.additionalSpells ? "施法" : null,
		].filter(Boolean);

		this._mutateForFilters_commonMisc(it);
	}

	addToFilters (ent, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(ent._fSources);
		this._typeFilter.addItem(ent.type);
		this._rarityFilter.addItem(ent._fRarity);
		this._benefitsFilter.addItem(ent._fBenefits);
		this._miscFilter.addItem(ent._fMisc);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._typeFilter,
			this._rarityFilter,
			this._benefitsFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, r) {
		return this._filterBox.toDisplay(
			values,
			r.source,
			r.type,
			r._fRarity,
			r._fBenefits,
			r._fMisc,
		);
	}
}

globalThis.PageFilterRewards = PageFilterRewards;
