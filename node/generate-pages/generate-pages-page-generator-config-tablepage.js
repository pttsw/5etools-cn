import {PageGeneratorTablepageBase} from "./generate-pages-page-generator.js";

class _PageGeneratorEncountergen extends PageGeneratorTablepageBase {
	_page = "encountergen.html";

	_pageTitle = "遭遇";
	_pageDescription = "DND 5e 遭遇生成器，根据环境和 CR 随机生成遭遇，包含怪物组合和战利品。";
	_pageKeywords = "DND,5e,遭遇生成器,随机遭遇,怪物组合,龙与地下城";
	_navbarTitle = "遭遇生成器";
	_navbarDescriptionHtml = `在一个随机表上掷骰！或者，你可以试试<a href="${UrlUtil.PG_BESTIARY}#${globalThis.HASH_BLANK},encounterbuilder:true">遭遇生成器</a>。`;
	_scriptIdentList = "encounters";

	_scriptsModules = [
		"encountergen.js",
	];
}

class _PageGeneratorNames extends PageGeneratorTablepageBase {
	_page = "names.html";

	_pageTitle = "名称";
	_pageDescription = "DND 5e 名称生成器，根据种族和性别随机生成角色名称，支持多种族命名规则。";
	_pageKeywords = "DND,5e,名称生成器,角色名称,种族名称,龙与地下城";
	_navbarDescription = "选择一个种族和类别，然后掷骰！";
	_scriptIdentList = "names";

	_scriptsModules = [
		"names.js",
	];
}

export const PAGE_GENERATORS_TABLEPAGE = [
	new _PageGeneratorEncountergen(),
	new _PageGeneratorNames(),
];
