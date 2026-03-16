import {ConverterUiBase} from "./converter-ui-base.js";
import {ConverterUiUtil} from "./converter-ui-utils.js";
import {ConverterCreature} from "./converter-creature.js";

export class CreatureConverterUi extends ConverterUiBase {
	constructor ({ui, converterData}) {
		super(
			{
				ui,
				converterData,

				name: "生物",
				converterId: "monster",
				canSaveLocal: true,
				modes: ["txt", "md"],
				hasPageNumbers: true,
				titleCaseFields: ["name"],
				hasSource: true,
				prop: "monster",
			},
		);
	}

	_renderSidebar (parent, wrpSidebar) {
		wrpSidebar.empty();

		ee`<div class="ve-w-100 ve-split-v-center">
			<small>这个转换器对文本格式的要求<span class="ve-help" title="It is notably poor at handling text split across multiple lines, as Carriage Return is used to separate blocks of text.">非常严格！</span> 请确保输入的文本符合要求，如果遇到任何问题请联系管理员（不保证修好啊！）。</small>
		</div>`.appendTo(wrpSidebar);

		ConverterUiUtil.renderSideMenuDivider(wrpSidebar);
	}

	handleParse (input, cbOutput, cbWarning, isAppend) {
		const opts = this._handleParse_getOpts({cbOutput, cbWarning, isAppend});

		switch (this._state.mode) {
			case "txt": return ConverterCreature.doParseText(input, opts);
			case "md": return ConverterCreature.doParseMarkdown(input, opts);
			default: throw new Error(`Unimplemented!`);
		}
	}
}
