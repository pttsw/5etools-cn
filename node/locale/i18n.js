import i18n from "i18n";

globalThis.I18nUtil = {};

I18nUtil.LANGUAGES_INDEX = "zh_CN";

const targetLanguage = I18nUtil.LANGUAGES_INDEX;

i18n.configure({
	locales: ["en-US", "zh_CN", "zh-Hant"],
	directory: "./languages",
	defaultLocale: targetLanguage,
	objectNotation: true,
});
I18nUtil.get = (key) => {
	try {
		if (!key) {
			return "";
		}
		if (i18n && i18n.__) {
			return i18n.__(key);
		}
		return key;
	} catch (error) {
		console.error(error);
		return key;
	}
};