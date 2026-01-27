"use strict";

const DefaultStyle = {
  h1: "[color=brown][size=6][b]$1[/b][/size][/color]",
  h2: "[color=brown][size=5][b]$1[/b][/size][/color]",
  h3: "[color=brown][size=4][b]$1[/b][/size][/color]",
  h4: "[color=brown][size=3]$1[/size][/color]",
  inlineCode: "$1",
  hr: "[font=;display:block;background-color:rgb(121,58,47);height:1px;margin-top:5px;margin-bottom:-12px][/font]",
  strike: "[s]$1[/s]",
  orderedListStart: "[list=1]",
  orderedListEnd: "[/list]",
  youtubeTag: "[youtube]$1[/youtube]",
  phpTag: "[php]$1[/php]",
  htmlTag: "[html]$1[/html]",
  supportsPhpTag: false,
  supportsHtmlTag: false,
  addNewLineParagraph: false,
  addNewLineHeader: false,
  addNewLineEndOfList: false,
  smartyPants: false,
  break: false
};


const Utils = {};



Utils.removeLeadingWhitespace= function (text) {
  return text.replace(/^\s+/gm, "");
};

Utils.removeTrailingWhitespace = function (text) {
  return text.replace(/\s+$/gm, "");
};

Utils.replaceNewLine = function (text, replaceValue) {
  return text.replace(/\n/gm, replaceValue);
}

Utils.replaceBreakCharacter = function (text, replaceValue) {
  return text.replace(/\x0B/gm, "\n")
};

const BREAK_CHAR = "\x0B";

let Converter = { style: DefaultStyle, renderer: {} };

Converter.renderer.heading = function (text, level) {
  if (level > 4) {
    level = 4; // i didn't define more than 4 headers levels
  }

  const header = Converter.style["h" + level.toString()];

  if (!header.includes("$1")) {
    return text + "\n\n";
  }

  let output = header.replace("$1", text) + "\n";

  if (Converter.style.addNewLineHeader) {
    output += "\n";
  }

  return output;
};

Converter.renderer.paragraph = function (text) {
  let output = text;

  // Do replacements to fix paragraphs with 2 spaces
  output = Utils.removeTrailingWhitespace(output);
  output = Utils.removeLeadingWhitespace(output);
  output = Utils.replaceNewLine(output, " ");
  output = Utils.replaceBreakCharacter(output, "\n");

  output += "\n";

  if (Converter.style.addNewLineParagraph) {
    output += "\n";
  }

  return output;
};

Converter.renderer.code = function (text, lang, escaped) {
  // Default tag if no lang is specified
  let codeTag = "[code]$1[/code]\n";

  if (lang === "html" && Converter.style.supportsHtmlTag) {
    codeTag = Converter.style.htmlTag;
  // Any lang will use php tags
  } else if (lang.length > 0 && Converter.style.supportsPhpTag) {
    codeTag = Converter.style.phpTag;
  }

  return codeTag.replace("$1", text);
};

Converter.renderer.blockquote = function (text) {
  let fmt = "[font=Courier New, monospace;display:block;margin-left:22px;width:480px;background-color: rgb(248, 248, 246);box-shadow:0px 0px 3px 0px #aaa;border:1px solid #d4d0ce;column-count:1;padding:15px;border-radius:8px;border:3px double rgb(139,137,136)]$1[/font]\n";
  return fmt.replace("$1", text);
};

Converter.renderer.hr = function () {
  return Converter.style.hr + "\n";
};

Converter.renderer.list = function (body, ordered, start) {
  let beginTag = "[list]";
  let closeTag = "[/list]";

  if (ordered) {
    beginTag = Converter.style.orderedListStart;
    closeTag = Converter.style.orderedListEnd;
  }

  // TODO add option to add extra line to fix formatting
  // in some websites that don't format properly
//   let fmt = beginTag + body + closeTag + "\n";
  let fmt = body + "\n";

  if (Converter.style.addNewLineEndOfList) {
    fmt += "\n";
  }

  return fmt;
};

Converter.renderer.listitem = function (text) {
  text = text.replace(/\n/gm, " ");  // Replace any new line with space
  text = text.replace(/\x0B/gm, "\n"); // Replace any break character \x0B
  return text + "\n";
};

Converter.renderer.checkbox = function (checked) {
  if (checked) {
    return "☑ ";
  } else {
    return "☐ ";
  }
};

Converter.renderer.strong = function (text) {
  return "[color=rgb(121,58,47)][b]" + text + "[/b][/color]";
};

Converter.renderer.em = function (text) {
  return "[i]" + text + "[/i]";
};

Converter.renderer.codespan = function (text) {
  return Converter.style.inlineCode.replace("$1", text);
};

Converter.renderer.br = function () {
  return BREAK_CHAR;
};

Converter.renderer.del = function (text) {
  let fmt = Converter.style.strike + "\n";

  return fmt.replace("$1", text);
};

Converter.renderer.link = function (href, title, text) {
  return `[url=${href}]${text}[/url]`;
};
Converter.renderer.image = function (href, title, text) {
  return "[img]" + href + "[/img]";
};

// 添加表格渲染支持 (使用嵌套font标签模拟表格)
// 行计数器，用于交替背景色
let tableRowCounter = 0;

Converter.renderer.table = function (header, body) {
  // 重置行计数器
  tableRowCounter = 0;
  // 合并表头和表体
  const tableContent = header + body;
  // 最外层表格容器
  return "[font=;display:table;width:100%;text-align:left;margin-top:5px;margin-bottom:-15px]" + tableContent + "[/font]\n";
};

Converter.renderer.tablerow = function (content) {
  // 增加行计数器
  tableRowCounter++;
  // 表格行，设置高度
  return "[font=;display:table-row;height:20px]" + content + "[/font]";
};

Converter.renderer.tablecell = function (content, flags) {
  // 根据行号和是否为表头选择背景色
  let bgColor = "";
  if (flags.header) {
    // 表头行背景色
    bgColor = "background-color:rgb(233,227,214);";
  } else {
    // 内容行交替背景色
    bgColor = tableRowCounter % 2 === 0 
      ? "background-color:rgb(216,208,201);" 
      : "background-color:rgb(210,214,206);";
  }
  
  // 表格单元格，默认宽度为33%
  return "[font=;display:table-cell;width:16.6%;" + bgColor + "padding:2px 2px 2px 5px;text-align:center]" + content + "[/font]";
};

class RendererBBCode {
	constructor () {
        // @ts-ignore
        marked.use({
            smartypants: DefaultStyle.smartypants,
            break: DefaultStyle.break,
            renderer: Converter.renderer
        });
	}
    renderBBCode (markdownInput) {


      // @ts-ignore
      let output = marked(markdownInput);
      return output;
    }
    static get () {
		return new RendererBBCode();
	}
}

globalThis.RendererBBCode = RendererBBCode;
