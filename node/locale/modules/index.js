// import system from './system/index.js'
import common from "./common/index.js";
import page from "./page/index.js";
import parser from "./parser/index.js";

// const components = transferLangConfig({
//   "no-data": ['没有数据', '沒有數據', 'No Data'],
// })

export default {
	"en-US": {
		// ...components['en'],
		// system:system['en'],
		common: common["en-US"],
		page: page["en-US"],
		parser: parser["en-US"],
	},
	"zh_CN": {
		// ...components['zh_CN'],
		// system:system['zh_CN'],
		common: common["zh_CN"],
		page: page["zh_CN"],
		parser: parser["zh_CN"],
	},
	"zh-Hant": {
		// ...components['zh-Hant'],
		// system:system['zh-Hant'],
		common: common["zh-Hant"],
		page: page["zh-Hant"],
		parser: parser["zh-Hant"],
	},
};