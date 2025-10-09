import { transferLangConfig } from "../../config.js";

const config = {
	// parser.js OPT_FEATURE_TYPE_TO_FULL
	"artificer_infusion": ["奇械师注法", "奇械師注法", "Artificer Infusion"],
	"elemental_discipline": ["法门", "", "Elemental Discipline"],
	"eldritch_invocation": ["魔能祈唤", "", "Eldritch Invocation"],
	"metamagic": ["超魔法", "", "Metamagic"],
	"maneuver": ["战技", "", "Maneuver"],
	"maneuver__battle_master": ["战技，战斗大师", "", "Maneuver, Battle Master"],
	"maneuver__cavalier": ["战技，骑兵", "", "Maneuver, Cavalier"],
	"arcane_shot": ["奥术射击", "奥术射击", "Arcane Shot"],
	"other": ["其他", "", "Other"],
	"fighting_style__fighter": ["战斗风格; 战士", "", "Fighting Style; Fighter"],
	"fighting_style__bard": ["战斗风格; 吟游诗人", "", "Fighting Style; Bard"],
	"fighting_style__paladin": ["战斗风格; 圣武士", "", "Fighting Style; Paladin"],
	"fighting_style__ranger": ["战斗风格; 游侠", "", "Fighting Style; Ranger"],
	"pact_boon": ["魔契恩泽", "", "Pact Boon"],
	"rune_knight_rune": ["符文骑士符文", "", "Rune Knight Rune"],
	"alchemical_formula": ["炼金配方", "", "Alchemical Formula"],
	"travelers_trick": ["旅者技艺", "", "Traveler's Trick"],
};

export default transferLangConfig(config);