import { I18n } from "i18n";
import {PageGeneratorManagerBase} from "./generate-pages-page-generator.js";

class _PageGeneratorManagebrew extends PageGeneratorManagerBase {
	_page = "managebrew.html";

	_pageTitle = "管理自制内容";
	_navbarDescription = "查看、新增、删除自制内容。";

	_scriptsModules = [
		"manageexternal/manageexternal-utils.js",
		"managebrew.js",
	];
}

class _PageGeneratorManageprerelease extends PageGeneratorManagerBase {
	_page = "manageprerelease.html";

	_pageTitle = I18nUtil.get("page.manageprelease.manage_prerelease_content");
	_navbarDescription = I18nUtil.get("page.manageprelease.manage_prerelease_content_subtitle");

	_scriptsModules = [
		"manageexternal/manageexternal-utils.js",
		"manageprerelease.js",
	];
}

export const PAGE_GENERATORS_MANAGER = [
	new _PageGeneratorManagebrew(),
	new _PageGeneratorManageprerelease(),
];
