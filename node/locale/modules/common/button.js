import { transferLangConfig } from '../../config.js'

const config = {
  // 通用部分
  "save": ['保存', '保存', 'Save'],
  "search": ['搜索', '檢索', 'Search'],
  "reset": ['重置', '重置', 'Reset'],
  "clear": ['清空', '清空', 'Clear'],
  "add": ['新增', '新增', 'Add'],
  "confirm": ['确认', '確認', 'Confirm'],
  "select": ['选择', '選擇', 'Select'],
  "delete": ['删除', '刪除', 'Delete'],
  "cancel": ['取消', '取消', 'Cancel'],
  "remove": ['移除', '移除', 'Remove'],
  "yes": ['是', '是', 'Yes'],
  "no": ['否', '否', 'No'],

  "save_to_url": ['保存到URL', '保存到URL', 'Save to URL'],
  "save_to_file": ['保存到文件', '保存到文件', 'Save to File'],
  "load_from_file": ['从文件加载', '從文件加載', 'Load from File'],
  "copy_as_text": ['复制为文本', '複製為文本', 'Copy as Text'],
}

export default transferLangConfig(config)