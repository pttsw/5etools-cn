import {PageGeneratorListBase} from "./generate-pages-page-generator.js";
import {HtmlGeneratorListButtons} from "./generate-pages-html-generator.js";

class _PageGeneratorListActions extends PageGeneratorListBase {
	_page = UrlUtil.PG_ACTIONS;
	_pageTitle = "动作";
	_scriptIdentList = "actions";

	_btnsList = [
		HtmlGeneratorListButtons.getBtnPreviewToggle(),
		HtmlGeneratorListButtons.getBtn({width: "5-7", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "time", text: "时间"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "time", text: "时间"}),
	];
}

class _PageGeneratorListBackgrounds extends PageGeneratorListBase {
	_page = UrlUtil.PG_BACKGROUNDS;
	_pageTitle = "背景故事";
	_scriptIdentList = "backgrounds";
	_isHasRenderer = false;

	_isModule = true;

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "2-5", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3-5", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "skills", text: "技能熟练"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "skills", text: "技能"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListBestiary extends PageGeneratorListBase {
	_page = UrlUtil.PG_BESTIARY;
	_pageTitle = "怪物图鉴";

	_stylesheets = [
		"bestiary",
		"encounterbuilder-bundle",
	];

	_scriptIdentList = "bestiary";
	_isHasRenderer = false;

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_isModule = true;
	_isMultisource = true;
	_isWrpToken = true;

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "4-2", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "4-1", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "1-7", sortIdent: "cr", text: "CR"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "名称"}),

		HtmlGeneratorListButtons.getBtn({width: "3-8", classListAdditional: ["best-ecgen__hidden"], sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "3-8", classListAdditional: ["best-ecgen__visible"], isDisabled: true, text: "&nbsp;"}),

		HtmlGeneratorListButtons.getBtn({width: "1-2", sortIdent: "cr", text: "CR"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "count", text: "数量"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperBestiary",
			filename: "list/template-list-contentwrapper--bestiary.hbs",
		});

		this._registerPartial({
			ident: "listSublistContainerBestiary",
			filename: "list/template-list-sublist-container--bestiary.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperBestiary",
		};
	}

	_isPrinterView = true;
	_isTableView = true;
}

class _PageGeneratorListCharCreationOptions extends PageGeneratorListBase {
	_page = UrlUtil.PG_CHAR_CREATION_OPTIONS;
	_pageTitle = "其他角色创建选项";
	_scriptIdentList = "charcreationoptions";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListConditionsDiseases extends PageGeneratorListBase {
	_page = UrlUtil.PG_CONDITIONS_DISEASES;
	_pageTitle = "状态 & 疾病";
	_scriptIdentList = "conditionsdiseases";
	_isHasRenderer = false;

	_isModule = true;

	_btnsList = [
		HtmlGeneratorListButtons.getBtnPreviewToggle(),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "6-7", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListCultsBoons extends PageGeneratorListBase {
	_page = UrlUtil.PG_CULTS_BOONS;
	_pageTitle = "异教 & 超自然恩惠";
	_scriptIdentList = "cultsboons";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "subType", text: "子类"}),
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "subType", text: "子类"}),
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListDecks extends PageGeneratorListBase {
	_page = UrlUtil.PG_DECKS;
	_pageTitle = "牌组";

	_isFontAwesome = true;

	_stylesheets = [
		"decks",
	];
	_isStyleBook = true;

	_scriptIdentList = "decks";

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-7";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "12", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListDeities extends PageGeneratorListBase {
	_page = UrlUtil.PG_DEITIES;
	_pageTitle = "神祇";
	_scriptIdentList = "deities";

	_styleListContainerAdditional = "ve-flex-6";
	_styleContentWrapperAdditional = "ve-flex-4";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "pantheon", text: "神系"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "alignment", text: "阵营"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "domains", text: "领域"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "pantheon", text: "神系"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "alignment", text: "阵营"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "domains", text: "领域"}),
	];
}

class _PageGeneratorListFeats extends PageGeneratorListBase {
	_page = UrlUtil.PG_FEATS;
	_pageTitle = "专长";
	_scriptIdentList = "feats";
	_isHasRenderer = false;

	_styleListContainerAdditional = "ve-flex-6";
	_styleContentWrapperAdditional = "ve-flex-5";

	_isModule = true;

