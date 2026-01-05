import fs from "fs";
import { languageList } from "./config.js";
import localeData from "./modules/index.js";

// uni-app 不支持多层JSON数据需要转换成单层 => "common.button.submit":"提交" 这样的形式
function transfSingleLayerJSON (data, fatherKey = "") {
	let tempObj = {};
	for (let key in data) {
		let prefix = `${fatherKey ? `${fatherKey}.` : ""}${key}`;
		if (typeof data[key] === "object") {
			Object.assign(tempObj, transfSingleLayerJSON(data[key], prefix));
		} else {
			tempObj[prefix] = data[key];
		}
	}
	return tempObj;
}

function transfProperties (data, fatherKey = "") {
	let tempObj = "";
	for (let key in data) {
		let prefix = `${fatherKey ? `${fatherKey}.` : ""}${key}`;
		if (typeof data[key] === "object") {
			tempObj += transfProperties(data[key], prefix);
		} else {
			tempObj += `${prefix}=${data[key]}\n`;
		}
	}
	return tempObj;
}
languageList.forEach(lang => {
	const tempLocale = transfSingleLayerJSON(localeData[lang]);
	fs.writeFileSync(`./languages/plu-${lang}.json`, JSON.stringify(tempLocale), "utf-8");
	const tempProperties = transfProperties(localeData[lang]);
	fs.writeFileSync(`./languages/${lang}.json`, JSON.stringify(localeData[lang]), "utf-8");
	fs.writeFileSync(`./languages/5e_${lang}.properties`, tempProperties, "utf-8");
});