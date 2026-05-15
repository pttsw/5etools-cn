/**
 * Generator script which creates stub per-entity pages for SEO.
 */

import fs from "fs";
import "./locale/i18n.js";
import "../js/parser.js";
import "../js/utils.js";
import "../js/utils-dataloader.js";
import "../js/utils-config.js";
import "../js/render.js";
import "../js/render-dice.js";
import * as ut from "./util.js";

const BASE_SITE_URL = `${(process.env.VET_BASE_SITE_URL || "https://5e.kiwee.top").replace(/\/+$/, "")}/`;
const LOG_EVERY = 1000; // Certain stakeholders prefer less logspam
const isSkipUaEtc = !!process.env.VET_SEO_IS_SKIP_UA_ETC;
const isOnlyVanilla = !!process.env.VET_SEO_IS_ONLY_VANILLA;

const templateHeadInner = fs.readFileSync("node/generate-pages/template/seo/template-seo-index-head-inner.hbs", "utf-8");
const templateBody = fs.readFileSync("node/generate-pages/template/seo/template-seo-index-body.hbs", "utf-8");

const lastMod = (() => {
	const date = new Date();
	return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
})();

const baseSitemapData = (() => {
	const out = {};

	// Scrape all the links from navigation.js -- avoid any unofficial HTML files which might exist
	const navText = fs.readFileSync("./js/navigation.js", "utf-8");
	navText.replace(/(?:"([^"]+\.html)"|'([^']+)\.html'|`([^`]+)\.html`)/gi, (...m) => {
		const str = m[1] || m[2] || m[3];
		if (str.includes("${")) return;
		out[str] = true;
	});
	delete out["index.html"];

	return out;
})();

const _getMetaDescription = (description) => {
	if (!description) return "";
	return Renderer.stripTags(description)
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 160);
};

const _getCleanPart = (part) => {
	if (!part) return null;

	const clean = Renderer.stripTags(`${part}`)
		.replace(/\s+/g, " ")
		.trim()
		.replace(/^[,;:，；：\s]+|[,;:，；：\s]+$/g, "");

	return clean || null;
};

const _joinDescriptionParts = (...parts) => _getMetaDescription(parts.map(_getCleanPart).filter(Boolean).join("；"));

const _getFallbackDescription = ({fluff, entries}) => getGenericDescription({fluff, entries});

const _getDescriptionSpells = ({entity: ent}) => _joinDescriptionParts(
	Parser.spLevelSchoolMetaToFull(ent.level, ent.school, ent.meta, ent.subschools),
	`施法时间 ${Parser.spTimeListToFull(ent.time)}`,
	`距离 ${Parser.spRangeToFull(ent.range)}`,
	`持续时间 ${Parser.spDurationToFull(ent.duration, {isPlainText: true})}`,
);

const _getDescriptionBestiary = ({entity: ent, fallbackDescription}) => {
	const typeText = Parser.monTypeToFullObj(ent.type).asText;
	const sizeText = Renderer.utils.getRenderedSize(ent.size);
	const alignmentText = ent.alignment?.length ? Parser.alignmentListToFull(ent.alignment) : null;
	const crText = ent.cr == null
		? null
		: typeof ent.cr === "string"
			? ent.cr
			: ent.cr.cr || ent.cr.special || ent.cr.xp || null;
	const speedText = ent.speed != null ? Parser.getSpeedString(ent, {isLongForm: true}) : null;

	return _joinDescriptionParts(
		[sizeText, typeText, alignmentText].filter(Boolean).join(" "),
		crText ? `挑战等级 ${crText}` : null,
		speedText ? `速度 ${speedText}` : null,
		fallbackDescription,
	);
};

const _getDescriptionItems = ({entity: ent, fallbackDescription}) => {
	const {typeRarityHtml, subTypeHtml, tierHtml} = Renderer.item.getTypeRarityAndAttunementHtmlParts(ent);
	const typeRarityText = Renderer.stripTags(
		Renderer.item.getTypeRarityAndAttunementHtml(
			{typeRarityHtml, subTypeHtml, tierHtml},
		),
	);
	const valueWeightText = [Parser.itemValueToFullMultiCurrency(ent), Parser.itemWeightToFull(ent)]
		.map(_getCleanPart)
		.filter(Boolean)
		.join("，");

	return _joinDescriptionParts(
		typeRarityText,
		valueWeightText,
		fallbackDescription,
	);
};

