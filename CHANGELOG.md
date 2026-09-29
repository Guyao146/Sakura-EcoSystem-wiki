# Wiki 文档版本记录

本文件记录各项目 Wiki 页面自己的文档版本。每个项目独立维护版本号和更新日期，不等同于上游项目的 Release 版本；上游版本、迁移版本和部署 tag 仍以对应项目仓库为准。

## 当前版本（2026-09-24 · 结构合规补齐）

按设计规范模板审计并补齐各项目页的结构缺口，统一徽章来源、页尾章节顺序与版本记录写法。本轮只整理文档结构，不改动部署工作流与 `.zcode`。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.1.0` | 2026-09-24 | — | [README](README.md) |
| 项目关系 | `v1.0.3` | 2026-09-24 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Server | `v1.1.0` | 2026-09-24 | `v0.3.4` | [项目页](docs/sakura-mcp-server.md) |
| Cline Sync 本地客户端 | `v1.1.0` | 2026-09-24 | 源码 `0.1.0`，无独立 Release | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Server 生产部署 | `v1.0.2` | 2026-09-24 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-deployment.md) |
| Sakura-MCP-Server 运维与排障 | `v1.0.2` | 2026-09-24 | — | [运维页](docs/operations.md) |
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
- **版本记录补齐**：为 8 个缺版本记录的页面新增「## 版本记录」。Sakura-MCP-Server 与 Local Model Gateway 原有内容改标题归并；Sakura Chat 改用 master 提交标识（`74de4f9` / `92428c1` / `1831610`）并声明不当作正式版本；UniLink 与 Resume 助手注明版本来自 README 自述或 manifest，不推定发布历史；Life Dashboard 摘录 `1.0.7`–`1.0.11` 登录相关变更；DSH Better Model Thinking Control 把原「客户端版本演进」归并为版本表。
- **页尾顺序统一**：全部项目页调整为「与生态其他项目的关系 → 版本记录 → 结尾声明」，许可证、测试与项目内文档等正文章节前移。
- **渲染破损修复**：Sakura Chat 接口表表头与内容分离问题修复，整表回到「接口」章节内；UniLink 目录代码块补闭合，被吞掉的「通知回复」「安全模型」「常见问题」等章节恢复。
- **状态列规范化**：UniLink 功能表把 `✅` / `—` 改为「已实现」「不适用」；Sakura-MCP-Server 与 Local Model Gateway 两处名不副实的「状态」表头改名为「说明」。
- **README 索引同步**：项目表补 Cline Sync 与 AI 简历自动填充助手两行，版本列改为新的 Wiki 版本与上游来源标注。
- **专题页结尾声明补齐**：项目关系、生产部署、运维与排障、配置与密钥规范、贡献与维护、设计规范、十站一章 7 个专题页按设计规范要求补上固定结尾声明，各升补丁版本。
- 未改动内容的页面不升版本。

## 历史版本（2026-09-23 · 设计规范）

建立樱落生态 Wiki 的全局设计语言，统一排版、组件、章节结构与写作语气。参考 Apple Human Interface Guidelines 的「退让」与小米澎湃OS「生命感美学」的材质观，落到文档站场景。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.0.3` | 2026-09-23 | — | [README](README.md) |
| 项目关系 | `v1.0.2` | 2026-09-23 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Server | `v1.0.3` | 2026-09-23 | `v0.3.4` | [项目页](docs/sakura-mcp-server.md) |
| Cline Sync 本地客户端 | `v1.0.2` | 2026-09-23 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-deployment.md) |
| Sakura-MCP-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
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
| Sakura-MCP-Server | `v1.0.2` | 2026-09-20 | `v0.3.4` | [项目页](docs/sakura-mcp-server.md) |
| Cline Sync 本地客户端 | `v1.0.1` | 2026-09-20 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-deployment.md) |
| Sakura-MCP-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
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
- **未变动**：Sakura-MCP-Server（`v0.3.4`）、DSH Activity Tracker（`v1.7.0`）、DSH Better Model Thinking Control（`0.2.9`）、DSH Windows Tool Fix（`v0.2.1`）、Life Dashboard（`1.0.11`）、Sakura AI Cut（`0.2.1`）、UniLink（`v1.2`）、Resume-Smart-Filler-Assistant 的 HEAD 与 tag 均与上次扫描一致。

## 历史版本（2026-09-20）

本次同步扫描了各上游仓库的最新 Release 与版本文件，为全部项目页补充「快速开始」模块，并校正与上游不一致的版本记录；同时新增 Sakura Chat、Sakura AI Cut、UniLink 三个项目页。

| 项目 | Wiki 文档版本 | 更新日期 | 上游版本 | 页面 |
| --- | --- | --- | --- | --- |
| 生态总览 | `v1.0.2` | 2026-09-20 | — | [README](README.md) |
| 项目关系 | `v1.0.1` | 2026-09-20 | — | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Server | `v1.0.2` | 2026-09-20 | `v0.3.4` | [项目页](docs/sakura-mcp-server.md) |
| Cline Sync 本地客户端 | `v1.0.1` | 2026-09-20 | 随 Sakura 仓库 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Server 生产部署 | `v1.0.1` | 2026-09-20 | `v0.3.4` 固定 tag 建议 | [部署页](docs/sakura-mcp-deployment.md) |
| Sakura-MCP-Server 运维与排障 | `v1.0.1` | 2026-09-20 | — | [运维页](docs/operations.md) |
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
- **Sakura-MCP-Server**：上游已发布 `v0.3.4`（移除登录页对失效共享字体的依赖，改用系统字体，消除 `api.mcylyr.cn` 的 `.woff2` 404）。Wiki 此前记录为 `v0.3.3`，已全部更新，包括镜像 tag `ghcr.io/guyao146/sakura-mcp-server:0.3.4`。
- **Life Dashboard**：上游 `version.js` 已到 `1.0.11`（`2026-09-08`），Wiki 此前只记录到 `1.0.8`；补齐 `1.0.9` 登录页视觉重做、`1.0.10` 静默探测局部加载和 `1.0.11` 登录操作按钮间距。
- **Local Model Gateway**：`package.json` 为 `2.0.10`，最新 Release tag 为 `v2.0.9`；Wiki 此前未记录版本，已在状态表补齐。
- **许可证提示**：Sakura Chat 与 UniLink 仓库当前**没有 LICENSE 文件**，两篇 Wiki 均按 GitHub 默认规则记录并提示发布前补齐；Sakura AI Cut 为 `LGPL-2.1`。
- **DSH Activity Tracker（`v1.7.0`）、DSH Better Model Thinking Control（`0.2.9`）、DSH Windows Tool Fix（`v0.2.1`）**：Wiki 记录与上游一致，本次只补「快速开始」模块。

## 历史版本（2026-09-08）

| 项目 | Wiki 文档版本 | 更新日期 | 页面 |
| --- | --- | --- | --- |
| 生态总览 | `v1.0.0` | 2026-09-08 | [README](README.md) |
| 项目关系 | `v1.0.0` | 2026-09-08 | [项目关系](docs/ecosystem.md) |
| Sakura-MCP-Server | `v1.0.1` | 2026-09-08 | [项目页](docs/sakura-mcp-server.md) |
| Cline Sync 本地客户端 | `v1.0.0` | 2026-09-08 | [客户端页](docs/cline-sync.md) |
| Sakura-MCP-Server 生产部署 | `v1.0.0` | 2026-09-08 | [部署页](docs/sakura-mcp-deployment.md) |
| Sakura-MCP-Server 运维与排障 | `v1.0.0` | 2026-09-08 | [运维页](docs/operations.md) |
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
