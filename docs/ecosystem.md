# 项目关系

## 各项目分别解决什么问题

`Sakura-MCP-Server` 关注“不同 AI 如何记住同一批长期信息”：它通过标准 MCP Streamable HTTP 为 Claude、Cline、Cursor 等 Agent 提供多用户记忆、个人/共享空间、版本、来源、权限和检索；PostgreSQL + pgvector 保存结构化记忆与语义向量，Authentik 负责用户身份。

`dsh-activity-tracker` 关注“开发工作发生了什么”：从 DSH 压缩 JSONL 会话文件中提取用户输入、工具调用、Token 使用、项目、日期和小时等摘要，并在 DSH Web 中展示。

`Life Dashboard` 关注“生活与工作状态如何汇总”：它以 Dashboard 连接 Home Assistant、天气、日程、纪念日、AI 助手，并通过工作区动态展示 DSH 的近期活动。

`dsh-better-model-thinking-control` 关注“模型如何思考”：它读取 OpenAI 兼容中转站的模型能力，把思考档位映射到 DSH 原生 `llm-pi-ai` 设置。它不参与 Activity Tracker 的会话解析，也不改变 Life Dashboard 的推送链路。

## 集成链路

1. 在本机安装并启用 DSH Activity Tracker。
2. Life Dashboard 的 Authentik 管理员生成一次性 6 位配对码。
3. 在 DSH 的“活动统计 → 总设置 → 生活看板连接”输入配对码。
4. 插件保存服务器下发的连接配置，每 10 秒主动通过 HTTPS 推送工作区快照。
5. Life Dashboard 仅向通过 Authentik 管理员鉴权的浏览器提供工作区详情。

NAT 后无需向本地开发机开放端口，因为连接方向是本地插件主动访问远端服务器。

Sakura-MCP-Server 与现有 DSH、Life Dashboard 链路没有强制依赖。它是可独立部署的通用记忆服务：Agent 直接连接 `/mcp`；未来 DSH、Life Dashboard 或其他项目可以作为 Connector，把经过用户授权的摘要转换为统一记忆，而不是让记忆核心反向持有各业务系统的全部权限。

## 通用记忆链路

1. 用户通过 Authentik 进入 Sakura-MCP-Server，获得个人空间或加入共享空间。
2. 用户为不同 Agent 创建独立凭据，并限制 scope 与空间。
3. Agent 调用 `memory_remember` 写入带来源的记忆。
4. 服务执行权限、结构和有效期校验，保存来源与版本，并按空间 Provider 生成向量。
5. 后续 Agent 使用全文 + pgvector 混合检索召回有权限访问的内容。
6. 重复、语义相似和潜在冲突进入治理流程，由用户确认替代、合并或忽略。
7. 导入导出、后台向量重建、审计与 Web 管理都复用相同空间权限。

## 能力边界

| 能力 | 默认位置 | 数据范围 |
| --- | --- | --- |
| 统计卡片、热力图、时间线 | DSH Web | 本地会话聚合结果 |
| 工作区在线和活动状态 | Life Dashboard | 字段白名单摘要 |
| 会话详情 | Life Dashboard | 仅限已授权工作区和管理员 |
| 向当前会话发送消息 | Life Dashboard → DSH | 管理员、已授权且运行中的会话 |
| 模型思考档位 | DSH Better Model Thinking Control | DSH 原生 `llm-pi-ai` 与中转站 `/models` 能力元数据 |
| 跨 Agent 长期记忆 | Sakura-MCP-Server | 当前用户有权访问的个人或共享空间 |
| 语义与全文检索 | Sakura-MCP-Server / PostgreSQL + pgvector | 记忆正文、摘要、标签与向量，不包含其他租户数据 |
| 自动记忆提取 | Sakura-MCP-Server / OpenAI-compatible 或 Ollama | 按空间策略启用，模型结果必须通过结构校验 |
| 冲突治理 | Sakura-MCP-Server | 重复、关系、反馈、潜在冲突与人工确认 |
| 数据迁移 | Sakura-MCP-Server | JSON/Markdown 导入导出，不包含密钥和会话 |
| 后台任务 | Sakura-MCP-Server / PostgreSQL | 向量重建、取消、重试与崩溃恢复 |

## 边界原则

- Sakura-MCP-Server 不直接成为 Home Assistant、DSH 或 Life Dashboard 的万能控制器。
- Connector 只提交用户明确授权的数据范围，并记录来源系统与来源 URI。
- MCP 用户 Token 不透传给下游模型或业务系统；每个服务使用自己的最小权限凭据。
- 向量只是检索索引，不能替代原文、来源、版本和访问控制。