# AI 简历自动填充助手

仓库：[Guyao146/Resume-Smart-Filler-Assistant](https://github.com/Guyao146/Resume-Smart-Filler-Assistant) · 许可证 `GNU AGPL v3`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-1677ff)](https://github.com/Guyao146/Resume-Smart-Filler-Assistant)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

这是一个面向 Chrome/Edge 的 Manifest V3 浏览器扩展：用户上传或粘贴简历后，扩展读取当前网页中的表单字段，先用常见字段关键词进行本地匹配，再把未匹配字段交给用户配置的 AI 服务分析，最后将结果写回页面表单。

它适合求职网站、公司招聘页和其他标准 HTML 表单的重复填写。扩展不提供独立的服务器或账号系统，简历、解析结果、API Key 和偏好设置保存在本地浏览器；只有在执行 AI 匹配时，简历相关文本和表单字段上下文才会发送到你配置的 AI API。使用前应确认目标服务的隐私政策，并避免上传不希望离开本机的敏感信息。

## 运行要求

- Chrome 或 Edge 等支持 Manifest V3 的 Chromium 浏览器。
- 浏览器允许从扩展管理页加载未打包扩展。
- 一个可用的 AI API Key：内置支持 OpenAI、Moonshot Kimi，也支持自定义 OpenAI 兼容接口。
- 目标页面使用可访问的 `input`、`textarea` 或 `select` 表单控件；扩展不能直接填写浏览器禁止注入的页面。

仓库当前没有 `package.json`、构建脚本或需要额外安装的运行时依赖。仓库包含 `lib/pdf.js` 和 `lib/pdf.worker.js` 资源，但当前 `popup.html` 没有直接加载 PDF.js，`popup.js` 只有在运行环境已经提供 `pdfjsLib` 时才会走 PDF.js 分支，否则使用内置的基础文本回退逻辑。加载时应选择包含 `manifest.json` 的项目根目录。

## 安装与启用

### 开发者模式安装（推荐）

1. 克隆或下载仓库并解压到本地。
2. 打开浏览器扩展管理页面：
   - Chrome：`chrome://extensions/`
   - Edge：`edge://extensions/`
3. 开启右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择仓库根目录，即包含 `manifest.json`、`popup/`、`background/` 和 `content/` 的目录。
6. 安装后点击工具栏中的扩展图标，打开 AI 简历自动填充弹窗。

仓库 README 中使用了 `resume-autofill-extension/` 作为示例目录名；实际加载路径应以本地解压后包含 `manifest.json` 的目录为准。

### 打包为扩展文件（可选）

在扩展管理页面点击“打包扩展程序”，选择项目根目录。浏览器会生成 `.crx` 和 `.pem` 文件；`.pem` 是扩展私钥，应妥善保管，不要提交到仓库或发送给他人。

## 使用教程

### 1. 配置 AI 服务

首次执行自动填充前，需要在弹窗中点击“设置”：

1. 选择 `OpenAI (GPT-4o / GPT-3.5)`、`Moonshot AI (Kimi)` 或“自定义 API”。
2. 输入对应的 API Key。
3. 选择模型；自定义服务还需要输入完整的 Chat Completions 地址，例如 `https://api.example.com/v1/chat/completions`。
4. 点击“保存设置”。

内置模型选项如下：

| 提供商 | 模型选项 | 请求地址 |
| --- | --- | --- |
| OpenAI | `gpt-4o`、`gpt-4o-mini`、`gpt-3.5-turbo` | `https://api.openai.com/v1/chat/completions` |
| Moonshot | `moonshot-v1-8k`、`moonshot-v1-32k`、`moonshot-v1-128k` | `https://api.moonshot.cn/v1/chat/completions` |
| 自定义 | `custom` | 由用户填写 |

请求使用 Bearer API Key、JSON body、低温度 `0.1` 和最多 `2000` 个输出 Token；自定义接口需要兼容 OpenAI Chat Completions 的响应结构，即从 `choices[0].message.content` 返回文本。

### 2. 上传或粘贴简历

在弹窗上传区域拖拽文件，或点击选择文件。当前接受：

- PDF：优先使用运行环境中的 PDF.js 逐页提取文本；如果 `pdfjsLib` 不可用，则回退到从 PDF 原始字节中提取括号文本、十六进制文本、中文片段、邮箱和电话等内容的基础逻辑。
- TXT：直接读取文本内容。
- `.docx`：尝试从文档 XML 中读取 `<w:t>` 文本节点。
- `.doc`：使用基础字节文本提取方式。

文件大小上限为 `10 MB`。解析后可以展开“解析预览”，检查姓名、电话、邮箱、教育背景、工作经验、技能和项目经验等字段。也可以点击“手动粘贴简历文本”，粘贴至少 20 个字符的内容后保存并解析。

解析结果连同原始文本、文件名、格式化大小和时间戳保存为本地 `resume` 数据。删除弹窗中的简历会移除这份本地数据。

### 3. 扫描并填充当前页面

1. 打开包含求职表单的网页。
2. 点击扩展图标，确认已经加载简历并完成 API 配置。
3. 点击“扫描并填充当前页面”。
4. 扩展扫描可见且未禁用的 `input`、`textarea`、`select`，过滤隐藏、提交、按钮、重置、只读控件。
5. 查看进度和结果统计：识别字段、成功填充、未匹配字段。

填写普通文本、日期、复选框、单选框和下拉框时，扩展会按控件类型处理，并触发 `input`、`change` 和 `blur` 事件，以便 React、Vue 或 Angular 等前端框架感知值变化。成功写入的字段会短暂显示浅绿色背景。

### 4. 手动补充填写

对于 AI 没有找到内容或无法定位的字段，点击“手动补充填写”。页面右侧会打开操作面板：

- “定位”：滚动到对应字段，并临时显示蓝色轮廓。
- “填充”：弹出输入框，输入值后写入字段并触发输入/变更事件。
- 再次点击入口可以关闭已存在的面板。

快捷键：`Ctrl + Shift + R` 在当前页面打开或关闭手动填充面板。

## 匹配与填充流程

```text
上传 PDF / Word / TXT 或粘贴简历文本
              │
              ├─ Popup 提取文本
              ├─ 正则提取姓名、电话、邮箱等关键信息
              └─ 保存到 chrome.storage.local
                         │
              点击“扫描并填充当前页面”
                         │
              chrome.scripting.executeScript
                         │
              扫描表单属性和周边上下文
                         │
       本地关键词匹配 ──┴── AI 语义匹配剩余字段
                         │
              按控件类型写入网页并触发事件
                         │
              显示成功、失败和未匹配统计
```

### 表单字段识别

扫描器会为每个字段收集以下信息，并生成用于再次定位的 CSS 路径：

- `label`、`name`、`id`、`placeholder`、`aria-label`。
- `data-field`、`data-name`、`data-label` 等自定义属性。
- 所在表单项或祖先节点的有限文本上下文。
- 控件标签、类型、是否必填以及 `select` 的选项列表。

标签解析会依次尝试 `label[for]`、父级 `label`、前置标签/文本节点、表单项首个子节点和带有 `label`、`field`、`item`、`form` 类名的祖先节点。没有标准语义属性的页面，匹配准确率可能下降。

### 两阶段匹配

后台 Service Worker 的 `matchFields` 消息先执行本地规则匹配。规则覆盖姓名、邮箱、电话、教育、工作经验、技能、项目、地址、城市、生日、性别、LinkedIn、GitHub、个人网站、薪资和职位等常见字段，并同时检查字段名称、ID、标签、占位符、ARIA 标签和上下文。

本地规则无法提供值的剩余字段才进入 AI 匹配。发送给模型的内容包括：

- 最多前 `6000` 个字符的简历正文。
- 本地正则解析出的简历关键信息。
- 每个待匹配字段的索引、标签、名称、占位符、类型和上下文。

模型必须返回纯 JSON 数组，例如：

```json
[
  {"index": 0, "value": "具体值"},
  {"index": 1, "value": "NOT_FOUND"}
]
```

无法解析的响应或 API 请求失败时，剩余字段会进入未匹配列表，不会被猜测值覆盖。`select` 只会选择与模型结果文本或 value 相符的选项；文件上传控件不支持自动写入。

## 本地数据与隐私

### 浏览器本地存储

扩展使用 `chrome.storage.local` 保存：

- `resume`：文件名、大小、原始提取文本、解析字段和时间戳。
- `settings`：提供商、API Key、自定义地址、模型及选项页面中的自动填充/高亮/确认设置。
- `stats`：设置页读取的填充次数、字段总数和成功字段数（当前代码包含读取逻辑，具体统计写入取决于版本实现）。

选项页提供删除本地简历和导出 `resume-data.json` 的功能。导出的 JSON 包含简历原文和解析结果，应按敏感文件处理。

### 网络请求与权限边界

`manifest.json` 声明了 `activeTab`、`storage`、`scripting`、`clipboardWrite`，并为 `http://*/*` 与 `https://*/*` 声明主机权限。Content Script 会在匹配的 HTTP/HTTPS 页面加载，监听动态表单变化并向扩展报告页面 URL 与字段数量。

扩展没有自己的后端上传接口。自动填充时，后台只向 OpenAI、Moonshot 或用户填写的自定义地址发起 AI 请求；请求内容仍可能包含简历文本、表单标签和页面上下文。不要在不信任的自定义端点中输入 API Key，也不要把包含身份证号、详细住址等无关敏感信息的简历发送给不必要的第三方模型。

## 常见问题与限制

### Word 或 PDF 解析结果不完整

复杂排版的 Word 文档使用轻量 XML/字节提取，旧版 `.doc` 尤其容易丢失格式和文本。当前弹窗 HTML 没有直接加载仓库内的 PDF.js，因此 PDF 通常会走基础回退提取；扫描版、加密版或文本层异常的 PDF 更可能提取不到足够内容。建议将简历转换为可复制文本的 PDF 或 TXT，或者使用手动粘贴功能。

### 某些字段没有被填充

常见原因包括：

1. 简历中没有该信息，模型返回 `NOT_FOUND`。
2. 页面字段缺少 label、name、placeholder、ARIA 或可识别的上下文。
3. 下拉选项没有与模型结果匹配的文本或 value。
4. 字段位于跨域 iframe、受严格 CSP 保护的页面，或页面本身阻止脚本注入。

可先检查解析预览，再使用“手动补充填写”逐项定位和输入。扩展只扫描当前页面的 `input`、`textarea`、`select`，不会替你提交申请。

### 提示“API 请求失败”

请检查：

- API Key 是否正确，是否包含多余空格。
- 账户余额、模型权限和网络连接是否正常。
- 自定义地址是否为完整的 `/v1/chat/completions` 兼容路径。
- 自定义服务是否返回 `choices[0].message.content`，以及是否允许浏览器扩展的跨域请求。

扩展会把 HTTP 状态码和服务端返回的错误信息显示在控制台/状态提示中；API 失败时不会继续执行自动填充。

### 页面动态加载后字段变化

Content Script 使用 `MutationObserver` 观察 `document.body` 的子树变化，并在检测到表单后向后台报告。实际开始扫描时 Popup 仍会重新读取当前页面，因此建议等待表单加载完成后再点击扫描。

## 源码结构与许可证

```text
manifest.json          # Manifest V3 清单、权限、入口和资源声明
popup/popup.html       # 上传、解析预览、设置、扫描进度和结果界面
popup/popup.js         # 文件处理、简历解析、扫描/填充流程和本地存储
background/background.js # 规则匹配、AI 请求和手动填充面板注入
content/content.js     # 页面表单检测、空字段高亮和快捷键通信
options/options.html   # 独立设置页
options/options.js     # 设置、简历删除/导出和统计展示
options/options.css    # 设置页样式
popup/popup.css        # 弹窗样式
lib/pdf.js             # PDF.js 主库
lib/pdf.worker.js      # PDF.js Worker
icons/                 # 16/32/48/128 像素扩展图标
```

项目根目录 `LICENSE` 使用 **GNU Affero General Public License v3（GNU AGPL v3 / AGPL-3.0）**。这意味着修改并再分发扩展时，需要遵守 AGPL v3 的署名、许可证保留和对应源代码提供等条件；若修改后的程序支持用户通过网络远程交互，还需按 AGPL 第 13 条向远程用户提供获取对应源代码的方式。完整法律文本以仓库中的 [`LICENSE`](https://github.com/Guyao146/Resume-Smart-Filler-Assistant/blob/main/LICENSE) 为准。

README 当前仍写着 `MIT License`，与根目录 `LICENSE` 文件不一致。本 Wiki 按实际许可证文件记录为 GNU AGPL v3；发布或再分发前应以仓库最新版本的 `LICENSE` 及版权声明为准。

修改扩展并重新加载时，打开 `chrome://extensions/` 或 `edge://extensions/`，点击扩展卡片上的“重新加载”；网页中的 Content Script 通常需要刷新后才会获得新版本。

## 后续计划

仓库 README 中列出的方向包括：

- 图片简历 OCR。
- 更多 AI 提供商，如 Claude、Gemini。
- 简历模板自动优化。
- 批量填充多个页面。
- 使用 `mammoth.js` 等方案增强 Word 解析。
- 表单数据导出和保存能力。

这些属于项目规划，不代表当前版本已经实现。欢迎通过 [GitHub Issues](https://github.com/Guyao146/Resume-Smart-Filler-Assistant/issues) 反馈问题或提交 Pull Request。