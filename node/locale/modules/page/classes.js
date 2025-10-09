import { transferLangConfig } from "../../config.js";

const config = {
	// render-class.js

	"hit_points_at_first_level": ["1级时的生命值", "1級時的生命值", "Hit Points at 1st Level"],
	"hit_points_at_higher_levels": ["更高等级时的生命值", "更高等級時的生命值", "Hit Points at Higher Levels"],

	"proficiencies": ["熟练项", "熟練項", "Proficiencies"],
	"armor": ["护甲", "甲體", "Armor"],
	"weapons": ["武器", "武器", "Weapons"],
	"tools": ["工具", "工具", "Tools"],
	"skills": ["技能", "技能", "Skills"],

	// filter-classes.js
	"class_feature_options_variants": ["职业特性选项/变体", "職業特徵選項/變體", "Class Feature Options/Variants"],
	"display_class_if_any_subclass_is_visible": ["如果任意子职可见，则显示主职业", "如果任意子職可見，則顯示主職業", "Display Class if Any Subclass is Visible"],
};

export default transferLangConfig(config);