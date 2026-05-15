import {PageGeneratorSeoIndexBase} from "./generate-pages-page-generator.js";

class _PageGeneratorSeoIndexBestiary extends PageGeneratorSeoIndexBase {
	_page = "bestiary/index.html";
	_pageTitle = "怪物图鉴";
	_pageDescription = "DND 5e 怪物图鉴详情页索引，收录怪物、NPC 与生物条目，适合搜索引擎抓取单体内容页。";
}

class _PageGeneratorSeoIndexBackgrounds extends PageGeneratorSeoIndexBase {
	_page = "backgrounds/index.html";
	_pageTitle = "背景";
	_pageDescription = "DND 5e 背景详情页索引，收录角色背景与相关条目，适合搜索引擎抓取单体内容页。";
}

class _PageGeneratorSeoIndexConditionsDiseases extends PageGeneratorSeoIndexBase {
	_page = "conditionsdiseases/index.html";
	_pageTitle = "状态与疾病";
	_pageDescription = "DND 5e 状态与疾病详情页索引，收录异常状态、疾病与相关规则条目。";
}

class _PageGeneratorSeoIndexFeats extends PageGeneratorSeoIndexBase {
	_page = "feats/index.html";
	_pageTitle = "专长";
	_pageDescription = "DND 5e 专长详情页索引，收录各类角色专长与相关规则条目。";
}

class _PageGeneratorSeoIndexItems extends PageGeneratorSeoIndexBase {
	_page = "items/index.html";
	_pageTitle = "物品";
	_pageDescription = "DND 5e 物品详情页索引，收录装备、魔法物品与其他道具条目。";
}

class _PageGeneratorSeoIndexRaces extends PageGeneratorSeoIndexBase {
	_page = "races/index.html";
	_pageTitle = "种族";
	_pageDescription = "DND 5e 种族详情页索引，收录角色种族与相关可选条目。";
}

class _PageGeneratorSeoIndexSpells extends PageGeneratorSeoIndexBase {
	_page = "spells/index.html";
	_pageTitle = "法术";
	_pageDescription = "DND 5e 法术详情页索引，收录法术条目与相关搜索入口。";
}

export const PAGE_GENERATORS_SEO_INDEX = [
	new _PageGeneratorSeoIndexBestiary(),
	new _PageGeneratorSeoIndexBackgrounds(),
	new _PageGeneratorSeoIndexConditionsDiseases(),
	new _PageGeneratorSeoIndexFeats(),
	new _PageGeneratorSeoIndexItems(),
	new _PageGeneratorSeoIndexRaces(),
	new _PageGeneratorSeoIndexSpells(),
];