const _getDescriptionBackgrounds = ({entity: ent, fallbackDescription}) => {
	const skillText = ent._skillDisplay
		|| Renderer.generic.getSkillSummary({skillProfs: ent.skillProficiencies || [], isShort: true}).summary;

	return _joinDescriptionParts(
		"角色背景",
		skillText ? `技能 ${skillText}` : null,
		fallbackDescription,
	);
};

const _getDescriptionConditionsDiseases = ({entity: ent, fallbackDescription}) => _joinDescriptionParts(
	ent.type || Parser.getPropDisplayName(ent.__prop),
	fallbackDescription,
);

const _getDescriptionFeats = ({entity: ent, fallbackDescription}) => {
	const categoryText = ent.category ? Parser.featCategoryToFull(ent.category) : null;
	const prerequisiteText = Renderer.utils.prerequisite.getHtml(ent.prerequisite, {isListMode: false});

	return _joinDescriptionParts(
		categoryText ? `${categoryText}${["FS:P", "FS:R"].includes(ent.category) ? "" : "专长"}` : "专长",
		prerequisiteText ? `先决条件 ${prerequisiteText}` : null,
		fallbackDescription,
	);
};

const _getDescriptionRaces = ({entity: ent, fallbackDescription}) => {
	const sizeText = ent.size ? Renderer.utils.getRenderedSize(ent.size) : null;
	const speedText = ent.speed != null ? Parser.getSpeedString(ent, {isLongForm: true}) : null;

	return _joinDescriptionParts(
		"角色种族",
		sizeText ? `体型 ${sizeText}` : null,
		speedText ? `速度 ${speedText}` : null,
		fallbackDescription,
	);
};

const _DESCRIPTION_GETTERS = {
	spells: _getDescriptionSpells,
	bestiary: _getDescriptionBestiary,
	items: _getDescriptionItems,
	backgrounds: _getDescriptionBackgrounds,
	conditionsdiseases: _getDescriptionConditionsDiseases,
	feats: _getDescriptionFeats,
	races: _getDescriptionRaces,
};

const _getTemplateHeadInner = ({titleFull, metaDescription, canonicalUrl, img}) => {
	const ogImageMeta = img ? `<meta property="og:image" content="${new URL(img, BASE_SITE_URL).href}">` : "";
	const twitterCard = img ? "summary_large_image" : "summary";

	return templateHeadInner
		.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${metaDescription.qq()}">`)
		.replace(/<title>[\s\S]*?<\/title>/, `<title>${titleFull}</title>`)
		.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`)
		.replace("<meta property=\"og:type\" content=\"website\">", "<meta property=\"og:type\" content=\"article\">")
		.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${titleFull}">`)
		.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${metaDescription.qq()}">`)
		.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`)
		.replace(/<meta name="twitter:card" content="[^"]*">/, `<meta name="twitter:card" content="${twitterCard}">`)
		.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${titleFull}">`)
		.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${metaDescription.qq()}">`)
		.replace("<link rel=\"stylesheet\" href=\"/css/bootstrap.css\">", `${ogImageMeta}\n<link rel="stylesheet" href="/css/bootstrap.css">`);
};

const getTemplate = ({page, name, source, hash, img, description, isFluff, path}) => {
	const metaDescription = _getMetaDescription(description);
	const canonicalUrl = `${BASE_SITE_URL}${path}`;
	const listUrl = `${BASE_SITE_URL}${page}.html`;
	const titleFull = `${name.qq()} - 5etools`;
	const templateHead = _getTemplateHeadInner({titleFull, metaDescription, canonicalUrl, img});

	return `<!DOCTYPE html><head>
${templateHead}
<script>globalThis._SEO_PAGE="${page}";globalThis._SEO_SOURCE="${source}";globalThis._SEO_HASH="${hash}";globalThis._SEO_FLUFF=${isFluff};globalThis._SEO_CANONICAL_URL="${canonicalUrl}";globalThis._SEO_LIST_URL="${listUrl}"</script>
</head>
${templateBody}
</html>`;
};

