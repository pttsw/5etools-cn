import {PAGE_GENERATORS_LISTPAGE} from "./generate-pages-page-generator-config-list.js";
import {PAGE_GENERATORS_REDIRECT} from "./generate-pages-page-generator-config-redirect.js";
import {PAGE_GENERATORS_ADVENTURE_BOOK} from "./generate-pages-page-generator-config-advbook.js";
import {PageGeneratorGeneric} from "./generate-pages-page-generator.js";
import {PAGE_GENERATORS_TABLEPAGE} from "./generate-pages-page-generator-config-tablepage.js";
import {PAGE_GENERATORS_MANAGER} from "./generate-pages-page-generator-config-manager.js";
import {PAGE_GENERATORS_SEO_INDEX} from "./generate-pages-page-generator-config-seo.js";
import { I18n } from "i18n";

class _PageGeneratorMaps extends PageGeneratorGeneric {
	_filename = "page/template-page-maps.hbs";
	_page = UrlUtil.PG_MAPS;

	_pageTitle = "地图";
	_navbarDescription = "浏览模组和书籍中的地图。";

	_stylesheets = [
		"maps",
	];

	_scriptsModules = [
		"render-map.js",
		"maps-util.js",
		"maps.js",
	];
}

class _PageGeneratorDmscreen extends PageGeneratorGeneric {
	_filename = "page/template-page-dmscreen.hbs";
	_page = UrlUtil.PG_DM_SCREEN;

	_pageTitle = "DM 帷幕";
	_navbarDescription = "构筑你个人的 DM 帷幕。";

	_isFontAwesome = true;
	_stylesheets = [
		"dmscreen",
	];

	_scriptsLibAdditional = [
		"peerjs.js",
		"jquery.panzoom.js",
		"lzma.js",
	];

	_scriptsUtilsAdditional = [
		"utils-list.js",
		"utils-p2p.js",
	];

	_scriptsModules = [
		"render-map.js",
		"dmscreen.js",
	];
}

class _PageGeneratorBlocklist extends PageGeneratorGeneric {
	_filename = "page/template-page-blocklist.hbs";
	_page = "blocklist.html";

	_pageTitle = "内容黑名单";
	_navbarDescription = "Exclude content and export configurations.";

	_scripts = [
		"blocklist-ui.js",
		"blocklist.js",
	];
}

class _PageGeneratorChangelog extends PageGeneratorGeneric {
	_filename = "page/template-page-changelog.hbs";
	_page = "changelog.html";

	_pageTitle = "更新日志";
	_navbarDescription = "看看改了什么。";

	_stylesheets = [
		"changelog",
	];

	_scriptsUtilsAdditional = [
		"utils-changelog.js",
	];

	_scripts = [
		"changelog.js",
	];
}

class _PageGeneratorConverter extends PageGeneratorGeneric {
	_filename = "page/template-page-converter.hbs";
	_page = "converter.html";

	_pageTitle = "文本转换器";
	_navbarDescription = "在左侧输入文本，点击“转换”，复制右侧的Json。";

	_stylesheets = [
		"converter",
	];

	_scriptsLibAdditional = [
		"ace.js",
	];

	_scriptsRenderAdditional = [
		"render-markdown.js",
	];

	_scriptsModules = [
		"converter.js",
	];
}

class _PageGeneratorCrcalculator extends PageGeneratorGeneric {
	_filename = "page/template-page-crcalculator.hbs";
	_page = "crcalculator.html";

	_pageTitle = "CR 计算器 (2014)";
	_navbarDescription = "轻松地构筑自定义生物。";

	_stylesheets = [
		"crcalculator",
	];

	_scriptsModules = [
		"crcalculator.js",
	];
}

class _PageGeneratorIndex extends PageGeneratorGeneric {
	_filename = "page/template-page-index.hbs";
	_page = "index.html";
	_pageDescription = "一套为了《龙与地下城 DND 5E》玩家和地下城主而存在的工具网站。";

