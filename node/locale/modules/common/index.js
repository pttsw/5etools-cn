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

  "source": ['来源', '來源', 'Source'],
  "type":['类型', '類型', 'Type'],
  "author": ['作者', '作者', 'Author'],
  "authors": ['作者', '作者', 'Authors'],
  "origin": ['资源', '资源', 'Origin'],
  "any": ['任意', '任意', 'Any'],

  "until": ['直到', '直到', 'Until'],
  "or": ['或', '或', 'or'],
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