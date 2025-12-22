# 读取json，并根据adventureData.data字段中的内容生成目录到adventure.content，并自动将adventureData中的段落添加id
import json
import os
import re

def generate_adventure_menu(json_file_path, output_dir):
    # 读取JSON文件
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 确保output_dir存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 处理每个adventureData条目
    for adventure_data in data.get('adventureData', []):
        adventure_id = adventure_data.get('id')
        
        # 找到对应的adventure条目
        for adventure in data.get('adventure', []):
            if adventure.get('id') == adventure_id:
                # 生成content
                contents = []
                for section in adventure_data.get('data', []):
                    if section.get('type') == 'section':
                        content_entry = {
                            "type": "section",
                            "name": section.get('name')
                        }
                        
                        # 收集headers（二级标题）
                        headers = []
                        for entry in section.get('entries', []):
                            if isinstance(entry, dict) and entry.get('type') == 'section':
                                headers.append(entry.get('name'))
                        
                        if headers:
                            content_entry["headers"] = headers
                        
                        contents.append(content_entry)
                
                # 更新adventure的content字段
                adventure["adventure"][0]["content"] = contents
        
        # 为adventureData中的段落添加id
        section_counter = 0
        
        def process_entries(entries, parent_id=""):
            nonlocal section_counter
            for entry in entries:
                if isinstance(entry, dict):
                    if entry.get('type') == 'section':
                        # 为section添加id
                        entry['id'] = f"{section_counter:03x}"
                        section_counter += 1
                    
                    # 递归处理子entries
                    if 'entries' in entry:
                        process_entries(entry['entries'], entry.get('id', parent_id))
        
        # 处理每个adventureData的data字段
        for section in adventure_data.get('data', []):
            if 'entries' in section:
                process_entries(section['entries'])
    
    # 保存修改后的JSON文件
    output_file_path = os.path.join(output_dir, os.path.basename(json_file_path))
    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"处理完成，结果保存在: {output_file_path}")

# 示例用法
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("用法: python adventure_menu.py <输入JSON文件路径> <输出目录>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    generate_adventure_menu(input_file, output_dir)