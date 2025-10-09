export const languageList = ["zh_CN", "zh-Hant", "en-US"];

// 创建一个空i18n对象
const createEmptyLangConfig = () => Object.fromEntries(new Map(languageList.map(key => [key, {}])));

// 配置文件转i18n对象
export const transferLangConfig = (data) => {
	const langConfig = createEmptyLangConfig();
	for (const key in data) {
		languageList.forEach((lang, index) => {
			langConfig[lang][key] = data[key][index];
		});
	}
	return langConfig;
};