import { transferLangConfig } from '../../config.js'
import book from './book.js'
import enconterbuilder from './enconterbuilder.js'
import backgrounds from './backgrounds.js'
import feats from './feats.js'
import charcreationoptions from './charcreationoptions.js'
import optionalfeatures from './optionalfeatures.js'
import statgen from './statgen.js'
import lootgen from './lootgen.js'
import manageprelease from './manageprelease.js'
import makebrew from './makebrew.js'

// 公共部分
// const common = transferLangConfig({
//   "no-data": ['没有数据', '沒有數據', 'No Data'],
// })


export default {
  'zh_CN': {
    // ...common['zh_CN'],
    book: book['zh_CN'],
    enconterbuilder: enconterbuilder['zh_CN'],
    backgrounds: backgrounds['zh_CN'],
    feats: feats['zh_CN'],
    charcreationoptions: charcreationoptions['zh_CN'],
    optionalfeatures: optionalfeatures['zh_CN'],
    statgen: statgen['zh_CN'],
    lootgen: lootgen['zh_CN'],
    manageprelease: manageprelease['zh_CN'],
    makebrew: makebrew['zh_CN'],
  },
  'zh-Hant': {
    // ...common['zh-Hant'],
    book: book['zh-Hant'],
    enconterbuilder: enconterbuilder['zh-Hant'],
    backgrounds: backgrounds['zh-Hant'],
    feats: feats['zh-Hant'],
    charcreationoptions: charcreationoptions['zh-Hant'],
    optionalfeatures: optionalfeatures['zh-Hant'],
    statgen: statgen['zh-Hant'],
    lootgen: lootgen['zh-Hant'],
    manageprelease: manageprelease['zh-Hant'],
    makebrew: makebrew['zh-Hant'],
  },
  'en-US': {
    // ...common['en-US'],
    book: book['en-US'],
    enconterbuilder: enconterbuilder['en-US'],
    backgrounds: backgrounds['en-US'],
    feats: feats['en-US'],
    charcreationoptions: charcreationoptions['en-US'],
    optionalfeatures: optionalfeatures['en-US'],
    statgen: statgen['en-US'],
    lootgen: lootgen['en-US'],
    manageprelease: manageprelease['en-US'],
    makebrew: makebrew['en-US'],
  }
}

