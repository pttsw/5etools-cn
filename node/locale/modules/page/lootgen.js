import { transferLangConfig } from '../../config.js'

const config = {
    // lootgen-ui.js
    "magic_item_table_": ["魔法物品表", "", "Magic Item Table "],
    "arcana": ["奥术", "", "Arcana"],
    "armaments": ["军备", "", "Armaments"],
    "implements": ["法器", "", "Implements"],
    "relics": ["遗物", "", "Relics"],
    "common": ["常见", "", "Common"],
    "uncommon": ["罕见", "", "Uncommon"],
    "rare": ["稀有", "", "Rare"],
    "very_rare": ["非常稀有", "", "Very Rare"],
    "legendary": ["传说", "", "Legendary"],

    "roll_loot": ["生成战利品", "", "Roll Loot"],
    "clear_output": ["清除输出", "", "Clear Output"],
    "individual_treasure": ["个人宝藏", "", "Individual Treasure"],
    //tabs
    "adventure_rewards_by_cr": ["按CR生成冒险奖励", "", "Adventure Rewards by CR"],
    "random_treasure_by_cr": ["按CR随机生成", "", "Random Treasure by CR"],
    "challenge_rating": ["挑战等级", "", "Challenge Rating"],
    "is_treasure_hoard": ["是库藏宝藏？", "", "Is Treasure Hoard?"],
    "treasure_hoard": ["库藏宝藏", "", "Treasure Hoard"],
    "character_level": ["角色等级", "", "Character Level"],
    "hoard": ["宝藏", "", "Hoard"],
    "magic_items": ["魔法物品", "", "Magic Items"],

    "loot_tables": ["战利品表", "", "Loot Tables"],
    "party_loot": ["队伍战利品", "", "Party Loot"],
    "dragon_hoard": ["龙之宝藏", "", "Dragon Hoard"],
    "dragon_age": ["龙之纪元", "", "Dragon Age"],
    "wyrmling": ["雏龙", "", "Wyrmling"],
    "young": ["青年", "", "Young"],
    "adult": ["成年", "", "Adult"],
    "ancient": ["远古", "", "Ancient"],
    "prefer_random_magic_items": ["优先随机魔法物品", "", "Prefer Random Magic Items"],

    "gems_art_objects": ["宝石与艺术品", "", "Gems/Art Objects"],
    "gems_art_objects_generator": ["宝石与艺术品生成器", "", "Gems/Art Objects Generator"],
    "include_gems": ["包含宝石", "", "Include Gems"],
    "include_art_objects": ["包含艺术品", "", "Include Art Objects"],
    "target_gold_amount": ["目标金币数量", "", "Target Gold Amount"],
    "roughly": ["大致", "", "Roughly"],
    "gemstones": ["宝石", "", "gemstones"],
    "art_objects": ["艺术品", "", "art objects"],
}

export default transferLangConfig(config)