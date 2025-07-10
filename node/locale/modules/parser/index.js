import { transferLangConfig } from '../../config.js'
import source from './source.js'

// 公共部分
// const common = transferLangConfig({
//   "no-data": ['没有数据', '沒有數據', 'No Data'],
// })


export default {
  'zh_CN': {
    // ...common['zh_CN'],
    source: source['zh_CN'],
  },
  'zh-Hant': {
    // ...common['zh-Hant'],
    source: source['zh-Hant'],
  },
  'en-US': {
    // ...common['en-US'],
    source: source['en-US'],
  }
}