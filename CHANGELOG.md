# Wiki 文档版本记录

本文件记录各项目 Wiki 页面自己的文档版本。每个项目独立维护版本号和更新日期，不等同于上游项目的 Release 版本；上游版本、迁移版本和部署 tag 仍以对应项目仓库为准。

## 当前版本（2026-09-23）

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
