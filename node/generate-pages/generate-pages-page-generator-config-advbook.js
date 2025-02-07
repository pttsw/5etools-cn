import {PageGeneratorAdventureBookBase, PageGeneratorAdventuresBooksBase} from "./generate-pages-page-generator.js";
import {HtmlGeneratorListButtons} from "./generate-pages-html-generator.js";

class _PageGeneratorAdventure extends PageGeneratorAdventureBookBase {
	_page = UrlUtil.PG_ADVENTURE;

	_pageTitle = "冒险模组";
	_navbarTitle = "冒险详情";
	_navbarDescription = "加载中...";
	_scriptIdentAdvBook = "adventure";
	_advBookPlaceholder = `Did you ever hear the tragedy of Darth Plagueis The Wise? I thought not. It's not a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.`;
}

class _PageGeneratorBook extends PageGeneratorAdventureBookBase {
	_page = UrlUtil.PG_BOOK;

	_pageTitle = "出版书籍";
	_navbarTitle = "书籍详情";
	_navbarDescription = "加载中...";
	_scriptIdentAdvBook = "book";
}

class _PageGeneratorQuickref extends PageGeneratorAdventureBookBase {
	_page = UrlUtil.PG_QUICKREF;

	_pageTitle = "快速参照(2014)";
	_navbarTitle = "快速参照(2014)";
	_navbarDescription = "Browse content. Press F to find, and G to go to page.";
	_scriptIdentAdvBook = "quickreference";
	_advBookPlaceholder = `Trans rights are human rights.`;
}

class _PageGeneratorAdventures extends PageGeneratorAdventuresBooksBase {
	_page = UrlUtil.PG_ADVENTURES;

	_pageTitle = "冒险模组";
	_navbarTitle = "冒险模组";
	_navbarDescription = "浏览冒险模组的名称与内容。";
	_scriptIdentAdvsBooks = "adventures";
	_searchName = "adventure";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "1-3", sortIdent: "group", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "5-5", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({width: "2-5", sortIdent: "storyline", text: "故事情节"}),
		HtmlGeneratorListButtons.getBtn({width: "1", sortIdent: "level", text: "等级"}),
		HtmlGeneratorListButtons.getBtn({width: "1-7", sortIdent: "published", text: "出版时间"}),
	];
}

class _PageGeneratorBooks extends PageGeneratorAdventuresBooksBase {
	_page = UrlUtil.PG_BOOKS;

	_pageTitle = "书籍";
	_navbarTitle = "书籍";
	_navbarDescription = "浏览书籍的名称和内容。";
	_scriptIdentAdvsBooks = "books";
	_searchName = "book";

	_btnsList = [
		HtmlGeneratorListButtons.getBtn({width: "1-3", sortIdent: "group", text: "类型"}),
		HtmlGeneratorListButtons.getBtn({width: "8-5", sortIdent: "name", text: "名称"}),
		HtmlGeneratorListButtons.getBtn({sortIdent: "published", text: "出版时间"}),
	];
}

export const PAGE_GENERATORS_ADVENTURE_BOOK = [
	new _PageGeneratorAdventure(),
	new _PageGeneratorBook(),
	new _PageGeneratorQuickref(),

	new _PageGeneratorAdventures(),
	new _PageGeneratorBooks(),
];
