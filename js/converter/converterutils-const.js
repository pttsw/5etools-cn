export class ConverterConst {
	static STR_RE_DAMAGE_TYPE = `(${Parser.DMG_TYPES.map(it => it.toTitleCase()).join("|")})`;
	static RE_DAMAGE_TYPE = new RegExp(`\\b${ConverterConst.STR_RE_DAMAGE_TYPE}\\b`, "gi");
	static STR_RE_CLASS = `(?<name>artificer|barbarian|bard|cleric|druid|fighter|monk|paladin|ranger|rogue|sorcerer|warlock|wizard)`;
	static STR_RE_CLASS_CN = `(?<name>奇械师|野蛮人|吟游诗人|牧师|德鲁伊|战士|武僧|圣武士|游侠|游荡者|术士|魔契师|法师)`;
}
