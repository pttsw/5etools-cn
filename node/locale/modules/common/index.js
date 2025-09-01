import { transferLangConfig } from '../../config.js'
import button from './button.js'
import tabs from './tabs.js'
import filter from './filter.js'
import preferences from './preferences.js'

// 公共部分
const common = transferLangConfig({
  "no-data": ['没有数据', '沒有數據', 'No Data'],
  "feat": ["专长", "专长", "Feat"],
  "background":['背景','背景', 'Background'],
  "species":['种族','种族', 'Species'],
  "creature":['生物','生物', 'Creature'],

  "source": ['来源', '來源', 'Source'],
  "type":['类型', '類型', 'Type'],
  "author": ['作者', '作者', 'Author'],
  "authors": ['作者', '作者', 'Authors'],
  "origin": ['资源', '资源', 'Origin'],
  "any": ['任意', '任意', 'Any'],
  "name": ['名称', '名稱', 'Name'],
  "until": ['直到', '直到', 'Until'],
  "or": ['或', '或', 'or'],
  
  "hit_points":["生命值","生命值","Hit Points"],
  "hit_dice":["生命骰","生命骰","Hit Dice"],
  "armor_class":["护甲等级","护甲等级","Armor Class"],
  "speed": ["移动速度", "移动速度", "Speed"],
  "proficiency_bonus": ["熟练度加值", "熟练度加值", "Proficiency Bonus"],
  "challenge_rating": ["挑战等级", "", "Challenge Rating"],
  "challenge": ["挑战", "挑战", "Challenge"],
  "spell_level": ["法术环阶", "法术环阶", "Spell Level"],
  "skills": ["技能", "技能", "Skills"],
  "senses": ["感官", "感官", "Senses"],
  "languages": ["语言", "语言", "Languages"],
  "actions": ["动作", "动作", "Actions"],
  "saving_throws":["豁免骰","豁免骰","Saving Throws"],
  "saving_throw":["豁免骰","豁免骰","Saving Throw"],


})


export default {
  'zh_CN': {
    ...common['zh_CN'],
    button: button['zh_CN'],
    tabs: tabs['zh_CN'],
    filter: filter['zh_CN'],
    preferences: preferences['zh_CN'],
  },
  'zh-Hant': {
    ...common['zh-Hant'],
    button: button['zh-Hant'],
    tabs: tabs['zh-Hant'],
    filter: filter['zh-Hant'],
    preferences: preferences['zh-Hant'],
  },
  'en-US': {
    ...common['en-US'],
    button: button['en-US'],
    tabs: tabs['en-US'],
    filter: filter['en-US'],
    preferences: preferences['en-US'],
  }
}