	_navbarTitleHtml = `5e<span>tools</span>`;
	_navbarDescription = "一套为了《龙与地下城 DND 5E》玩家和地下城主而存在的工具网站。";
	_navbarPageTitleStyleAdditional = "page__title--home";

	_isFontAwesome = true;
	_stylesheets = [
		"index",
	];

	_scriptsModules = [
		"index.js",
	];
}

class _PageGeneratorInittrackerplayerview extends PageGeneratorGeneric {
	_filename = "page/template-page-inittrackerplayerview.hbs";
	_page = "inittrackerplayerview.html";

	_pageTitle = "先攻追踪器玩家视图";
	_navbarDescription = "按F切换全屏，祝你好运！";

	_stylesheets = [
		"inittrackerplayerview",
	];

	_scriptsLibAdditional = [
		"peerjs.js",
		"lzma.js",
	];

	_scriptsUtilsAdditional = [
		"utils-p2p.js",
	];

	_scriptsModules = [
		"inittrackerplayerview.js",
	];
}

class _PageGeneratorLangdemo extends PageGeneratorGeneric {
	_filename = "page/template-page-langdemo.hbs";
	_page = "langdemo.html";

	_pageTitle = "RoLang Demo";
	_navbarDescription = "Edit the input and context, and hit Run";

	_stylesheets = [
		"langdemo",
	];

	_scriptsRenderAdditional = [
		"render-markdown.js",
		"render-card.js",
	];

	_scriptsLibAdditional = [
		"ace.js",
	];

	_scriptsModules = [
		"langdemo.js",
		"rolang.js",
	];
}

class _PageGeneratorLifegen extends PageGeneratorGeneric {
	_filename = "page/template-page-lifegen.hbs";
	_page = "lifegen.html";

	_pageTitle = "这是你的人生";
	_navbarDescription = "填写生成参数，然后点击生成。";

	_stylesheets = [
		"lifegen",
	];

	_scriptsUtilsAdditional = [
		"utils-generate.js",
	];

	_scripts = [
		"lifegen.js",
	];
}

class _PageGeneratorLootgen extends PageGeneratorGeneric {
	_filename = "page/template-page-lootgen.hbs";
	_page = "lootgen.html";

	_pageTitle = "战利品生成器";
	_navbarDescription = "配置生成器, 然后掷骰生成战利品！";

	_stylesheets = [
		"lootgen-bundle",
	];

	_scriptsUtilsAdditional = [
		"utils-generate.js",
		"filter-common.js",
		"filter-items.js",
		"filter-spells.js",
	];

	_scriptsModules = [
		"lootgen.js",
	];
}

class _PageGeneratorMakebrew extends PageGeneratorGeneric {
	_filename = "page/template-page-makebrew.hbs";
	_page = "makebrew.html";

	_pageTitle = I18nUtil.get("page.makebrew.title");
	_navbarDescription = I18nUtil.get("page.makebrew.subtitle");

	_stylesheets = [
		"makebrew",
	];

	_scriptsLibAdditional = [
		"bootstrap-typeahead.js",
	];

	_scriptsRenderAdditional = [
		"render-markdown.js",
	];

	_scriptsUtilsAdditional = [
		"filter-spells.js",
	];

	_scriptsModules = [
		"makebrew.js",
	];
}

class _PageGeneratorMakecards extends PageGeneratorGeneric {
	_filename = "page/template-page-makecards.hbs";
	_page = "makecards.html";

	_pageTitle = "RPG Cards JSON Builder";
	_navbarDescription = "Build and export card JSON data.";

	_stylesheets = [
		"makecards",
	];

	_scriptsLibAdditional = [
		"bootstrap-typeahead.js",
	];

	_scriptsLibAdditionalRemote = [
		"https://rpg-cards.vercel.app/js/icons.js",
	];