	_btnsList = [
		HtmlGeneratorListButtons.getBtnPreviewToggle(),
		HtmlGeneratorListButtons.getBtn({width: "3-2", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "1-3", sortIdent: "category", text: "分类"}),
		HtmlGeneratorListButtons.getBtn({width: "2-5", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "prerequisite", text: "先决条件"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "category", text: "分类"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "prerequisite", text: "先决条件"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListItems extends PageGeneratorListBase {
	_page = UrlUtil.PG_ITEMS;
	_pageTitle = "物品";

	_stylesheets = [
		"items",
	];

	_scriptIdentList = "items";
	_isHasRenderer = false;

	_isModule = true;

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_styleListContainerAdditional = "ve-flex-6 itm__wrp-lists";
	_styleContentWrapperAdditional = "ve-flex-4 itm__wrp-stats";

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "weight", text: "重量"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "cost", text: "价值"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "count", text: "数量"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listListcontainerItems",
			filename: "list/template-list-listcontainer--items.hbs",
		});

		this._registerPartial({
			ident: "listSublistContainerItems",
			filename: "list/template-list-sublist-container--items.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListListcontainer: "listListcontainerItems",
			identPartialListSublistContainer: "listSublistContainerItems",
		};
	}

	_isPrinterView = true;
	_isTableView = true;
}

class _PageGeneratorListTrapsHazards extends PageGeneratorListBase {
	_page = UrlUtil.PG_TRAPS_HAZARDS;
	_pageTitle = "陷阱 & 危害";
	_scriptIdentList = "trapshazards";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "trapType", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "trapType", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListRewards extends PageGeneratorListBase {
	_page = UrlUtil.PG_REWARDS;
	_pageTitle = "Supernatural Gifts & Rewards";
	_scriptIdentList = "rewards";

	_btnsList = [
		HtmlGeneratorListButtons.getBtnPreviewToggle(),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "7-7", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "名称"}),
	];
}

class _PageGeneratorListLanguages extends PageGeneratorListBase {
	_page = UrlUtil.PG_LANGUAGES;
	_pageTitle = "语言";
	_scriptIdentList = "languages";

	_stylesheets = [
		"languages",
	];

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "script", text: "Script"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "script", text: "Script"}),
	];
}

class _PageGeneratorListObjects extends PageGeneratorListBase {
	_page = UrlUtil.PG_OBJECTS;
	_pageTitle = "物件";
	_scriptIdentList = "objects";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "尺寸"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "size", text: "尺寸"}),
	];

	_isWrpToken = true;
}

class _PageGeneratorListOptionalFeatures extends PageGeneratorListBase {
	_page = UrlUtil.PG_OPT_FEATURES;
	_pageTitle = "职业能力选项";
	_scriptIdentList = "optionalfeatures";
	_isHasRenderer = false;

	_isModule = true;

	_isPrinterView = true;

	_stylesheets = [
		"optionalfeatures",
	];

	_styleListContainerAdditional = "ve-flex-6";
	_styleContentWrapperAdditional = "ve-flex-4";

	_btnsList = [
		HtmlGeneratorListButtons.getBtnPreviewToggle(),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "4-7", sortIdent: "prerequisite", text: "先决条件"}),
		HtmlGeneratorListButtons.getBtn({width: "1", sortIdent: "level", text: "等级"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "4-5", sortIdent: "prerequisite", text: "先决条件"}),
		HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "等级"}),
	];
}

class _PageGeneratorListPsionics extends PageGeneratorListBase {
	_page = UrlUtil.PG_PSIONICS;
	_pageTitle = "灵能";
	_scriptIdentList = "psionics";

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "order", text: "Order"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "order", text: "Order"}),
	];

	_isPrinterView = true;
	_isTableView = true;
}

class _PageGeneratorListRaces extends PageGeneratorListBase {
	_page = UrlUtil.PG_RACES;
	_pageTitle = "种族";
	_scriptIdentList = "races";
	_isHasRenderer = false;

	_isModule = true;

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "体型"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "ability", text: "属性值"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "体型"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListRecipes extends PageGeneratorListBase {
	_page = UrlUtil.PG_RECIPES;
	_pageTitle = "食谱";
	_scriptIdentList = "recipes";

	_stylesheets = [
		"recipes",
	];

	_isStyleBook = true;

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-7";
	_stylePageContentAdditional = "recipes__tbl-recipes";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "type", text: "分类"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "分类"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperRecipes",
			filename: "list/template-list-contentwrapper--recipes.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperRecipes",
		};
	}
}

