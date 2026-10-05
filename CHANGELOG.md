# Wiki 文档版本记录

本文件记录各项目 Wiki 页面自己的文档版本。每个项目独立维护版本号和更新日期，不等同于上游项目的 Release 版本；上游版本、迁移版本和部署 tag 仍以对应项目仓库为准。

## 版本化发布与许可证采用

- 生态总览 Wiki v1.2.1：同步 UniLink v1.3 / Android 23、SakuraID v1.6.0、Activity Tracker v1.7.1、Windows Tool Fix v0.2.2、Better Model Thinking Control v0.2.10、简历扩展 v1.0.1。
- 发布包随附固定 LICENSE 与采用声明；修复 Activity Tracker 打包清单与许可全文哈希检查。
- 简历扩展保留 AGPL → LGPL 历史记录及 PDF.js Apache-2.0；不单方面撤销 Better Model 的历史 MIT 声明。
- 保留上游已有的 MCP Memory Server 更名与所有并行文档更新；不更改 Wiki 根许可证。

## 项目更名与 0.5.x 同步

- Sakura-MCP-Memory-Server 项目页升至 Wiki `v1.3.0`，部署页升至 `v1.1.0`，运维页升至 `v1.0.3`；更新新仓库、GHCR、npm tarball、Compose 服务与迁移指南。
- 补充上游 `v0.5.0` 工作区管理及 `v0.5.1` 改名说明。新项目页与部署页使用 `sakura-mcp-memory-*` 路径，保留旧页面及 Docsify alias 兼容收藏。
- 生态总览、侧栏、Cline Sync 与其他项目交叉链接统一显示新名称；历史版本与旧数据卷物理名保留其语义，不删除历史镜像或重写授权。
- 旧部署必须先停机、备份并以 external 卷复用原数据库/密钥；不能直接以新项目名启动空库。实际发布状态以新仓库 Actions 为准。


## 当前版本（2026-10-05 · 全项目同步扫描）

对照本地各上游仓库逐一扫描，把 wiki 未覆盖的已发布变动补齐；同时新增此前未收录的 SakuraID（Sakura-Auth-Server）项目页。本次只补文档，不改任何上游代码。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Sakura-MCP-Memory-Server](docs/sakura-mcp-memory-server.md) | `v1.2.0` | 2026-10-05 | 上游 `v0.3.4` → `v0.4.1`：本地账号登录、账号安全管理台、可选 SakuraID 登录、管理台「关于」页、镜像随附许可文件、性能与安全修复、迁移 013–015 与升级注意 |
| [Cline Sync 本地客户端](docs/cline-sync.md) | `v1.2.0` | 2026-10-05 | 源码 `0.1.0` → `0.2.0`：开机自启、运行历史持久化、失败熔断 |
| [Local Model Gateway](docs/local-model-gateway.md) | `v1.1.0` | 2026-10-05 | 上游 `v2.2.0` → `v2.4.0`：模型权限/能力/模态互转（2.3.0）、网关本地账号认证（2.4.0）与「关于我们」页 |
| [Life Dashboard](docs/life-dashboard.md) | `v1.3.0` | 2026-10-05 | 上游 `1.0.14` → `1.0.15`：设置页「关于我们」卡片；补录 `1.0.12`–`1.0.14` |
| [Sakura Chat](docs/sakura-chat.md) | `v1.3.0` | 2026-10-05 | 首个 Release tag `v1.1.0`：可选第三方登录（SakuraID/Authentik）、GHCR 镜像按 tag 版本化、安全与性能修复 |
| [Sakura AI Cut](docs/sakura-aicut.md) | `v1.3.0` | 2026-10-05 | 首个 Release tag `v1.0.0`：看板式主页、设置页与「关于我们」、本地管理员登录与可选 OIDC、节点 AI 全面化、开放 API |
| [UniLink](docs/unilink.md) | `v1.2.0` | 2026-10-05 | auth-server 网页配置向导 + Web 管理面板（免 `.env`、免一次性 token）、认证加固与资源回收、暗色主题重做 |
| [SakuraID（Sakura-Auth-Server）](docs/sakura-auth-server.md) | `v1.0.0` | 2026-10-05 | 新增项目页：自托管 IdP，上游 `v1.5.1`，Passkey/应用门户/审计/品牌定制与生态登录集成 |
| [十站一章](docs/studio-sites.md) | `v1.0.2` | 2026-10-05 | 统一认证条目注明由 SakuraID 提供 |
| [项目关系](docs/ecosystem.md) | `v1.0.4` | 2026-10-05 | 新增 SakuraID 项目段落；各项目当前版本快照全量刷新 |
| [生态总览](README.md) | `v1.2.0` | 2026-10-05 | 项目表全量同步版本号，新增 SakuraID 行；部署段落固定到 `v0.4.1` |

### 本次变更内容

