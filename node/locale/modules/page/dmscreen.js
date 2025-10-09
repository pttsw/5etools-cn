import { transferLangConfig } from "../../config.js";

const config = {
	// js/dmscreen.js
	"embed": ["嵌入", "", "Embed"],
	"paste_image_url": ["粘贴图片URL", "", "Paste image URL"],
	"paste_youtube_url": ["粘贴YouTube URL", "", "Paste YouTube URL"],
	"paste_twitch_url": ["粘贴推特URL", "", "Paste Twitch URL"],
	"paste_any_url": ["粘贴任意URL", "", "Paste any URL"],

	"initiative_tracker": ["先攻追踪器", "", "Initiative Tracker"],
	// dmscreen-initiativetracker-rowsactive.js
	"creature_status": ["生物/状态", "", "Creature/Status"],
	"initiative_score": ["先攻值", "", "Initiative Score"],
	"add_contition": ["添加状态", "", "Add Condition"],
	"shown_in_player_view": ["玩家视图中显示", "", "Shown in player view"],
	"hidden_in_player_view": ["玩家视图中隐藏", "", "Hidden in player view"],
	"shift_to_delete_similar": ["按住SHIFT删除相似的", "", "SHIFT to Also Delete Similar"],

	// dmscreen-initiativetracker.js
	"add_player": ["添加玩家", "", "Add Player"],
	"add_creature": ["添加生物", "", "Add Creature"],
	"previous_turn": ["上一回合", "", "Previous Turn"],
	"next_turn": ["下一回合", "", "Next Turn"],
	"round": ["回合", "", "Round"],
	"sort_alphabetically": ["按字母排序", "", "Sort Alphabetically"],
	"sort_numerically": ["按先攻值排序", "", "Sort Numerically"],
	"player_view": ["玩家视图", "", "Player View"],
	"shift_to_open_standard_view": ["按住SHIFT打开标准视图", "", "SHIFT to Open &quot;Standard&quot; View"],
	"lock_tracker": ["锁定追踪器", "", "Lock Tracker"],
	"unlock_tracker": ["解锁追踪器", "", "Unlock Tracker"],
	"shift_to_open_settings": ["按住SHIFT打开设置", "", "SHIFT to Open &quot;Settings&quot;"],
	"import_encounter_from_the_bestiary": ["从怪物图鉴导入遭遇", "", "Import an encounter from the Bestiary"],
	"reset_tracker": ["重置追踪器", "", "Reset Tracker"],
};

export default transferLangConfig(config);