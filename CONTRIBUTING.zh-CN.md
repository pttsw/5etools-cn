# 贡献指南

<a href="CONTRIBUTING.md">English</a> | 中文

## 自制内容

自制内容的贡献（转换、原创内容）应在[自制内容仓库](https://github.com/tjliqy/homebrew/)中进行。更多信息请参阅该仓库的指南。

## 错别字修正等

小的修正和调整，尤其是错别字，请在 [QQ 群 910127185](https://qm.qq.com/cgi-bin/qm/qr?k=zo7jw88cLsqp2hAkK3ssn_kEbtvy8vu4&jump_from=webapi&authKey=yyG97ItP+M1BGl171cFJ+vzAmHZGRMdvKompSckZjpj8gYcCUV/3efeHvaD3850/) 中说明。如果你不使用 QQ，也可以在 GitHub 上提交 issue。

## 功能请求与新功能

所有功能请求也请通过 [QQ 群 910127185](https://qm.qq.com/cgi-bin/qm/qr?k=zo7jw88cLsqp2hAkK3ssn_kEbtvy8vu4&jump_from=webapi&authKey=yyG97ItP+M1BGl171cFJ+vzAmHZGRMdvKompSckZjpj8gYcCUV/3efeHvaD3850/) 中说明。如果你不使用 QQ，也可以在 GitHub 上提交 issue。

如果你希望直接贡献代码实现新功能，请先通过 [QQ 群 910127185](https://qm.qq.com/cgi-bin/qm/qr?k=zo7jw88cLsqp2hAkK3ssn_kEbtvy8vu4&jump_from=webapi&authKey=yyG97ItP+M1BGl171cFJ+vzAmHZGRMdvKompSckZjpj8gYcCUV/3efeHvaD3850/) 联系我们。如果该功能被认可，且足够独立/复杂以至于适合由第三方来完成，则可以在 GitHub 上提交 Pull Request。

请注意以下几点：

- 会给项目带来额外长期维护负担的功能不会被接受。
- 严重偏离 D&D 5e 正统设定的功能（例如复杂的自定义随机生成器、对系统分支或大量自制内容的支持）不会被接受。

## Bug 报告

Bug 也请通过 [QQ 群 910127185](https://qm.qq.com/cgi-bin/qm/qr?k=zo7jw88cLsqp2hAkK3ssn_kEbtvy8vu4&jump_from=webapi&authKey=yyG97ItP+M1BGl171cFJ+vzAmHZGRMdvKompSckZjpj8gYcCUV/3efeHvaD3850/) 中说明。如果你不使用 QQ，也可以在 GitHub 上提交 issue。

---

## 开发者须知

### 数据来源与版本控制

网站仅收录"官方"（即由 WotC 出版的）数据。其他内容应添加到自制内容仓库。此规则的一些例外情况：

- 所有冒险者联盟（AL）专属内容应保留在自制内容仓库中。虽然其中大部分内容属于"WotC 出版"范畴，但也有不少不属于。为了保持一致性/整洁性，所有 AL 内容均视为自制内容。
- 在 Dragon+ 杂志上发布的任何内容。
- 被本仓库维护者否决的任何内容。

优先遵循 RAW（Rules As Written）。目标是提供原始数据的 1:1 副本。明显的错别字（例如生物属性块中的数学错误）可由维护者酌情修正。

尽量使用最新版本的出版材料。差异足够大且与社区兴趣相关的旧版本可移至自制内容仓库。

实体的主要来源应为其首次发布的来源。此规则的例外情况包括：

- 实体最初以"部分"或"预发布"形式发布。例如，WGE 中的种族后来在 ERLW 中重新发布。
- 实体最初在已出版的冒险模组中发布，但后来在通用补充材料中重新印刷。例如，OotA 中的恶魔领主在 MTF 中重新印刷，CoS 中的"闹鬼者"背景在 VRGR 中重新印刷。

#### 特定页面说明

*语言页面。* 由于语言数据没有明确定义的 RAW 格式，语言页面从多个分散的位置收集信息。应参考的来源优先级列表为：

- PHB 第 123 页的"语言"部分
- 官方来源，按以下顺序：
  - PHB > (DMG) > MM
  - 其他"官方"（即已出版的）产品，按出版日期排序
  - "非官方"产品（即 Unearthed Arcana; Plane Shift），按出版日期排序

在此排序中，应进行以下优先级划分：

- 直接引用或描述语言的文本，按产品中首次出现的顺序（例如，如果某种语言在书中第 2 页和第 10 页被提及，则第 2 页的内容应作为主要来源）
- 供玩家使用的文本（例如德鲁伊职业的"德鲁伊语"特性）（其文本可能需要调整以适应参考格式；例如将"你可以理解……"改为"X 语言的使用者可以理解……"）。

*怪物图鉴。* "亚种族"风格的生物类型标签通常应隐藏。例如，一个"卓尔精灵**刺客**"NPC 的类型应为"人形生物（精灵）"，而非"人形生物（卓尔精灵）"。这与大多数来源中属性块的常见呈现方式一致。

示例包括：

- 卓尔精英战士（MM，第 128 页；'14 规则）
- 罗丝的卓尔精英战士（FRAiF，第 260 页；'24 规则）

例外情况包括：

- 来自旧冒险模组的 NPC；
  - Dralmorrer Borngray（HotDQ，第 90 页；'14 规则）——类型为"人形生物（高等精灵）"（注意非标准的连字符"-"）
  - Drannin Splithelm（PotA，第 209 页；'14 规则）——类型为"人形生物（盾矮人）"
  - SKT"特殊 NPC"附录中供玩家使用的 NPC（SKT，第 247-256 页；'14 规则）
  - CRCotN 中的"冒险竞争对手"（CRCotN，第 188-194 页；'14 规则）

### 目标 JavaScript 版本

任何在主流 Chrome 和主流 Firefox 中均已可用，且已可用至少六个月的语言特性均可使用。

### 代码风格指南

#### 代码

- 使用制表符（Tab）而非空格。

#### CSS

- 尽可能使用 [BEM](http://getbem.com/)（"Block Element Modifier"）命名策略。

#### 数据/文本

- JSON 格式应匹配 JavaScript `JSON.stringify` 的默认输出（使用制表符缩进），即每个括号一行，每个值一行。但从其他 JSON 文件程序化生成的 JSON 文件（即存储在 `data/generated` 中的文件）应进行压缩。

- 在数据中标记引用时（例如 `{@creature goblin}`），以下规则适用：
  - 仅标记_预期作为引用_的内容。例如，`You gain one cantrip of your choice from the wizard spell list` 中的 Wizard 职业应被标记，而 `Together, a group of seven powerful wizards sought to contain the demon` 中的 Wizard 不应被标记。一个是对机械职业的引用，另一个只是"巫师"一词的普通用法。
  - 同样，永远不要在 `quote` 类型的块中标记任何内容。即使引文直接引用了特定生物，我们可以假设引文来自一个不存在（例如）属性块的宇宙/视角，因此应省略标记以保持引文的风味。
  - 在来源的数据中，避免引用在该来源出版之后才出版的来源中的内容。例如，MTF 内容可以引用 SCAG 中的神祇，但 SCAG 中的神祇应避免引用 MTF 中的内容。

- 通过"UID"（通常是由"|"连接的字符串序列）引用实体时，应遵循以下大小写约定：
  - 作为可渲染条目中 `{@tag ...}` 的一部分：
    - 显示名称根据文本需要确定大小写（即匹配原始文档）。例如：`{@spell Fireball|PHB|This is fireball display text, with Mixed Casing.}`。
    - 如果同时使用了显示名称，则名称使用标题大小写；如果未使用显示名称，则根据文本需要确定大小写。例如：`The golbin casts {@spell fireball|PHB}`。
    - 来源标识符的大小写应与其定义匹配。例如：`{@spell Fireball|PHB}`；`{@spell Iceball|MyHomebrewSource}`。
  - 作为数据中独立的 UID：全部小写。例如：`{"additionalSpells": [{"innate": {"3": [ "fireball|phb" ]}}]}`；`{"startingEquipment": [{"a": [ "dagger|phb" ]}]}`

### `_copy` 实体的收录

仅应在机制上有显著差异或拥有独特美术作品的实体才应作为 `_copy` 收录。

例如，对于生物（`"monster"`）：

单独不足以构成收录条件（但如果要创建 `_copy` 则应应用）：

- 体型
- 生物类型
- 阵营
- 生命值

单独足以构成收录条件：

- 获得/失去特性；动作
- 获得/失去施法能力
- 伤害类型的变更
- 免疫、抗性等
- 独特的官方美术/代币
- 等等

### JSON 清理

#### 尾随逗号

移除 JSON 中的尾随逗号：

查找：`(.*?)(,)(:?\s*]|\s*})`

替换：`$1$3`

#### 字符替换

- `'` 应替换为 `'`
- `"` 和 `"` 应替换为 `"`
- `—`（破折号）应替换为 `\u2014`（破折号的 Unicode）
- `–` 应替换为 `\u2013`（半角破折号的 Unicode）
- `−` 应替换为 `\u2212`（减号的 Unicode）
- `•` 不应使用，除非相关 JSON 尚未被 entryRenderer 覆盖，即应编码为列表
- 唯一允许的 Unicode 转义序列是 `\u2014`、`\u2013` 和 `\u2212`；所有其他字符（除非上述提及）应按原样存储

#### 破折号约定

- `-`（连字符）**仅**用于连字符连接词语，例如 `60-foot` 和 `18th-level`
- `\u2014` 用于括号对中的破折号，或用于标记空表格行。
- `\u2013` 用于连接数值范围，例如 `1-5` 应改为 `1–5`。
- `\u2212` 用于一元减号，即惩罚情况。例如，`"You have a -5 penalty to..."` 应改为 `"You have a −5 penalty to..."`。
- `—` 两侧的任何空白字符应移除

#### 度量约定

- 形容词：使用连字符和完整的度量单位名称，例如龙吐出一条 `60-foot line`（60 英尺线形）
- 名词：使用空格和度量单位缩写（包括尾随句点），例如 `blindsight 60 ft.`、`darkvision 120 ft.`
- 时间：使用斜杠 `/`，两侧无空格，后跟大写的时间单位，例如 `2/Turn`、`3/Day`

#### 骰子约定

骰子应写作 `[X]dY[ <+|−|×> Z]`，即骰子和运算符之间有空格，运算符和修正值之间有空格。可接受的格式示例：`d6`、`2d6` 或 `2d6 + 1`。

#### 物品名称约定

物品名称应使用标题大小写，但括号中的单位除外，应使用句子大小写。体积或数量由容器指定的物品（例如 `(vial)`）将容器视为单位。

### 鼠标/键盘事件

避免绑定 ALT 修饰事件，因为在 MacOS 或各种 Linux 发行版下不可用。优先绑定 SHIFT-/CTRL-修饰事件。

### 开发服务器

运行 `npm run serve:dev` 启动本地开发服务器，在 [`http://localhost:5050/index.html`](http://localhost:5050/index.html) 上提供项目文件。

### 版本号更新

运行 `npm run version-bump -- [选项]`，其中 `[选项]` 为以下之一：

- `major` 递增主版本号（`1.2.3` 将变为 `2.0.0`）
- `minor` 递增次版本号（`1.2.3` 将变为 `1.3.0`）
- `patch` 递增修订版本号（`1.2.3` 将变为 `1.2.4`）
- 版本号（如 `1.2.3`）

它会先运行测试，如果测试失败则不会递增版本号。
然后会自动替换需要替换的文件中的版本号，创建提交信息为 `chore(version): bump` 的提交，并在该提交处创建标签（格式为 `v1.2.3`）。
可以通过运行 `npm config set git-tag-version false` 轻松禁用此功能。

### Service Worker

Service Worker——添加客户端网络缓存层，提升性能并支持离线使用——未提交到仓库中，因此需要（可选地）在本地构建。可以使用以下命令：

- `npm run build:sw`，构建开发版本，输出有用的日志信息
- `npm run build:sw:prod`，构建生产版本

两个版本处理相同文件的缓存，这些文件是本地磁盘文件的索引。

请注意，构建 Service Worker 是可选的。

请注意，在使用 Service Worker 期间，某些文件优先从缓存提供（更多信息请参阅 Service Worker 文件中的注释）。在本地开发时应注意禁用或绕过 Service Worker，否则本地更改在刷新页面时可能不可见。

### 图片

图片通常以 85% 质量的 `.webp` 格式存储。Token图片和少量其他小图片（例如 UI 元素）以无损 `.webp` 格式存储。