class _PageGeneratorListSpells extends PageGeneratorListBase {
	_page = UrlUtil.PG_SPELLS;
	_pageTitle = "法术";
	_scriptIdentList = "spells";
	_isHasRenderer = false;

	_stylesheets = [
		"spells",
	];

	_styleListContainerAdditional = "ve-flex-7";
	_styleContentWrapperAdditional = "ve-flex-5";

	_isModule = true;
	_isMultisource = true;

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "2-9", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "环阶"}),
		HtmlGeneratorListButtons.getBtn({width: "1-7", sortIdent: "time", text: "时间"}),
		HtmlGeneratorListButtons.getBtn({width: "1-2", sortIdent: "school", text: "学派"}),
		HtmlGeneratorListButtons.getBtn({width: "0-6", sortIdent: "concentration", title: "专注", text: "专"}),
		HtmlGeneratorListButtons.getBtn({width: "2-4", sortIdent: "range", text: "射程"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "3-2", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "环阶"}),
		HtmlGeneratorListButtons.getBtn({width: "1-8", sortIdent: "time", text: "时间"}),
		HtmlGeneratorListButtons.getBtn({width: "1-6", sortIdent: "school", text: "学派"}),
		HtmlGeneratorListButtons.getBtn({width: "0-7", sortIdent: "concentration", title: "专注", text: "专"}),
		HtmlGeneratorListButtons.getBtn({width: "3-2", sortIdent: "range", text: "射程"}),
	];

	_isPrinterView = true;
	_isTableView = true;

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperSpells",
			filename: "list/template-list-contentwrapper--spells.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperSpells",
		};
	}
}

class _PageGeneratorListTables extends PageGeneratorListBase {
	_page = UrlUtil.PG_TABLES;
	_pageTitle = "表格";
	_scriptIdentList = "tables";

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-6";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "sortName", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "12", sortIdent: "sortName", text: "名称"}),
	];
}

class _PageGeneratorListVariantRules extends PageGeneratorListBase {
	_page = UrlUtil.PG_VARIANTRULES;
	_pageTitle = "术语汇编";
	_navbarTitle = "术语汇编";
	_scriptIdentList = "variantrules";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "ruleType", text: "类型"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "ruleType", text: "类型"}),
	];
}

class _PageGeneratorListVehicles extends PageGeneratorListBase {
	_page = UrlUtil.PG_VEHICLES;
	_pageTitle = "载具";
	_scriptIdentList = "vehicles";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "type", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "名称"}),
	];

	_isWrpToken = true;
}

class _PageGeneratorListBastions extends PageGeneratorListBase {
	_page = UrlUtil.PG_BASTIONS;
	_pageTitle = "据点";
	_scriptIdentList = "bastions";
	_isHasRenderer = false;

	_isModule = true;

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "facilityType", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "1", sortIdent: "level", text: "等级"}),
		HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "prerequisite", text: "先决条件"}),
		HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "facilityType", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "level", text: "等级"}),
		HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "prerequisite", text: "先决条件"}),
	];

	_isPrinterView = true;
	_isTableView = true;
}

class _PageGeneratorListClasses extends PageGeneratorListBase {
	_filename = "list/template-list--classes.hbs";

	_page = UrlUtil.PG_CLASSES;
	_pageTitle = "职业";
	_scriptIdentList = "classes";
	_isHasRenderer = false;

	_stylesheets = [
		"classes",
	];

	_isModule = true;
}

export const PAGE_GENERATORS_LISTPAGE = [
	new _PageGeneratorListActions(),
	new _PageGeneratorListBackgrounds(),
	new _PageGeneratorListBestiary(),
	new _PageGeneratorListCharCreationOptions(),
	new _PageGeneratorListConditionsDiseases(),
	new _PageGeneratorListCultsBoons(),
	new _PageGeneratorListDecks(),
	new _PageGeneratorListDeities(),
	new _PageGeneratorListFeats(),
	new _PageGeneratorListItems(),
	new _PageGeneratorListTrapsHazards(),
	new _PageGeneratorListRewards(),
	new _PageGeneratorListLanguages(),
	new _PageGeneratorListObjects(),
	new _PageGeneratorListOptionalFeatures(),
	new _PageGeneratorListPsionics(),
	new _PageGeneratorListRaces(),
	new _PageGeneratorListRecipes(),
	new _PageGeneratorListSpells(),
	new _PageGeneratorListTables(),
	new _PageGeneratorListVariantRules(),
	new _PageGeneratorListVehicles(),
	new _PageGeneratorListBastions(),

	new _PageGeneratorListClasses(),
];
