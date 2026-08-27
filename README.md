# 樱落生态Wiki · 连接云，人，家

> 🌸 Sakura EcoSystem · Connect Cloud, People and Home.

<img src="https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/SakuraEcoSystem.png" alt="Logo" weight='200px' height="100px">

这里记录项目定位、安装方式、架构边界、部署流程与维护决策，让每个项目既能独立使用，也能组合成完整的个人数字系统。

## 当前项目

| 项目 | 定位 | 连接方式 | 当前版本 |
| --- | --- | --- | --- |
| [Sakura-MCP-Server](docs/sakura-mcp-server.md) | 面向所有兼容 MCP Agent 的多用户长期记忆平台 | MCP、Authentik、pgvector、Provider、Worker、审计和 Web 管理 | `v0.2.21` 已发布；当前 commit `04cc0b8` |
| [DSH Activity Tracker](docs/dsh-activity-tracker.md) | DeepSeek Harness 的本地活动统计与归档恢复插件 | 扫描本地 DSH 会话、查看/恢复归档，并可向 Life Dashboard 推送快照 | v1.7.0 |
| [DSH Better Model Thinking Control](docs/dsh-better-model-thinking-control.md) | DSH 中转站模型思考强度配置与能力识别 | 读取 OpenAI 兼容 `/models`，写入 DSH 原生 `llm-pi-ai` 设置 | v0.2.0 |
| [Life Dashboard](docs/life-dashboard.md) | 个人生活中枢与可视化看板 | Authentik、Home Assistant、天气、To Do、AI 与 DSH | v0.10.1 |

## 工作室网站群

樱落生态不仅包含开发项目，也连接一组面向不同场景的站点。官网将它们组织成“十站一章”的旅程，分为相遇、游乐、创作与流转四个篇章。

- [查看十站一章](docs/studio-sites.md)
- [访问樱落站群首页](https://www.mcylyr.cn/)

## 生态主线

```text
Claude / Cline / Cursor / 其他 MCP Agent
                    │ HTTPS + MCP
                    ▼
          Sakura-MCP-Server：长期记忆
                    │
       PostgreSQL + pgvector / Authentik
                    │
        OpenAI-compatible / Ollama

DSH 本地会话 ── Activity Tracker ── Life Dashboard
      │                                      │
      └─ Better Model Thinking Control       └─ Home Assistant / To Do / AI
```

## 设计原则

- **本地优先**：活动统计默认只读取本机 `~/.dsh/sessions`，不上传会话内容。
- **显式授权**：跨设备连接通过一次性配对码完成，会话详情默认不授权。
- **密钥隔离**：服务器密钥放在 `.env`，浏览器只获取当前功能所需的数据。
- **可独立部署**：各项目都能单独安装，Life Dashboard 的 DSH 集成是可选能力。
- **记忆可治理**：跨 Agent 记忆必须保留来源、空间权限、版本和删除路径，不把向量或模型输出当作不可追溯事实。

## 从哪里开始

- 想统计 DSH 使用情况：阅读 [DSH Activity Tracker](docs/dsh-activity-tracker.md)。
- 想让多个 AI Agent 共用长期记忆：阅读 [Sakura-MCP-Server](docs/sakura-mcp-server.md)。
- 准备在服务器部署记忆平台：阅读 [Sakura-MCP-Server 生产部署](docs/sakura-mcp-deployment.md)。
- 需要备份、升级、恢复或排障：阅读 [运维手册](docs/operations.md)。

> Sakura-MCP-Server 当前 `v0.2.21` 已发布。生产部署建议固定 `v0.2.21` tag，并确认对应 GitHub Actions 为绿色。Compose 已支持无 `.env` 首次启动；公网仍需配置 HTTPS，并尽快完成 `/setup`。

生产部署可以只下载 `docker-compose.yml`，直接从 GHCR 拉取 `v0.2.21` 多架构镜像；一次性 `bootstrap-secrets` 容器会生成持久化密钥。本地源码构建使用 `docker-compose.dev.yml`，详见 [生产部署](docs/sakura-mcp-deployment.md)。
- 想配置中转站模型思考强度：阅读 [DSH Better Model Thinking Control](docs/dsh-better-model-thinking-control.md)。
- 想搭建个人生活看板：阅读 [Life Dashboard](docs/life-dashboard.md)。
- 想了解樱落工作室的全部站点：阅读 [十站一章](docs/studio-sites.md)。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
