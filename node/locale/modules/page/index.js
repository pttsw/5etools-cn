import { transferLangConfig } from '../../config.js'
import book from './book.js'
import enconterbuilder from './enconterbuilder.js'

// 公共部分
// const common = transferLangConfig({
//   "no-data": ['没有数据', '沒有數據', 'No Data'],
// })


export default {
  'zh_CN': {
    // ...common['zh_CN'],
    book: book['zh_CN'],
    enconterbuilder: enconterbuilder['zh_CN'],
  },
  'zh-Hant': {
    // ...common['zh-Hant'],
    book: book['zh-Hant'],
    enconterbuilder: enconterbuilder['zh-Hant'],
  },
  'en-US': {
    // ...common['en-US'],
    book: book['en-US'],
    enconterbuilder: enconterbuilder['en-US'],
  }
}