- **Sakura-MCP-Memory-Server 补到 `v0.4.1`**：`0.4.0` 带来服务器本地账号登录（scrypt、失败锁定递增）、账号安全管理台（本地账号 CRUD、自助改密、会话管理，迁移 `015_account_security.sql`）与可选 Sakura（SakuraID）浏览器登录（PKCE + RS256，身份按 `sakura:<sha256(issuer)>:<sub>` 隔离，迁移 `013/014`）；`0.4.1` 增加管理台「关于」页、镜像随附 `LICENSE`/`NOTICE.md` 与 Origin/Fetch Metadata 校验、`email_verified` 提权防护等安全修复。版本记录、升级注意、当前状态表与快速开始中的 tag 引用同步更新，并注明 `0.5.0` 管理增强正在 `main` 开发、未发布。
- **Cline Sync 补到 `0.2.0`**：`508e767` 起客户端支持开机自启、运行历史持久化与失败熔断；「已知限制」中相应去掉「不提供开机自启」，保留「无安装器/签名发行版/自动更新」。
- **Local Model Gateway 补到 `v2.4.0`**：`2.3.0` 按模型能力与模态做互转翻译并可单独限制模态；`2.4.0` 新增网关本地账号认证与可选仅回环免认证模式，管理后台不再强制依赖外部 OIDC；全局设置新增「关于我们」标签页。
- **Sakura Chat 补到 Release `v1.1.0`**：此前的 master 快照记录保留，新增首个 tag Release 行——可选第三方登录（本地/Sakura/Authentik，OIDC + PKCE）、登录失败锁定与注册限频、SVG 存储型 XSS 防护、群资料越权修复、性能与音视频资源回收修复、GHCR 镜像按 tag 打版本号标签。
- **Sakura AI Cut 补到 tag `v1.0.0`**：补录 `0.2.1` 之后的画布大扩展（节点内 AI 生成、片段重拍与多参创作、节点拖拽缩放持久化等）与 `1.0.0` 的看板主页、设置页/关于我们、本地管理员登录与可选 Sakura/通用 OIDC、`/api/open/*` 开放 API（`X-API-Key`）；快速开始改为先设本地管理员密码。
- **UniLink 补 README 之后的提交**：扫码登录配套 auth-server 改为网页向导 + Web 管理面板，面板配置覆盖环境变量；`/healthz` setup 崩溃修复；认证请求取消、共享 OkHttpClient 与 Docker 下有界认证工作；暗色主题改为中性石墨色系。
- **新增 SakuraID（Sakura-Auth-Server）项目页**：此前 wiki 未收录该生态 IdP。它是 Sakura-MCP-Memory-Server `0.4.0` 与 Sakura Chat `v1.1.0` 第三方登录的提供方，依照其 README 整理定位、快速开始、功能概览（OAuth2/OIDC、Passkey、应用门户、审计、品牌定制等）与版本记录（`v1.2.0`–`v1.5.1`），并加入 README 项目表与侧栏。
- **无变动项目**：DSH Activity Tracker（`1.7.0`）、DSH Better Model Thinking Control（`0.2.9`，最近提交在 wiki 记录之前）、DSH Windows Tool Fix（`v0.2.1`）、AI 简历自动填充助手（manifest `1.0.0`）核对后均无新增变动，版本号不变。

## 历史版本（2026-10-05 · Wiki 主题布局修复）

修复左侧栏、页内目录与正文区的布局错乱：页内目录回归 docsify 原生的侧栏内嵌结构，不再以 `position: fixed` 浮动面板悬挂在正文左侧；正文列改为单一居中规则（最大宽 1080px、自动居中），删除 1700px 断点；移动端 ≤768px 保持全宽正文与 `.sidebar-toggle` 行为不变。`assets/theme.css` 缓存版本号升至 `v=13`。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [设计规范](docs/design-guide.md) | `v1.4.0` | 2026-10-05 | 组件表补「页内目录」「正文列」两条布局规范 |

### 本次变更内容

- **页内目录归位**：删除 `position: fixed; left: 322px` 与 1700px 断点下的 `display: none`；页内目录改为侧栏激活项下方的嵌套列表，保留「本页目录」标签和左侧分隔线，随侧栏滚动，所有视口一致可用。
- **正文列统一**：`.markdown-section` 改为 `max-width: 1080px; margin: 0 auto`。修复前宽屏正文被 `margin-left: 480px` 推到 760px 起、右侧大片空白；修复后在 `.content` 内自动居中，中宽屏不再溢出，窄屏（≤768px）全宽。
- **回归方式**：CDP 无头渲染在 1920×1000、1440×1000、390×844 三档视口实测侧栏与正文可滚动性、页内目录位置并截图对比；本地与远端部署验证通过后才合并。

## 历史版本（2026-10-04 · Sakura AI Cut 采用 Sakura-License）

Sakura AI Cut（上游 `0.2.1`）由版权人明确采用 Sakura-License v1.2 正式固定正文：仓库根 `LICENSE` 为固定正文副本（采用提交 `88600c5`），新增 `NOTICE.md` 采用声明，`package.json` 改为 `SEE LICENSE IN LICENSE`。Wiki 根 LICENSE 与其他上游项目许可不变，不追溯撤销旧授权。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Sakura AI Cut](docs/sakura-aicut.md) | `v1.2.0` | 2026-10-04 | 许可证标注改为 Sakura-License v1.2，许可证章节改为采用声明 |
| [生态总览](README.md) | `v1.1.8` | 2026-10-04 | 已采用项目列表加入 Sakura AI Cut，项目表版本号同步 |

### 本次变更内容

- **Sakura AI Cut 采用许可证**：采用文本为正式固定正文 [Sakura-License-1.2](licenses/Sakura-License-1.2.md)（2026-10-04 发布）；适用范围、生效提交（`88600c5`）、历史权利（此前按 LGPL-2.1 授权，既有权利不追溯撤销）、排除项与联系方式记录在项目仓库根 `NOTICE.md`。
- 仓库 `LICENSE` 与本 Wiki 的 `licenses/Sakura-License-1.2.md` 逐字一致（仅去除 Markdown 标记符）；`package.json` 声明 `SEE LICENSE IN LICENSE`，README 许可证段落同步改写。
- 本次只新增 Sakura AI Cut 的采用记录，不改动许可证正文与审阅稿存档；Wiki 根 LICENSE 仍为 GPL-3.0，其余上游项目许可不变，不追溯修改旧授权。文档与链接检查不证明法律有效性。

## 历史版本（2026-10-04 · Sakura-Chat 仓库 LICENSE 换用正式固定正文）

Sakura-Chat 仓库根 `LICENSE` 从审阅稿修订 3 副本替换为正式固定正文 `Sakura-License-1.2`（本 Wiki 提交 `359d2e9`），条文逐字一致；`NOTICE.md` 与 `README.md` 同步更新固定版本说明。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Sakura Chat](docs/sakura-chat.md) | `v1.2.2` | 2026-10-04 | 许可证段落改为仓库持有正式固定正文 |
| [生态总览](README.md) | `v1.1.7` | 2026-10-04 | 项目表 Sakura Chat 版本号同步 |

### 本次变更内容

