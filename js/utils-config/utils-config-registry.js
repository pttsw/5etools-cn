import {ConfigSettingsGroup} from "./util-config-settings-group.js";
import {ConfigSettingBoolean, ConfigSettingEnum, ConfigSettingExternal} from "./utils-config-setting-base.js";
import {SITE_STYLE__CLASSIC, SITE_STYLE__ONE, SITE_STYLE_DISPLAY} from "../consts.js";
import {StyleSwitcher} from "../styleswitch.js";

const settingsGroupStyleSwitcher = new ConfigSettingsGroup({
	groupId: "styleSwitcher",
	name: I18nUtil.get("common.preferences.appearance"),
	configSettings: [
		new (
			class extends ConfigSettingExternal {
				_configId = "theme";
				_name = I18nUtil.get("common.preferences.theme");
				_help = "The color theme to be applied.";
				_isRowLabel = true;

				_getEleExternal () { return StyleSwitcher.getSelStyle(); }
			}
		)(),
		new ConfigSettingEnum({
			configId: "style",
			name: `<span>${I18nUtil.get("common.preferences.style")} <span class="ve-small">(see also: <a href="https://2014.5e.tools" rel="noopener noreferrer" target="_blank">2014.5e.tools</a>)</span></span>`,
			help: `The styling to be applied when rendering specific information (stat blocks, etc.). Does not affect what content is available, only how it is displayed. See also: https://2014.5e.tools.`,
			isRowLabel: true,
			isReloadRequired: true,
			default: SITE_STYLE__ONE,
			values: [
				SITE_STYLE__CLASSIC,
				SITE_STYLE__ONE,
			],
			fnDisplay: it => SITE_STYLE_DISPLAY[it] || it,
		}),
		new (
			class extends ConfigSettingExternal {
				_configId = "styleRollbox";
				_name = "Dice Roller Position";
				_help = "The position of the dice roller.";
				_isRowLabel = true;

				_getEleExternal () { return StyleSwitcher.getSelRollboxPosition(); }
			}
		)(),
		new (
			class extends ConfigSettingExternal {
				_configId = "isWideMode";
				_name = I18nUtil.get("common.preferences.wide_mode");
				_help = "This feature is unsupported. Expect bugs.";
				_isRowLabel = true;

				_getEleExternal () { return StyleSwitcher.getCbWide(); }
			}
		)(),
	],
});

const _MARKDOWN_TAG_RENDER_MODES = {
	"convertMarkdown": "转换为Markdown",
	"ignore": "保持原样",
	"convertText": "转换为文本",
};

const settingsGroupMarkdown = new ConfigSettingsGroup({
	groupId: "markdown",
	name: "Markdown",
	configSettings: [
		new ConfigSettingEnum({
			configId: "tagRenderMode",
			name: `Tag 处理方式(<code>@tag</code>)`,
			help: `对5etools中"@tag"格式的处理方法。`,
			isRowLabel: true,
			default: "convertMarkdown",
			values: [
				"convertMarkdown",
				"ignore",
				"convertText",
			],
			fnDisplay: it => _MARKDOWN_TAG_RENDER_MODES[it] || it,
		}),
		new ConfigSettingBoolean({
			configId: "isAddColumnBreaks",
			name: `添加 GM Binder 列间隔符 (<code>\\\\columnbreak</code>)`,
			help: `如果要求导出的Markdown包含列间隔符，则在会列间隔处添加"\\\\columnbreak"。`,
			isRowLabel: true,
			default: false,
		}),
		new ConfigSettingBoolean({
			configId: "isAddPageBreaks",
			name: `添加 GM Binder 页间隔符 (<code>\\\\pagebreak</code>)`,
			help: `如果要求导出的Markdown包含页间隔符，则在会页间隔处添加"\\\\pagebreak"。`,
			isRowLabel: true,
			default: false,
		}),
	],
});

export const SETTINGS_GROUPS = [
	settingsGroupStyleSwitcher,
	settingsGroupMarkdown,
];