const filterSkipUaEtc = (ent) => !isSkipUaEtc || !SourceUtil.isNonstandardSourceWotc(SourceUtil.getEntitySource(ent));

const filterOnlyVanilla = (ent) => !isOnlyVanilla || Parser.SOURCES_VANILLA.has(SourceUtil.getEntitySource(ent));

const _DESCRIPTION_WALKER = MiscUtil.getWalker({isNoModification: true, isBreakOnReturn: true, keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST});

const getGenericDescription = ({fluff, entries}) => {
	// Prefer fluff, where provided
	const entriesAvailable = fluff?.entries || entries;
	if (!entriesAvailable?.length) return null;

	if (typeof entriesAvailable[0] === "string") return Renderer.stripTags(entriesAvailable[0]);

	let strPrime;
	_DESCRIPTION_WALKER.walk(entriesAvailable, {string: str => {
		strPrime = str;
		return true;
	}});
	if (!strPrime) return null;

	return Renderer.stripTags(strPrime);
};

const _getEntityDescription = ({page, entity, fluff, entries}) => {
	const fallbackDescription = _getFallbackDescription({fluff, entries});
	const fnGetDescription = _DESCRIPTION_GETTERS[page];
	if (!fnGetDescription) return fallbackDescription;
	return fnGetDescription({entity, fluff, entries, fallbackDescription}) || fallbackDescription;
};

const toGenerate = [
	{
		page: "spells",
		pGetEntityMetas: async () => {
			const entities = (await DataUtil.spell.pLoadAll())
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => ({
				entity: ent,
				fluff: await Renderer.spell.pGetFluff(ent),
				description: _getEntityDescription({page: "spells", entity: ent, entries: ent.entries}),
			}));
		},
		isFluff: 1,
	},
	{
		page: "bestiary",
		pGetEntityMetas: async () => {
			const entities = (await DataUtil.monster.pLoadAll())
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => {
				const fluff = await Renderer.monster.pGetFluff(ent);
					return {
						entity: ent,
						fluff,
						img: Renderer.monster.hasToken(ent) ? Renderer.monster.getTokenUrl(ent) : null,
						description: _getEntityDescription({page: "bestiary", entity: ent, fluff, entries: ent.entries}),
					};
				});
			},
		isFluff: 1,
	},
	{
		page: "items",
		pGetEntityMetas: async () => {
			const entities = (await Renderer.item.pBuildList()).filter(it => !it._isItemGroup)
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => {
				const fluff = await Renderer.item.pGetFluff(ent);
				return {
					entity: ent,
					fluff,
					description: _getEntityDescription({page: "items", entity: ent, fluff, entries: ent._fullEntries || ent.entries}),
				};
			});
		},
		isFluff: 1,
	},
	{
		page: "backgrounds",
		pGetEntityMetas: async () => {
			const entities = ((await DataUtil.background.loadJSON()).background || [])
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => {
				const fluff = await Renderer.background.pGetFluff(ent);
				return {
					entity: ent,
					fluff,
					description: _getEntityDescription({page: "backgrounds", entity: ent, fluff, entries: ent.entries}),
				};
			});
		},
		isFluff: 1,
	},
	{
		page: "conditionsdiseases",
		pGetEntityMetas: async () => {
			const data = await DataUtil.loadJSON("data/conditionsdiseases.json");
			const entities = [
				...(data.condition || []).map(ent => ({...ent, __prop: "condition"})),
				...(data.disease || []).map(ent => ({...ent, __prop: "disease"})),
				...(data.status || []).map(ent => ({...ent, __prop: "status"})),
			]
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);

			return entities.pSerialAwaitMap(async ent => {
				const fluff = await Renderer.conditionDisease.pGetFluff(ent);
				return {
					entity: ent,
					fluff,
					description: _getEntityDescription({page: "conditionsdiseases", entity: ent, fluff, entries: ent.entries}),
				};
			});
		},
		isFluff: 1,
	},
	{
		page: "feats",
		pGetEntityMetas: async () => {
			const entities = ((await DataUtil.feat.loadJSON()).feat || [])
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => {
				Renderer.feat.initFullEntries(ent);
				return {
					entity: ent,
					fluff: await Renderer.feat.pGetFluff(ent),
					description: _getEntityDescription({page: "feats", entity: ent, entries: ent._fullEntries || ent.entries}),
				};
			});
		},
		isFluff: 1,
	},
	{
		page: "races",
		pGetEntityMetas: async () => {
			const entities = ((await DataUtil.race.loadJSON({isAddBaseRaces: true})).race || [])
				.filter(filterSkipUaEtc)
				.filter(filterOnlyVanilla);
			return entities.pSerialAwaitMap(async ent => {
				const fluff = await Renderer.race.pGetFluff(ent);
				return {
					entity: ent,
					fluff,
					description: _getEntityDescription({page: "races", entity: ent, fluff, entries: ent.entries}),
				};
			});
		},
		isFluff: 1,
	},

	// TODO expand this as required
];