- **仓库换正文**：Sakura-Chat 仓库 `LICENSE` 为正式固定正文副本（文本标识 `Sakura-License-1.2`，发布日期 2026-10-04）；`NOTICE.md` 固定许可版本与生效边界段落同步更新，`package.json` 维持 `SEE LICENSE IN LICENSE`。
- 条文与 2026-10-04 首次采用时的审阅稿修订 3 逐字一致，仅标题、文本标识、前言与第 15 条的状态表述不同；不改变生效边界与已授予的权利。
- 不替换 Wiki 根 GPL-3.0 LICENSE，不迁移其余上游项目；文档与链接检查不证明法律有效性。

## 历史版本（2026-10-04 · Life Dashboard 采用 Sakura-License）

Life Dashboard（上游 `1.0.14`）由版权人明确采用 Sakura-License v1.2 正式固定正文：仓库根 `LICENSE` 为固定正文副本，新增 `LICENSING.md` 采用声明，看板设置页「版本与更新」卡片提供许可正文入口。Wiki 根 LICENSE 与其他上游项目许可不变。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Life Dashboard](docs/life-dashboard.md) | `v1.2.0` | 2026-10-04 | 许可证标注改为 Sakura-License v1.2，新增许可证章节 |
| [生态总览](README.md) | `v1.1.6` | 2026-10-04 | 已采用项目列表加入 Life Dashboard |

### 本次变更内容

- **Life Dashboard 采用许可证**：采用文本为正式固定正文 [Sakura-License-1.2](licenses/Sakura-License-1.2.md)（2026-10-04 发布）；适用范围、生效边界（`1.0.14`）、历史权利（`1.0.13` 及之前仍按 LGPL-2.1 授权）、排除项与联系方式记录在项目仓库根 `LICENSING.md`。
- Life Dashboard 历史版本按 LGPL-2.1 取得的权利不追溯撤销；网页 GUI 的署名入口随设置页版本卡片提供。
- 本次只新增 Life Dashboard 的采用记录，不改动许可证正文与审阅稿存档；Wiki 根 LICENSE 仍为 GPL-3.0，其余上游项目许可不变，不追溯修改旧授权。文档与链接检查不证明法律有效性。

## 历史版本（2026-10-04 · Sakura-License v1.2 正式发布）

发布 v1.2 固定正文：第 1 至 14 条与审阅稿修订 3 逐字一致，仅标题、文本标识、前言与第 15 条的状态表述不同。各项目采用与迁移仍按采用指引单独声明；Wiki 根 LICENSE 仍为 GPL-3.0，其余项目许可不变。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Sakura 许可证导读](docs/sakura-license.md) | `v1.5.0` | 2026-10-04 | 转正：正文链接、状态措辞与版本记录表 |
| [采用与授权指引](docs/sakura-license-adoption.md) | `v1.3.0` | 2026-10-04 | 采用流程改为基于已发布固定正文 |
| [贡献与维护](docs/contributing.md) | `v1.1.1` | 2026-10-04 | 许可证段落去掉审阅稿表述 |
| [生态总览](README.md) | `v1.1.5` | 2026-10-04 | 许可证段落改为正式版，补 Local Model Gateway |
| [Sakura Chat](docs/sakura-chat.md) | `v1.2.1` | 2026-10-04 | 许可证标注与链接改为 v1.2 固定正文 |
| [Sakura-MCP-Memory-Server](docs/sakura-mcp-memory-server.md) | `v1.1.1` | 2026-10-04 | 许可证标注与链接改为 v1.2 固定正文 |
| [Local Model Gateway](docs/local-model-gateway.md) | `v1.0.4` | 2026-10-04 | 许可证标注改为 v1.2 |

### 本次变更内容

- **发布固定正文**：新增 [licenses/Sakura-License-1.2.md](licenses/Sakura-License-1.2.md)，第 1 至 14 条与审阅稿修订 3 逐字一致，仅标题、文本标识、前言与第 15 条改为固定版本状态；许可证徽章去掉 draft 标注。
- **审阅稿存档**：licenses/Sakura-License-1.2-draft.md 加历史存档说明，指向正式固定正文；条文与修订记录未改动。
- **导读与采用指引转正**：采用流程从“完成审查后另行发布固定文本”改为“基于已发布固定正文作采用声明”；状态说明、徽章链接与版本记录表同步更新，保留 GPL-3.0 根 LICENSE 冲突待迁移的表述。
- **已采用项目标注**：Sakura-MCP-Memory-Server、Sakura-Chat、Local-Model-Gateway 项目页许可证标注由“v1.2 审阅稿”改为“v1.2”；条文未变，已授予的权利不受正式版发布影响。
- 不替换 Wiki 根 GPL-3.0 LICENSE，不迁移其余上游项目，不追溯修改旧授权；项目正式采用仍须按采用指引完成权属核查与采用声明，文档与链接检查不证明法律有效性。


## 历史版本（2026-10-04 · Sakura Chat 采用 Sakura-License）

Sakura-Chat 仓库由版权人明确采用 Sakura-License v1.2 审阅稿固定文本：新增仓库根 `LICENSE`（正文逐字复制）与 `NOTICE.md` 采用声明，`package.json` / `package-lock.json` 声明 `SEE LICENSE IN LICENSE`。Wiki 根 LICENSE 与其他上游项目许可不变。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [Sakura Chat](docs/sakura-chat.md) | `v1.2.0` | 2026-10-04 | 许可证段落改为采用声明，新增 Sakura License 徽章 |
| [生态总览](README.md) | `v1.1.4` | 2026-10-04 | 许可证段落注明 Sakura Chat 已采用，其余项目不变 |

### 本次变更内容

- **Sakura Chat 采用许可证**：正文固定于本 Wiki 提交 `a8cbb9ee` 的 `licenses/Sakura-License-1.2-draft.md`；采用范围、生效提交、第三方依赖（`express` / `ws`，MIT）与联系方式记录在项目仓库根 `NOTICE.md`。
- **项目页更新**：原「仓库当前没有 LICENSE 文件」的提示改为采用说明，保留「上游项目以仓库最终声明为准」的口径；新增许可证徽章指向固定正文。
- 不替换 Wiki 根 GPL-3.0 LICENSE，不迁移其他上游项目，不追溯修改旧授权；Sakura-Chat 仓库此前无 LICENSE 文件，无历史许可版本。

