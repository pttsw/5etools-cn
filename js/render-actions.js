"use strict";

class RenderActions {
	static $getRenderedAction (it) {
		return $$`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getExcludedTr({entity: it, dataProp: "action"})}
		${Renderer.utils.getNameTr(it, {page: UrlUtil.PG_ACTIONS})}
		<tr><td colspan="6" class="py-0"><div class="ve-tbl-divider"></div></td></tr>
		<tr><td colspan="6">
		${Renderer.get().setFirstSection(true).render({entries: it.entries})}
		${it.fromVariant ? `<div>${Renderer.get().render(`{@note 这个动作是一个可选规则，参见“可选/变体规则” {@variantrule ${it.fromVariant}}。}`)}</div>` : ""}
		${it.seeAlsoAction ? `<div>${Renderer.get().render(`{@note 另请参见： ${it.seeAlsoAction.map(it => `{@action ${it}}`).join(", ")}.}`)}</div>` : ""}
		</td></tr>
		${Renderer.utils.getPageTr(it)}
		${Renderer.utils.getBorderTr()}
		`;
	}
}