	_scriptsRenderAdditional = [
		"render-card.js",
	];

	_scriptsUtilsAdditional = [
		"filter-common.js",
		"filter-bestiary.js",
		"filter-items.js",
		"filter-spells.js",
		"filter-races.js",
		"filter-backgrounds.js",
		"filter-feats.js",
		"filter-optionalfeatures.js",
	];

	_scripts = [
		"makecards.js",
	];
}

class _PageGeneratorPlutonium extends PageGeneratorGeneric {
	_filename = "page/template-page-plutonium.hbs";
	_page = "plutonium.html";

	_pageTitle = "Plutonium Features";
	_navbarDescription = "An overview of the 5etools integration for Foundry VTT.";

	_stylesheets = [
		"plutonium",
	];

	_scriptsModules = [
		"plutonium.js",
	];
}

class _PageGeneratorPrivacyPolicy extends PageGeneratorGeneric {
	_filename = "page/template-page-privacy-policy.hbs";
	_page = "privacy-policy.html";

	_pageTitle = "Privacy Policy";
	_navbarDescription = `Just click "Accept."`;

	_scripts = [
		"privacy-policy.js",
	];
}

class _PageGeneratorRenderdemo extends PageGeneratorGeneric {
	_filename = "page/template-page-renderdemo.hbs";
	_page = "renderdemo.html";

	_pageTitle = "Renderer Demo";
	_navbarDescription = "Edit the JSON on the left, and see the results on the right.";

	_stylesheets = [
		"renderdemo",
	];

	_scriptsRenderAdditional = [
		"render-markdown.js",
		"render-card.js",
	];

	_scriptsLibAdditional = [
		"ace.js",
	];

	_scripts = [
		"renderdemo.js",
	];
}

class _PageGeneratorSearch extends PageGeneratorGeneric {
	_filename = "page/template-page-search.hbs";
	_page = "search.html";

	_pageTitle = "搜索";
	_navbarDescription = "在你浏览器之中的搜索引擎。";

	_stylesheets = [
		"search",
	];

	_scriptsModules = [
		"search.js",
	];
}

class _PageGeneratorStatgen extends PageGeneratorGeneric {
	_filename = "page/template-page-statgen.hbs";
	_page = "statgen.html";

	_pageTitle = "属性生成器";
	_navbarDescription = "在左侧选择生成方式, 参考右侧的生成方法。";

	_isFontAwesome = true;
	_stylesheets = [
		"statgen-bundle",
	];

	_scriptsUtilsAdditional = [
		"filter-common.js",
		"filter-races.js",
		"filter-backgrounds.js",
		"filter-feats.js",
	];

	_scriptsModules = [
		"statgen.js",
	];
}

export const PAGE_GENERATORS = 	[
	...PAGE_GENERATORS_LISTPAGE,
	...PAGE_GENERATORS_REDIRECT,
	...PAGE_GENERATORS_ADVENTURE_BOOK,
	...PAGE_GENERATORS_TABLEPAGE,
	...PAGE_GENERATORS_MANAGER,
	...PAGE_GENERATORS_SEO_INDEX,

	new _PageGeneratorMaps(),
	new _PageGeneratorDmscreen(),
	new _PageGeneratorBlocklist(),
	new _PageGeneratorChangelog(),
	new _PageGeneratorConverter(),
	new _PageGeneratorCrcalculator(),
	new _PageGeneratorIndex(),
	new _PageGeneratorInittrackerplayerview(),
	new _PageGeneratorLangdemo(),
	new _PageGeneratorLifegen(),
	new _PageGeneratorLootgen(),
	new _PageGeneratorMakebrew(),
	new _PageGeneratorMakecards(),
	new _PageGeneratorPlutonium(),
	new _PageGeneratorPrivacyPolicy(),
	new _PageGeneratorRenderdemo(),
	new _PageGeneratorSearch(),
	new _PageGeneratorStatgen(),
];
