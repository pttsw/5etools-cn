import {LootGenGeneratorBase} from "./lootgen-generator-base.js";
import {LootGenOutputDragonMundaneItems} from "./lootgen-output.js";
import {LootGenRender} from "./lootgen-render.js";

export class LootGenGeneratorDragonHoard extends LootGenGeneratorBase {
	static _DRAGON_AGES = [
		I18nUtil.get("page.lootgen.wyrmling"),
		I18nUtil.get("page.lootgen.young"),
		I18nUtil.get("page.lootgen.adult"),
		I18nUtil.get("page.lootgen.ancient"),
	];

	identifier = "dragonHoard";

	render ({tabMeta}) {
		const selDragonAge = ComponentUiUtil.getSelEnum(
			this,
			"dh_dragonAge",
			{
				values: this.constructor._DRAGON_AGES,
			},
		);

		const cbIsPreferRandomMagicItems = ComponentUiUtil.getCbBool(this, "dh_isPreferRandomMagicItems");

		const btnRoll = ee`<button class="ve-btn ve-btn-default ve-btn-xs ve-mr-2">${I18nUtil.get("page.lootgen.roll_loot")}</button>`
			.onn("click", () => this._dh_pDoHandleClickRollLoot());

		const btnClear = ee`<button class="ve-btn ve-btn-danger ve-btn-xs">${I18nUtil.get("page.lootgen.clear_output")}</button>`
			.onn("click", () => this._outputManager.doClearOutput());

		ee`<div class="ve-flex-col ve-py-2 ve-px-3">
			<label class="ve-split-v-center ve-mb-2">
				<div class="ve-mr-2 ve-w-66 ve-no-shrink">${I18nUtil.get("page.lootgen.dragon_age")}</div>
				${selDragonAge}
			</label>

			<label class="ve-split-v-center ve-mb-3">
				<div class="ve-mr-2 ve-w-66 ve-no-shrink" title="If selected, random magic items (of a matching rarity and tier) will be preferred over rolling on the standard ${Parser.sourceJsonToAbv(Parser.SRC_DMG).qq()} &quot;Magic Items Table [A-I]&quot; when generating magic items.">${I18nUtil.get("page.lootgen.prefer_random_magic_items")}</div>
				${cbIsPreferRandomMagicItems}
			</label>

			<div class="ve-flex-v-center ve-mb-2">
				${btnRoll}
				${btnClear}
			</div>

			<hr class="ve-hr-3">

			<div class="ve-small ve-italic">${LootGenRender.er(`基于{@book 费资本的巨龙宝库|FTD|4|创建宝藏}第72页的表格和规则。`)}
		</div>`.appendTo(tabMeta.wrpTab);
	}

	async _dh_pDoHandleClickRollLoot () {
		const tableMeta = this._dataManager.getData().dragon.find(it => it.name === this._state.dh_dragonAge);

		const coins = this._stateManager.getConvertedCoins(
			Object.entries(tableMeta.coins || {})
				.mergeMap(([type, formula]) => ({[type]: Renderer.dice.parseRandomise2(formula)})),
		);

		const dragonMundaneItems = this._dh_doHandleClickRollLoot_mundaneItems({dragonMundaneItems: tableMeta.dragonMundaneItems});

		const gems = this._doHandleClickRollLoot_hoard_gemsArtObjectsMulti({row: tableMeta, prop: "gems"});
		const artObjects = this._doHandleClickRollLoot_hoard_gemsArtObjectsMulti({row: tableMeta, prop: "artObjects"});

		const magicItemsByTable = await this._doHandleClickRollLoot_hoard_pMagicItemsMulti({
			row: tableMeta,
			fnGetIsPreferAltChoose: () => !!this._state.dh_isPreferRandomMagicItems,
		});

		const lootOutput = new this._ClsLootGenOutput({
			type: `Dragon Hoard: ${this._state.dh_dragonAge}`,
			name: `${this._state.dh_dragonAge} ${I18nUtil.get("page.lootgen.dragon_hoard")}`,
			coins,
			gems,
			artObjects,
			dragonMundaneItems,
			magicItemsByTable,
		});
		this._outputManager.doAddOutput({lootOutput});
	}

	_dh_doHandleClickRollLoot_mundaneItems ({dragonMundaneItems}) {
		if (!dragonMundaneItems) return null;

		const count = Renderer.dice.parseRandomise2(dragonMundaneItems.amount);

		const breakdown = [];
		[...new Array(count)]
			.forEach(() => {
				const roll = RollerUtil.randomise(100);
				const result = this._dataManager.getData().dragonMundaneItems.find(it => roll >= it.min && roll <= it.max);
				breakdown.push(result.item);
			});

		return new LootGenOutputDragonMundaneItems({
			count: count,
			breakdown,
		});
	}

	_getDefaultState () {
		return {
			dh_dragonAge: "Wyrmling",
			dh_isPreferRandomMagicItems: false,
		};
	}
}