## 历史版本（2026-10-04 · Wiki 视觉与轻动效）

为 Wiki 实际主题加入克制的品牌细节与交互反馈，不引入动画库或外部字体。其他页面版本延续历史记录。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [设计规范](docs/design-guide.md) | `v1.3.0` | 2026-10-04 | 轻入场、交互反馈、视觉细节与无障碍降级 |

### 本次变更内容

- **主题美化**：樱粉强调色、静态页头柔光、标题渐变短线、12px 面板与翻页卡片，保留实色高对比文字。
- **轻量动效**：标题与版本提示 320ms 入场，导航、搜索框和按钮 160ms 反馈；不使用滚动视差或循环装饰动画。
- **可访问性与移动端**：补齐键盘焦点轮廓，尊重减少动态效果设置；触屏不依赖 hover，窄屏表格独立横向滚动。
- **实现边界纠正**：上一条记录中的“全生态共用同一份样式表”“派生色自动跟随”“零 JavaScript”未得到实现核实，不作为当前事实。Wiki 使用本仓库主题 CSS 与切换脚本，`SAKURA_CSS` 仅保留为用户提供的参考；HTML/CSS 能完成视觉布局，不代表登录业务或 Wiki 无需 JavaScript。
- 更新主题 CSS 缓存版本；不修改许可证、项目正文或部署配置。

## 历史版本（2026-10-03 · 设计规范：登录页设计语言）

把登录页及品牌页面的设计语言整合进《设计规范》，明确 `SAKURA_CSS` 作为生态项目唯一样式来源的地位。许可证审阅稿相关页面版本延续下一条记录。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [设计规范](docs/design-guide.md) | `v1.2.0` | 2026-10-03 | 登录页骨架、参考色值、圆角体系与参考实现 |

### 本次变更内容

- **新增「登录页与品牌页面」章节**：`brandPage` 桌面 50/50 分栏骨架，左侧 150deg 樱色→紫罗兰渐变面板为全页唯一重色块，右侧表单只沿用中性 token；窄屏（≤899px）隐藏渐变面板改由紧凑品牌行承接；零 JavaScript、零外部字体。
- **色彩章节补参考色值表**：页面底色、面板、软底、品牌强调色及渐变的日间/夜间具体值，三级明度差代替边框、夜间渐变加深防眩光的做法写入规范。
- **新增圆角体系**：面板 12px、按钮/输入 8px、徽章全圆，禁止自造中间值。
- **新增「参考实现」章节**：`src/views/layout.js` 中的 `SAKURA_CSS`（约 200 行，token + 组件 + 明暗主题）为唯一样式来源；复用方式为整段搬走、品牌色改 `--accent` 派生色自动跟随，色值改动须保持角色结构与明度差规则。
- 四原则、排印阶梯、4px 网格、两级投影等已有内容不重复抄写，登录页对退让、通透、回响、一致四原则的体现以交叉引用方式并入对应章节。
- Wiki 与生态项目共用同一份样式表的事实写入规范，避免各项目自造主题。

## 历史版本（2026-10-02 · Sakura-License v1.2 审阅稿）

本轮修订许可证方案，不作全仓库换证或上游项目迁移。v1.2 是独立审阅稿，不追溯收紧旧授权；v1.0/v1.1 条文及其配套解释按原提交保留存档。此前日志中的“漏洞全部修复”“混用即不可分发”等表述是历史记录，不应作为当前法律结论。

本次变动的 Wiki 页面如下；其他页面版本延续上一条记录。

| 页面 | Wiki 文档版本 | 更新日期 | 内容 |
| --- | --- | --- | --- |
| [生态总览](README.md) | `v1.1.3` | 2026-10-02 | 说明审阅状态与现有许可范围冲突 |
| [贡献与维护](docs/contributing.md) | `v1.1.0` | 2026-10-02 | 不自动取得外部贡献版权及再许可权 |
| [Sakura 许可证导读](docs/sakura-license.md) | `v1.4.0` | 2026-10-02 | 补丁、转发、任务许可与商业入站场景 |
| [采用与授权指引](docs/sakura-license-adoption.md) | `v1.2.0` | 2026-10-02 | 商业入站授权、受托开发与分级源码交付 |

### 本次变更内容

- 新增 [v1.2 审阅稿正文](licenses/Sakura-License-1.2-draft.md)，将许可证正文与 Wiki 导读分离，固定版本采用须另行确认，不宣称已生效。
- 统一商用口径：对外提供受覆盖作品或服务并取得对价才触发，组织纯内部自用不自动算商用；区分无实质回报捐赠与付费支持、绑定权益的赞助、广告对价和收费套餐。
- 保留纯 API/MCP 互操作和独立聚合例外，按实际复制改编确定共享范围；第三方代码、数据库和依赖不因装进同一容器就改许可。
- 对外分发和提供服务时同步交付可编辑、可重建、与实际版本对应的源码；拟议保留至停止该版本分发和服务后至少 3 年。不要求公开密钥、用户内容和无关业务数据。
- 明确修改版分发与下游直接授权，删除模糊兼容许可出口；商用授权默认不解除署名和源码义务，其他例外须由有权主体明确批准。
- 区分 AI 语料、受保护表达、模型与独立输出，不声称“训练过就自动覆盖全部权重和输出”；贡献者保留版权，额外商业再许可或维权权限另行确认。
- 修正绝对免责、单方最终解释、所有 GPL/LGPL 混用即禁止等表述；补救期不允许继续违约，合法下游权利和既有源码义务不随上游停用消失。
- 新增 [v1.0 存档](licenses/Sakura-License-1.0.md) 与 [v1.1 存档](licenses/Sakura-License-1.1.md)，附固定提交链接；正文和配套解释按原文保存，已知错误不静默改写。
- README、贡献指南、侧栏和徽章明确标为审阅稿；根 GPL-3.0 LICENSE 未替换，历史声明冲突待权属核查及明确迁移说明。部署工作流与 `.zcode` 未改动。
- 文档和链接检查不是法律效力证明；正式采用前需完成权属与法律审查。

