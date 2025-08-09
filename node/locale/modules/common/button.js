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
  "hide": ['隐藏', '隱藏', 'Hide'],
  "show": ['显示', '顯示', 'Show'],
  "yes": ['是', '是', 'Yes'],
  "no": ['否', '否', 'No'],
  "update": ["更新", "更新", "Update"],
  "export": ["导出", "导出", "Export"],

  "get": ['获取', '獲取', 'Get'],
  "save_to_url": ['保存到URL', '保存到URL', 'Save to URL'],
  "save_to_file": ['保存到文件', '保存到文件', 'Save to File'],
  "load_from_file": ['从文件加载', '從文件加載', 'Load from File'],
  "load_from_url": ['从URL加载', '從URL加載', 'Load from URL'],
  "copy_as_text": ['复制为文本', '複製為文本', 'Copy as Text'],

  "browse_source_repository": ['浏览源仓库', '瀏覽源倉庫', 'Browse Source Repository'],
  "export_list_as_url": ['导出列表为URL', '導出列表為URL', 'Export List as URL'],
  "update_all": ['更新所有', '更新所有', 'Update All'],
  "delete_all": ['删除所有', '刪除所有', 'Delete All'],

  "mass": ["批处理", "批处理", "Mass"],
  "manage_contents": ["管理内容", "管理内容", "Manage Contents"],
  "view_contents": ["查看内容", "查看内容", "View Contents"],
  "view_json": ["查看JSON", "查看JSON", "View JSON"],

  "reroll": ["重骰", "重骰", "reroll"],
}

export default transferLangConfig(config)