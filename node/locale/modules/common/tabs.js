import { transferLangConfig } from "../../config.js";

const config = {
	// Tab Names
	"stat_block": ["数据卡", "数据卡", "Stat Block"],
	"info": ["信息", "信息", "Info"],
	"images": ["图片", "圖片", "Images"],
	"data": ["数据", "數據", "Data"],
	"markdown": ["Markdown", "Markdown", "Markdown"],

	// Tab Contents
	"no_info": ["没有可用的信息。", "没有可用的信息。", "No information available."],
	"no_image": ["没有可用的图片。", "没有可用的图片。", "No images available"],
};

export default transferLangConfig(config);