### 审阅修订 2：使用边界完善

- 受托存储、私有构建、测试、审计及运维在限定条件下不新增公众署名、源码共享义务；保留副本声明和修改记录，专项收费服务授权另行判断。通用基础设施费用不单独视为本作品商用。
- 对应源码保留范围限定为已对外交付或提供功能的版本；内部测试、完整 Git 历史及重启次数不自动扩展义务。同步公开与停止该对外版本后至少 3 年保留规则不变。
- 收费的独立纯协议应用保留 API/MCP 例外，API 服务的转售、访问及额度合同另行适用；独立评论、教学咨询不因收费或提及项目自动受限。
- 补模块、npm 依赖、插件、SDK 案例，不以导入方式或进程数量自动推定整体共享或豁免。
- 增加首次非故意遗漏的主动纠正恢复路径，区分通知后补救及重复违约；申请商用、换账号、重新下载均不自动恢复或追溯授权。
- 安全修复不设自动延期，必要协调披露须事先取得明确书面安排；采用指引增加受托证据、授权核验、通知和源码运营记录。
- 仍为未正式采用的审阅稿；不修改旧版存档、不替换根许可证，也不代表已签署商业或贡献者协议。

### 审阅修订 3：降低贡献与正常转发的负担

- 向原项目认可渠道提交补丁、安全修复供评审，不新增公共源码地址和三年托管义务，保留基础版本、来源与足够评审材料；公开合并后的实际发布者另行履行发布义务，入站授权不自动产生。
- 未修改的完整源码或带齐可编辑源文件的完整文档、资产，可随副本交付，不另建持续托管；修改版、二进制和服务依适用规则处理。未修改二进制可用核实后的上游固定源码地址，失效时须补镜像并在恢复前停止新增转发。
- 受托例外覆盖必要开发、修改及向委托方返还任务成果，成果权属及专项商业服务许可仍需明确。
- 任务发布者有充分权利且明确书面授予完成任务的许可时，悬赏或开发协议可覆盖任务报酬及必要交付，不重复申请；不自动授权向其他客户经营，也不替代新增成果的入站许可。
- 明确项目即使保持公开源码，商业运营含外部贡献的版本也须核实商业使用权；采用指引说明首次贡献前需取得指定主体的非独占商业使用及必要商业再许可授权，不宣称已签署 CLA。
- 正式发布前需将审阅过程与许可正文分离，本轮不执行正式迁移。修订 1、2 的同步公开和保留说明，以本轮补充的具体例外为准；旧版 v1.0/v1.1 原文及既有权利不变。

## 历史版本（2026-10-02 · Sakura-License v1.1）

对 Sakura-License 做漏洞修补并升级到 v1.1。本轮只改许可证文档及其引用，不改动既有项目页内容。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.1.2` | 2026-10-02 | — | [README](README.md) |
| 项目关系 | `v1.0.3` | 2026-09-24 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.1.0` | 2026-09-24 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.1.0` | 2026-09-24 | 源码 `0.1.0`，无独立 Release | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.2` | 2026-09-24 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.2` | 2026-09-24 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.1.0` | 2026-09-24 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.1.0` | 2026-09-24 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.1.0` | 2026-09-24 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.3` | 2026-09-24 | `v2.2.0` | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.1.0` | 2026-09-24 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| Sakura Chat | `v1.1.0` | 2026-09-24 | master（无 Release tag） | [项目页](docs/sakura-chat.md) |
| Sakura AI Cut | `v1.1.0` | 2026-09-24 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| UniLink | `v1.1.0` | 2026-09-24 | README 自述 `v1.2`，无 Release tag | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.1.0` | 2026-09-24 | manifest `1.0.0`，无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.2` | 2026-09-24 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.4` | 2026-10-02 | — | [维护说明](docs/contributing.md) |
| 设计规范 | `v1.0.1` | 2026-09-24 | — | [设计规范](docs/design-guide.md) |
| Sakura 许可证 | `v1.1.0` | 2026-10-02 | — | [许可证](docs/sakura-license.md) |
| 十站一章 | `v1.0.1` | 2026-09-24 | — | [站群说明](docs/studio-sites.md) |

### 本次变更内容

- **许可证升级到 v1.1**（[docs/sakura-license.md](docs/sakura-license.md)），修复 v1.0 审计出的漏洞，按「协议互操作例外」方向修订：
  - **消除自相矛盾**：第 2 条原本授予「组织内部使用」，与商用定义中的「企业内部商业运营」冲突，商业实体可借「内部使用」豁免授权。现明确营利实体在商业活动中的使用即商用。
  - **重定义商用**：由「以营利为目的」改为可取证的「向第三方提供并收取对价」；个人、教育、非营利及只收捐赠/赞助的开源项目明确不算商用，避免守法使用者无法自证。
  - **新增互操作例外**：通过公开 API/MCP 等网络协议调用运行实例不构成衍生或引用，只约束复制代码/文档、部署实例与二次开发。
  - **义务向下游传递**：原「兼容许可」路径会让衍生作品转手后合法闭源。现明确禁止再许可、下游自动受本许可约束、「兼容许可」必须保留核心义务；并加「上游违约不连坐下游」条款。
  - **组合与聚合条款**：与私有代码组合成单一程序、镜像、容器或安装包即衍生；真正的聚合（仅共享载体、运行时互不调用）不触发。
  - **反洗稿**：「衍生作品」以实质性相似为准，明确涵盖改写、压缩重构与跨语言重述。
  - **机器学习训练条款**：训练须披露语料来源并标注，输出物实质性相似视为衍生，商用须授权，个人学习不触发授权。
  - **网络服务可执行性**：源码须在服务上线 30 日内于互联网可访问处公开，内网或付费墙后不算。
  - **授权流程**：电子申请视为书面形式；30 个工作日回应时限；待决期不得商用且逾期不构成默示授权；许可一经授予不可撤销（违约除外）。
  - **终止与执行**：「恶意」操作化为「明知违约仍继续／通知后 30 日未停止」；电子记录（GitHub、邮件、截图）可作证据。
  - **贡献者条款**：外部 PR 授予版权人可再许可的权利，否则版权人无法对混合版权内容再许可或维权。
  - **依赖与历史许可冲突警告**：GPL-3.0 第 7 条禁止下游施加进一步限制，以更严格许可覆盖历史 GPL 内容本身不被允许；采用指引要求先审计依赖许可证树并取得历史外部贡献者同意。
- 徽章更新为 `Sakura License 1.1`；README 与「贡献与维护」中的许可证引用同步到 v1.1。
- 未改动内容的页面不升版本。

## 历史版本（2026-10-02 · Sakura-License）

发布并接入 Sakura-License v1.0：源码可见、衍生共享、标注来源、商用需授权的许可证。本轮只新增许可证文档并接入站点结构，不改动既有项目页内容。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.1.1` | 2026-10-02 | — | [README](README.md) |
| 项目关系 | `v1.0.3` | 2026-09-24 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.1.0` | 2026-09-24 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.1.0` | 2026-09-24 | 源码 `0.1.0`，无独立 Release | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.2` | 2026-09-24 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.2` | 2026-09-24 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.1.0` | 2026-09-24 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.1.0` | 2026-09-24 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.1.0` | 2026-09-24 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.3` | 2026-09-24 | `v2.2.0` | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.1.0` | 2026-09-24 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| Sakura Chat | `v1.1.0` | 2026-09-24 | master（无 Release tag） | [项目页](docs/sakura-chat.md) |
| Sakura AI Cut | `v1.1.0` | 2026-09-24 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| UniLink | `v1.1.0` | 2026-09-24 | README 自述 `v1.2`，无 Release tag | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.1.0` | 2026-09-24 | manifest `1.0.0`，无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.2` | 2026-09-24 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.3` | 2026-10-02 | — | [维护说明](docs/contributing.md) |
| 设计规范 | `v1.0.1` | 2026-09-24 | — | [设计规范](docs/design-guide.md) |
| Sakura 许可证 | `v1.0.0` | 2026-10-02 | — | [许可证](docs/sakura-license.md) |
| 十站一章 | `v1.0.1` | 2026-09-24 | — | [站群说明](docs/studio-sites.md) |