const siteMapData = {};

async function main () {
	ut.patchLoadJson();

	let total = 0;
	console.log(`Generating SEO pages...`);
	await Promise.all(toGenerate.map(async meta => {
		try {
			fs.mkdirSync(`./${meta.page}`, { recursive: true });
		} catch (err) {
			if (err.code !== "EEXIST") throw err;
		}

		const entityMetas = await meta.pGetEntityMetas();
		const builder = UrlUtil.URL_TO_HASH_BUILDER[`${meta.page}.html`];
		entityMetas.forEach(({entity, fluff, img, description}) => {
			let offset = 0;
			let html;
			let path;
			while (true) {
				const hash = builder(entity);
				const sluggedHash = UrlUtil.getSluggedHash(hash);
				path = `${meta.page}/${sluggedHash}${offset ? `-${offset}` : ""}.html`;
				if (siteMapData[path]) {
					++offset;
					continue;
				}

				if (!img && fluff?.images?.length) {
					img = Renderer.utils.getEntryMediaUrl(fluff.images[0], "href", "img");
				}

				html = getTemplate({
					page: meta.page,
					name: entity.name,
					source: entity.source,
					hash,
					img,
					description,
					textStyle: meta.style,
					isFluff: meta.isFluff,
					path,
				});

				siteMapData[path] = true;
				break;
			}

			if (offset > 0) console.warn(`\tDeduplicated URL using suffix: ${path}`);

			fs.writeFileSync(`./${path}`, html, "utf-8");

			total++;
			if (total % LOG_EVERY === 0) console.log(`Wrote ${total} files...`);
		});
	}));
	console.log(`Wrote ${total} files.`);

	let sitemapLinkCount = 0;
	let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
	sitemap += `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n`;

	sitemap += `<url>
	<loc>${BASE_SITE_URL}</loc>
	<lastmod>${lastMod}</lastmod>
	<changefreq>monthly</changefreq>
</url>\n`;
	sitemapLinkCount++;

	Object.keys(baseSitemapData).forEach(url => {
		sitemap += `<url>
	<loc>${BASE_SITE_URL}${url}</loc>
	<lastmod>${lastMod}</lastmod>
	<changefreq>monthly</changefreq>
</url>\n`;
		sitemapLinkCount++;
	});

	Object.keys(siteMapData).forEach(url => {
		sitemap += `<url>
	<loc>${BASE_SITE_URL}${url}</loc>
	<lastmod>${lastMod}</lastmod>
	<changefreq>weekly</changefreq>
</url>\n`;
		sitemapLinkCount++;
	});

	sitemap += `</urlset>\n`;

	fs.writeFileSync("./sitemap.xml", sitemap, "utf-8");
	console.log(`Wrote ${sitemapLinkCount.toLocaleStringVe()} URL${sitemapLinkCount === 1 ? "" : "s"} to sitemap.xml`);

	ut.unpatchLoadJson();
}

main().then(() => console.log(`SEO page generation complete.`)).catch(e => console.error(e));
