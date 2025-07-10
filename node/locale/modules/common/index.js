import { transferLangConfig } from '../../config.js'
import button from './button.js'
import tabs from './tabs.js'

// 公共部分
const common = transferLangConfig({
  "no-data": ['没有数据', '沒有數據', 'No Data'],
})


export default {
  'zh_CN': {
    ...common['zh_CN'],
    button: button['zh_CN'],
    tabs: tabs['zh_CN'],
  },
  'zh-Hant': {
    ...common['zh-Hant'],
    button: button['zh-Hant'],
    tabs: tabs['zh-Hant'],
  },
  'en-US': {
    ...common['en-US'],
    button: button['en-US'],
    tabs: tabs['en-US'],
  }
}