### 本次变更内容

- **新增 Sakura-License v1.0**（[docs/sakura-license.md](docs/sakura-license.md)）：源码可见、衍生共享、署名标注、网络服务视同分发、商用需书面授权、商标与专利不随许可授权、终止与恢复、变更披露与适用法律共 13 条正文，附「快速核查表」与「在你自己的仓库采用本许可」指引。
- **诚实标注边界**：页面明确说明限制商用的许可证不属于 OSI 开源许可证（OSD 第 6 条），属于 source-available / 共享源码一类，并说明与 `AGPL-3.0` / `GPL-3.0` 的近似关系，提示自定义许可证无 SPDX 短 id（使用 `LicenseRef-Sakura-License-1.0`）。
- **接入站点结构**：侧栏「开发与安全」加入口；README 项目表后加许可证声明；「贡献与维护」补「许可证」段落，区分 Wiki 文档许可与各代码仓库自身许可。
- **范围界定**：各代码仓库（多为 `LGPL-2.1`）不受本许可约束，仍以其根目录 `LICENSE` 为准；Wiki 仓库根目录的 GPL-3.0 文本仅作历史参考。
- 新增许可证徽章 `assets/badges/sakura-license.svg`。
- 未改动内容的页面不升版本。

## 历史版本（2026-09-24 · 结构合规补齐）

