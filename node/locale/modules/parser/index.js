import { transferLangConfig } from '../../config.js'
import source from './source.js'

// 公共部分
const common = transferLangConfig({
// Parser.RULE_TYPE_TO_FULL
  "core":['核心','核心','Core'],
  "optional":['可选','可選','Optional'],
  "prerelease":['预发布','預發布','Prerelease'],
  "variant":['变体','變體','Variant'],
  "variant_optional":['变体可选','變體可選','Variant Optional'],
  "variant_variant":['变体变体','變體變體','Variant Variant'],
  "unknown":['未知','未知','Unknown'],
})


export default {
  'zh_CN': {
    ...common['zh_CN'],
    source: source['zh_CN'],
  },
  'zh-Hant': {
    ...common['zh-Hant'],
    source: source['zh-Hant'],
  },
  'en-US': {
    ...common['en-US'],
    source: source['en-US'],
  }
}