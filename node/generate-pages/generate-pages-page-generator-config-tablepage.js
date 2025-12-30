import {PageGeneratorTablepageBase} from "./generate-pages-page-generator.js";

class _PageGeneratorEncountergen extends PageGeneratorTablepageBase {
	_page = "encountergen.html";

	_pageTitle = "遭遇";
	_navbarTitle = "遭遇生成器";
	_navbarDescriptionHtml = `在一个随机表上掷骰！或者，你可以试试<a href="${UrlUtil.PG_BESTIARY}#${globalThis.HASH_BLANK},encounterbuilder:true">遭遇生成器</a>。`;

	_scripts = [
		"encountergen.js",
	];
}

class _PageGeneratorNames extends PageGeneratorTablepageBase {
	_page = "names.html";

	_pageTitle = "名称";
	_navbarDescription = "选择一个种族和类别，然后掷骰！";

	_scripts = [
		"names.js",
	];
}

export const PAGE_GENERATORS_TABLEPAGE = [
	new _PageGeneratorEncountergen(),
	new _PageGeneratorNames(),
];