按设计规范模板审计并补齐各项目页的结构缺口，统一徽章来源、页尾章节顺序与版本记录写法。本轮只整理文档结构，不改动部署工作流与 `.zcode`。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.1.0` | 2026-09-24 | — | [README](README.md) |
| 项目关系 | `v1.0.3` | 2026-09-24 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.1.0` | 2026-09-24 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.1.0` | 2026-09-24 | 源码 `0.1.0`，无独立 Release | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.2` | 2026-09-24 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.2` | 2026-09-24 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.1.0` | 2026-09-24 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.1.0` | 2026-09-24 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.1.0` | 2026-09-24 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.3` | 2026-09-24 | `v2.2.0` | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.1.0` | 2026-09-24 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| Sakura Chat | `v1.1.0` | 2026-09-24 | master（无 Release tag） | [项目页](docs/sakura-chat.md) |
| Sakura AI Cut | `v1.1.0` | 2026-09-24 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| UniLink | `v1.1.0` | 2026-09-24 | README 自述 `v1.2`，无 Release tag | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.1.0` | 2026-09-24 | manifest `1.0.0`，无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.2` | 2026-09-24 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.2` | 2026-09-24 | — | [维护说明](docs/contributing.md) |
| 设计规范 | `v1.0.1` | 2026-09-24 | — | [设计规范](docs/design-guide.md) |
| 十站一章 | `v1.0.1` | 2026-09-24 | — | [站群说明](docs/studio-sites.md) |

### 本次变更内容

- **徽章本地化**：新增 9 个项目徽章 SVG 到 `assets/badges/`，按项目类型配色（MCP 紫、DSH 插件蓝、本地网关/聊天绿、Life Dashboard 青绿、AiCut 深灰）。全部项目页改用 `../assets/badges/*.svg`，不再引用 `img.shields.io` 等外链图床；Cline Sync 补齐整行徽章，Life Dashboard 补项目徽章。
- **徽章行顺序统一**：生态成员徽章指向 `../README.md`、项目徽章指向上游仓库、已编写Wiki 徽章指向本页；仓库信息行统一移到徽章行之后。
- **版本记录补齐**：为 8 个缺版本记录的页面新增「## 版本记录」。Sakura-MCP-Memory-Server 与 Local Model Gateway 原有内容改标题归并；Sakura Chat 改用 master 提交标识（`74de4f9` / `92428c1` / `1831610`）并声明不当作正式版本；UniLink 与 Resume 助手注明版本来自 README 自述或 manifest，不推定发布历史；Life Dashboard 摘录 `1.0.7`–`1.0.11` 登录相关变更；DSH Better Model Thinking Control 把原「客户端版本演进」归并为版本表。
- **页尾顺序统一**：全部项目页调整为「与生态其他项目的关系 → 版本记录 → 结尾声明」，许可证、测试与项目内文档等正文章节前移。
- **渲染破损修复**：Sakura Chat 接口表表头与内容分离问题修复，整表回到「接口」章节内；UniLink 目录代码块补闭合，被吞掉的「通知回复」「安全模型」「常见问题」等章节恢复。
- **状态列规范化**：UniLink 功能表把 `✅` / `—` 改为「已实现」「不适用」；Sakura-MCP-Memory-Server 与 Local Model Gateway 两处名不副实的「状态」表头改名为「说明」。
- **README 索引同步**：项目表补 Cline Sync 与 AI 简历自动填充助手两行，版本列改为新的 Wiki 版本与上游来源标注。
- **专题页结尾声明补齐**：项目关系、生产部署、运维与排障、配置与密钥规范、贡献与维护、设计规范、十站一章 7 个专题页按设计规范要求补上固定结尾声明，各升补丁版本。
- 未改动内容的页面不升版本。

## 历史版本（2026-09-23 · 设计规范）

建立樱落生态 Wiki 的全局设计语言，统一排版、组件、章节结构与写作语气。参考 Apple Human Interface Guidelines 的「退让」与小米澎湃OS「生命感美学」的材质观，落到文档站场景。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.0.3` | 2026-09-23 | — | [README](README.md) |
| 项目关系 | `v1.0.2` | 2026-09-23 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.0.3` | 2026-09-23 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.0.2` | 2026-09-23 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.0.2` | 2026-09-23 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.0.2` | 2026-09-23 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.0.1` | 2026-09-20 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.2` | 2026-09-23 | `v2.2.0` | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.0.2` | 2026-09-23 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| Sakura Chat | `v1.0.2` | 2026-09-23 | master（无 Release tag） | [项目页](docs/sakura-chat.md) |
| Sakura AI Cut | `v1.0.1` | 2026-09-23 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| UniLink | `v1.0.1` | 2026-09-23 | `v1.2` | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.0.2` | 2026-09-23 | 无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.1` | 2026-09-20 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.1` | 2026-09-23 | — | [维护说明](docs/contributing.md) |
| 设计规范 | `v1.0.0` | 2026-09-23 | — | [设计规范](docs/design-guide.md) |
| 十站一章 | `v1.0.0` | 2026-09-08 | — | [站群说明](docs/studio-sites.md) |

### 本次变更内容

- **新增设计规范页**：设计哲学、页面结构模板、组件规范、排印与间距、色彩 token 角色、写作语气，作为后续所有页面的写作依据。
- **主题层重构**（`assets/theme.css`）：标题字重阶梯化、正文行高收到 1.7、建立 4px 间距变量与两级阴影；表格与代码块去硬边框改为背景明度差加投影分区；侧栏玻璃化并给当前项加左侧指示条；链接与按钮 hover 增加颜色过渡、轻微抬升与投影加深。色彩 token 结构不变，色值未动。
- **贡献与维护**扩写：设计规范入口、版本号升降规则与相对链接规范。
- **结构缺口补齐**：为 6 个项目页补上固定的结尾免责声明；把 4 个页面的「与樱落生态的关系」标题统一为「与生态其他项目的关系」。
- 未改动内容的页面不升版本。

## 历史版本（2026-09-23 · 上游扫描）

本轮重新扫描全部 10 个上游仓库的最新提交与版本。仅 Local Model Gateway 与 Sakura Chat 有新进展，其余 8 个仓库与上次记录一致。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.0.3` | 2026-09-23 | — | [README](README.md) |
| 项目关系 | `v1.0.2` | 2026-09-23 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.0.2` | 2026-09-20 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.0.1` | 2026-09-20 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.0.1` | 2026-09-20 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.0.1` | 2026-09-20 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.0.1` | 2026-09-20 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.2` | 2026-09-23 | `v2.2.0` | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.0.1` | 2026-09-20 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| Sakura Chat | `v1.0.1` | 2026-09-23 | master（无 Release tag） | [项目页](docs/sakura-chat.md) |
| Sakura AI Cut | `v1.0.0` | 2026-09-20 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| UniLink | `v1.0.0` | 2026-09-20 | `v1.2` | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.0.1` | 2026-09-20 | 无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.1` | 2026-09-20 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.0` | 2026-09-08 | — | [维护说明](docs/contributing.md) |
| 十站一章 | `v1.0.0` | 2026-09-08 | — | [站群说明](docs/studio-sites.md) |

### 本次扫描结论

- **Local Model Gateway**：上游从 `2.0.10` 推进到 `v2.2.0`，共 5 个版本。`v2.2.0` 新增「每个上游重试次数」（0–10，默认 0），连接失败/超时/429/5xx 先原地重试同一上游再切换备用；`v2.1.0` 统一了 JSON 与 SSE 的错误码和请求 ID 格式；`v2.0.10` 修复 Responses 转 Chat 的工具调用 ID 关联。Wiki 已补版本记录表与可靠性设置说明。
- **Sakura Chat**：master 新增 2 个提交——输入框高度随内容自适应增长、顶部把手可拖拽调节并记忆，并修复溢出屏幕问题。Wiki 功能表与「近期更新」已同步。
- **未变动**：Sakura-MCP-Memory-Server（`v0.3.4`）、DSH Activity Tracker（`v1.7.0`）、DSH Better Model Thinking Control（`0.2.9`）、DSH Windows Tool Fix（`v0.2.1`）、Life Dashboard（`1.0.11`）、Sakura AI Cut（`0.2.1`）、UniLink（`v1.2`）、Resume-Smart-Filler-Assistant 的 HEAD 与 tag 均与上次扫描一致。

## 历史版本（2026-09-20）

本次同步扫描了各上游仓库的最新 Release 与版本文件，为全部项目页补充「快速开始」模块，并校正与上游不一致的版本记录；同时新增 Sakura Chat、Sakura AI Cut、UniLink 三个项目页。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.0.2` | 2026-09-20 | — | [README](README.md) |
| 项目关系 | `v1.0.1` | 2026-09-20 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.0.2` | 2026-09-20 | `v0.3.4` | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.0.1` | 2026-09-20 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.0.1` | 2026-09-20 | `v1.7.0` | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.0.1` | 2026-09-20 | `0.2.9` | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.0.1` | 2026-09-20 | `v0.2.1` | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.1` | 2026-09-20 | `2.0.10`（tag `v2.0.9`） | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.0.1` | 2026-09-20 | `1.0.11` | [项目页](docs/life-dashboard.md) |
| **Sakura Chat** | `v1.0.0` | 2026-09-20 | `1.0.0`（无 Release tag） | [项目页](docs/sakura-chat.md) |
| **Sakura AI Cut** | `v1.0.0` | 2026-09-20 | `0.2.1` | [项目页](docs/sakura-aicut.md) |
| **UniLink** | `v1.0.0` | 2026-09-20 | `v1.2`（无 Release tag） | [项目页](docs/unilink.md) |
| AI 简历自动填充助手 | `v1.0.1` | 2026-09-20 | 无 Release tag | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.1` | 2026-09-20 | — | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.0` | 2026-09-08 | — | [维护说明](docs/contributing.md) |
| 十站一章 | `v1.0.0` | 2026-09-08 | — | [站群说明](docs/studio-sites.md) |

### 本次扫描结论

- **新增项目**：Sakura Chat（仿微信网页聊天，Node.js 全栈 + SQLite 加密存储）、Sakura AI Cut（无限画布 AI 短剧生成，Next.js 16 + pnpm monorepo，`package.json` `0.2.1`）、UniLink（手机⇄电脑互联，`v1.2`，含 Authentik 扫码登录）。三者均已补「快速开始」并纳入首页项目表与侧栏。
- **Sakura-MCP-Memory-Server**：上游已发布 `v0.3.4`（移除登录页对失效共享字体的依赖，改用系统字体，消除 `api.mcylyr.cn` 的 `.woff2` 404）。Wiki 此前记录为 `v0.3.3`，已全部更新，包括镜像 tag `ghcr.io/guyao146/sakura-mcp-server:0.3.4`。
- **Life Dashboard**：上游 `version.js` 已到 `1.0.11`（`2026-09-08`），Wiki 此前只记录到 `1.0.8`；补齐 `1.0.9` 登录页视觉重做、`1.0.10` 静默探测局部加载和 `1.0.11` 登录操作按钮间距。
- **Local Model Gateway**：`package.json` 为 `2.0.10`，最新 Release tag 为 `v2.0.9`；Wiki 此前未记录版本，已在状态表补齐。
- **许可证提示**：Sakura Chat 与 UniLink 仓库当前**没有 LICENSE 文件**，两篇 Wiki 均按 GitHub 默认规则记录并提示发布前补齐；Sakura AI Cut 为 `LGPL-2.1`。
- **DSH Activity Tracker（`v1.7.0`）、DSH Better Model Thinking Control（`0.2.9`）、DSH Windows Tool Fix（`v0.2.1`）**：Wiki 记录与上游一致，本次只补「快速开始」模块。

## 历史版本（2026-09-08）

| 项目 | Wiki 文档版本 | 更新日期 | 页面 |
| --- | --- | --- | --- |
| 生态总览 | `v1.0.0` | 2026-09-08 | [README](README.md) |
| 项目关系 | `v1.0.0` | 2026-09-08 | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Memory-Server | `v1.0.1` | 2026-09-08 | [项目页](docs/sakura-mcp-memory-server.md) |
| Cline Sync 本地客户端 | `v1.0.0` | 2026-09-08 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Memory-Server 生产部署 | `v1.0.0` | 2026-09-08 | [部署页](docs/sakura-mcp-memory-deployment.md) |
| Sakura-MCP-Memory-Server 运维与排障 | `v1.0.0` | 2026-09-08 | [运维页](docs/operations.md) |
| DSH Activity Tracker | `v1.0.0` | 2026-09-08 | [项目页](docs/dsh-activity-tracker.md) |
| DSH Better Model Thinking Control | `v1.0.0` | 2026-09-08 | [项目页](docs/dsh-better-model-thinking-control.md) |
| DSH Windows Tool Fix | `v1.0.0` | 2026-09-08 | [项目页](docs/dsh-windows-tool-fix.md) |
| Local Model Gateway | `v1.0.0` | 2026-09-08 | [项目页](docs/local-model-gateway.md) |
| Life Dashboard | `v1.0.0` | 2026-09-08 | [项目页](docs/life-dashboard.md) |
| AI 简历自动填充助手 | `v1.0.0` | 2026-09-08 | [项目页](docs/resume-smart-filler-assistant.md) |
| 配置与密钥规范 | `v1.0.0` | 2026-09-08 | [安全规范](docs/security.md) |
| 贡献与维护 | `v1.0.0` | 2026-09-08 | [维护说明](docs/contributing.md) |
| 十站一章 | `v1.0.0` | 2026-09-08 | [站群说明](docs/studio-sites.md) |

## 版本规则

- 每个项目或专题页面独立递增 Wiki 文档版本；修改一个页面时，不要求其他页面一起升版本。
- Wiki 文档版本只表示该页面的文档快照，不表示上游软件、插件或站点的发布版本。
- 页面顶部的更新日期与 Wiki 文档版本必须同步更新。
- 上游项目版本、Release、数据库迁移和镜像 tag 保留在正文中，方便安装、升级和追溯。
