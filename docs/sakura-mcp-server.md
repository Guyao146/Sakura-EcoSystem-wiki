# Sakura-MCP-Server

仓库：[Guyao146/Sakura-MCP-Server](https://github.com/Guyao146/Sakura-MCP-Server) · 许可证 `LGPL-v2.1`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![MCP Server](https://img.shields.io/badge/MCP-Server-7c5cff)](https://modelcontextprotocol.io/)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

> [!WARNING]
> `v0.2.28` 已发布，但项目仍建议先在测试环境完成备份、恢复、Authentik、权限、限流和监控演练，再投入生产环境。

## 项目定位

Sakura-MCP-Server 是面向所有兼容 Model Context Protocol（MCP）的 AI Agent 的多用户长期记忆平台。Claude、Cline、Cursor、Windsurf 以及其他支持远程 MCP 的 Agent，可以在经过授权后，把事实、偏好、人物、事件、任务、项目、文档摘要和对话结论写入统一记忆库，并在未来会话中检索和召回。

它不是特定业务系统的万能 API 网关。外部服务以后只以可选 Connector 接入统一记忆模型；核心服务只负责：

- 用户和 Agent 身份；
- 个人空间与共享空间；
- 记忆、版本、来源和关系；
- 全文与向量检索；
- 冲突、反馈和删除治理；
- Provider、后台任务和安全审计。

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 仓库版本字段 | `0.2.28` |
| 最新公开 Release | `v0.2.28` |
| 当前主线已验证 commit | 以 GitHub `main` 最新绿色 CI 为准 |
| 生产容器镜像 | `ghcr.io/guyao146/sakura-mcp-server:0.2.28` |
| Docker 运行镜像 | GHCR 多架构镜像，内部使用 `node:24-bookworm-slim` 和非 root `mcp` 用户 |
| 开发分支 | 直接使用 `main` |
| MCP Transport | Streamable HTTP，推荐根域名 `/`，兼容 `/mcp` |
| 数据库 | PostgreSQL 16 + pgvector |
| 登录 | 默认 Authentik Authorization Code + PKCE，含独立登录页与 RP-Initiated Logout；可选私有网络 `AUTH=false` |
| Agent 认证 | 数据库 API Key 或 Authentik JWT；Key 可随时查看（AES-256-GCM 加密副本） |
| 管理员判定 | Authentik 超级用户（内置 `authentik Admins` 组）自动为系统管理员；可自定义管理员用户组 |
| 模型 Provider | 对话与向量（Embedding）可分别指向不同的 OpenAI-compatible 端点 |
| 管理后台 | `/admin` |
| 安装向导 | `/setup`，自动诊断、OpenID Discovery 和 Public Client 预检 |

实现变化以后，以项目仓库的 `README.md`、`CHANGELOG.md`、迁移文件和 GitHub Actions 为最终依据。

## 架构

```text
Claude / Cline / Cursor / Windsurf / 其他 Agent
                    │
                    │ HTTPS + MCP Streamable HTTP
                    ▼
             Sakura-MCP-Server
        ┌───────────┼────────────┐
        │           │            │
    MCP Tools   Web 管理后台   Background Worker
        │           │            │
        └───────────┼────────────┘
                    │
       PostgreSQL 16 + pgvector
                    │
      OpenAI-compatible / Ollama

用户浏览器 ── Authentik OIDC + PKCE ── /admin
```

HTTP/MCP、Web 和 Worker 共用同一套 Repository 和空间权限服务，不维护两套互相不一致的规则。

## 多用户与空间

每个 Authentik 用户首次登录时自动创建个人空间。用户也可以创建共享空间，通过邮箱邀请其他 Authentik 用户。

| 角色 | 主要能力 |
| --- | --- |
| `owner` | 管理空间、成员、AI 策略和全部记忆 |
| `admin` | 邀请成员、管理设置、任务和记忆 |
| `editor` | 创建、更新、归档、软删除和处理冲突 |
| `contributor` | 创建新记忆 |
| `viewer` | 浏览、搜索和召回 |

访问一条记忆时，服务同时检查：

```text
当前用户身份
∩ Agent 全局 scope
∩ Agent 对目标空间的 grant
∩ 用户在目标空间中的角色
∩ 具体操作类型
```

`memory_id`、`space_id`、邀请 ID、任务 ID 和审计 ID 都只是标识符，不是访问凭证。

## 记忆模型

记忆字段包括：

```text
type / content / summary / tags
importance / confidence / sensitivity
valid_from / valid_until / expires_at
source / source_agent / source_uri
status / supersedes_id
created_by / created_at / updated_at
embedding / versions / relations / feedback
```

支持类型：

```text
fact / preference / event / task / person
project / summary / document / idea / other
```

支持状态：

- `active`：当前有效；
- `pending_confirmation`：等待用户确认；
- `superseded`：已经被新事实替代；
- `archived`：保留，但不参与默认召回；
- `deleted`：软删除。

更新会创建版本快照；永久删除需要目标空间管理员权限。

## 检索

### 全文与向量混合召回

空间配置 Embedding Provider 后，`memory_search` 和 `memory_recall` 组合：

```text
60% 向量余弦相似度
25% PostgreSQL 全文相关度
10% 记忆重要性
 5% 记忆置信度
```

Provider 未配置、请求失败或向量维度不匹配时，不会伪造向量；记忆仍可以通过全文、重要性和置信度参加排序。

不同空间可以使用不同模型和向量维度。当前实现取空间内最多 1000 条候选做精确排序；大规模部署以后计划按 Provider、模型和维度分区建立 HNSW。

### Embedding 生命周期

- 创建记忆后尝试生成向量；
- 正文、摘要或标签变化后重新生成；
- Provider 失败时保留原始记忆；
- `memory_embeddings.status` 记录 `pending / ready / failed`；
- 后台任务可批量重建整个空间的向量。

## AI Provider

### OpenAI-compatible

兼容：

```text
/chat/completions
/embeddings
```

可接 OpenAI、中转站或自托管兼容服务。API Key 使用 `CONFIG_ENCRYPTION_KEY` 做 AES-256-GCM 加密后存入 PostgreSQL，浏览器只看到 `hasApiKey`。

### Ollama

兼容：

```text
/api/chat
/api/embed
```

高敏感空间可以启用隐私模式。隐私模式只允许 Ollama，服务端会拒绝 OpenAI-compatible Provider。

每个空间可以独立设置 Provider、Chat Model、Embedding Model、自动提取、自动合并、冲突检测和隐私模式。

## MCP Tools

### 记忆

| Tool | Scope | 作用 |
| --- | --- | --- |
| `memory_remember` | `memory:write` | 写入结构化长期记忆 |
| `memory_search` | `memory:read` | 全文 + 向量混合搜索 |
| `memory_recall` | `memory:read` | 根据上下文召回 |
| `memory_get` | `memory:read` | 读取单条记忆 |
| `memory_update` | `memory:update` | 更新并保留版本 |
| `memory_forget` | `memory:delete` | 软删除或管理员永久删除 |
| `memory_extract` | `memory:write` | 从文本提取候选，不保存 |
| `memory_extract_and_remember` | `memory:write` | 提取并保存最多 50 条候选 |
| `memory_link` | `memory:update` | 建立同空间记忆关系 |
| `memory_feedback` | `memory:read` | 提交帮助度和纠正意见 |

### 治理

| Tool | 作用 |
| --- | --- |
| `memory_conflicts` | 查询待处理、已解决或已忽略冲突 |
| `memory_resolve_conflict` | 保留 A/B、合并或忽略 |

Agent 不能自行解决冲突；冲突裁决要求交互式 Authentik 用户。

### 空间与成员

| Tool | 作用 |
| --- | --- |
| `space_list` | 列出可访问空间 |
| `space_create` | 创建共享空间 |
| `space_list_members` | 查看成员和角色 |
| `space_invite_member` | 生成邮箱绑定的限时邀请 |
| `space_accept_invitation` | 当前 Authentik 邮箱接受邀请 |

### Agent Key

| Tool | 作用 |
| --- | --- |
| `agent_create` | 创建只显示一次的 Key |
| `agent_list` | 查看前缀、scope、到期和 grant |
| `agent_revoke` | 立即撤销 |
| `agent_grant_space` | 授予空间级 scope |
| `agent_revoke_space` | 移除空间授权 |

Agent Token 格式：

```text
sk_sakura_<prefix>_<random-secret>
```

数据库只保存 SHA-256 哈希和非敏感前缀。

### 导入、导出与任务

| Tool | 作用 |
| --- | --- |
| `memory_import` | 导入 JSON/Markdown，单次最多 500 条 |
| `memory_import_status` | 查询任务和逐条错误 |
| `memory_export` | 导出 JSON/Markdown |
| `embedding_rebuild_start` | 后台重建空间向量 |
| `background_job_list` | 查询任务列表 |
| `background_job_status` | 查询进度 |
| `background_job_cancel` | 请求取消 |
| `background_job_retry` | 重试失败/取消任务 |
| `audit_list` | 查询当前身份可见的审计事件 |

## MCP Resources

支持 Resources 的客户端可以读取：

```text
memory://spaces
memory://spaces/{spaceId}
memory://memories/{memoryId}
```

每次读取仍重新验证 Bearer、scope、Agent grant 和空间角色；URI 可猜测不代表可以访问。

## 记忆治理

自动提取或导入以后可以执行：

- 规范化正文完全一致：建立 `duplicate_of`；
- 同维度向量相似度达到阈值：创建潜在冲突；
- 不让模型自动删除或裁决事实；
- 冲突由人工选择保留 A、保留 B、合并或忽略；
- 合并和替代保留旧记忆、版本、来源和关系；
- `memory_feedback` 为后续排序优化保留反馈。

## 后台 Worker

任务队列使用 PostgreSQL `FOR UPDATE SKIP LOCKED`，多实例不会重复领取同一任务。支持：

- 崩溃后超时恢复；
- 指数退避重试；
- 协作式取消；
- 手工重试；
- 向量批量重建；
- 任务进度和最多 100 条错误摘要。

## Web 管理后台

`/admin` 支持：

- 空间和成员邀请；
- 记忆搜索、创建、编辑和删除；
- 冲突确认；
- Agent Key 和空间 grant；
- Provider 与空间 AI 策略；
- JSON/Markdown 导入导出；
- 后台任务；
- 安全审计。

登录使用 Authentik Authorization Code + PKCE。Session Cookie 使用 HttpOnly、SameSite=Lax，HTTPS 下同时使用 Secure；数据库只保存 Session Token 哈希。所有写请求还需要与 Session 绑定的 HMAC-SHA256 CSRF Token。

### Authentik 自动发现与修复

安装向导可以只填写 Authentik HTTPS 根地址和应用 Slug，然后从：

```text
/application/o/<slug>/.well-known/openid-configuration
```

自动回填 Issuer、JWKS、Authorization、Token 和 UserInfo 端点。Audience 与 Client ID 仍需手工填写。

完成安装前，服务会使用无效授权码和 PKCE verifier 对 Token Endpoint 做安全预检：

- `invalid_grant`：Public Client 身份验证方式正确；
- `invalid_client`：Client 类型、Client ID 或认证方法错误，阻止完成安装。

如果错误配置导致管理员无法登录，可以先在网络层只允许管理员来源，临时设置 `AUTH=false`，进入管理后台“身份认证”页面测试并保存正确配置，再恢复 `AUTH=true`。恢复模式会暂时让所有访问者拥有系统管理员权限，禁止在未限制访问的公网使用。

### 可选无认证模式

私有单用户环境可以设置：

```dotenv
AUTH=false
```

服务会跳过 Authentik 步骤，创建稳定的本地管理员身份，根域名和 `/mcp` 不要求 Authorization Header。此模式等同于把完整管理员权限授予所有网络访问者，只允许用于已经由防火墙、VPN 或反向代理白名单隔离的网络。

### 版本检查

管理后台显示当前运行版本。系统管理员可以检查 GitHub 最新 Release；结果缓存 15 分钟，也可以强制刷新。检查只读取公开 Release API，不执行自动升级。

## 安装、部署与运维

- [生产部署指南](sakura-mcp-deployment.md)
- [运维、备份、升级与排障](operations.md)
- [配置与密钥规范](security.md)

最小外部入口：

| 路径 | 作用 |
| --- | --- |
| `/` | 推荐 MCP Streamable HTTP；浏览器 GET 自动跳转安装/管理页 |
| `/mcp` | 旧客户端兼容 MCP 地址 |
| `/setup` | 首次安装向导 |
| `/admin` | Web 管理后台 |
| `/auth/login` | Authentik 登录 |
| `/health` | PostgreSQL、pgvector、安装和 Worker 健康 |
| `/.well-known/oauth-protected-resource` | 根域名 RFC 9728 发现 |
| `/.well-known/oauth-protected-resource/mcp` | 兼容 `/mcp` 的发现地址 |

## 安全边界

- Provider Key 使用 AES-256-GCM 加密；
- Agent、邀请和 Session Token 只保存哈希；
- MCP Token 不透传给模型 Provider；
- CSRF、CSP、HSTS、点击劫持和 MIME sniffing 防护；
- MCP、Web、登录和安装接口使用独立速率限制；
- 安装完成后 Setup 写接口永久锁定；
- PostgreSQL + JSONL 双重审计，正文和密钥递归脱敏；
- 普通用户只能看自己的审计，空间 owner/admin 才能看空间活动；
- 生产依赖经过 `npm audit`，容器镜像经过 Trivy HIGH/CRITICAL 扫描。

## 源码结构

```text
src/index.ts              HTTP、OAuth、Web API 与 MCP 入口
src/auth.ts               API Key 与 Authentik JWT
src/database.ts           PostgreSQL 连接和顺序迁移
src/tools.ts              MCP Tools 与 Resources
src/memory/               记忆仓库与空间权限
src/semantic/             Embedding 与混合检索
src/governance/           重复、关系、反馈与冲突
src/transfer/             JSON/Markdown 导入导出
src/jobs/                 持久化任务与 Worker
src/audit.ts              PostgreSQL/JSONL 安全审计
src/web/                  PKCE Session 与管理后台
src/setup/                安装向导
migrations/               数据库迁移
scripts/install.sh        Linux 首次部署密钥与 Compose 启动脚本
tests/                    单元和 pgvector 集成测试
```

## 测试与发布

CI 会执行：

1. npm 生产依赖审计；
2. TypeScript 类型检查；
3. 单元测试；
4. 真实 PostgreSQL + pgvector 集成测试；
5. Docker 镜像构建；
6. Docker Compose 配置检查；
7. Trivy HIGH/CRITICAL 镜像扫描（当前报告模式，不因基础镜像上游临时 CVE 阻塞应用测试；生产依赖审计仍是阻塞检查）。

最新 Release：[`v0.2.28`](https://github.com/Guyao146/Sakura-MCP-Server/releases/tag/v0.2.28)，包含 `sakura-mcp-server-0.2.28.tgz`。同时发布 GHCR 多架构镜像 `ghcr.io/guyao146/sakura-mcp-server:0.2.28`。后续推送 `v*` 标签后，Release 工作流会继续生成 npm tarball、GitHub Release 和版本化镜像。正式部署前应确认对应 commit 的 CI 为绿色。

## 0.2.22 – 0.2.28 变更要点

这一段的迭代集中在 Authentik 认证体验和向量 Provider：

| 版本 | 要点 |
| --- | --- |
| 0.2.22 | 新增独立的向量（Embedding）Provider，可指向与对话不同的 OpenAI-compatible 端点，支持 `EMBEDDING_BASE_URL`/`EMBEDDING_API_KEY`/`EMBEDDING_MODEL`；向量与抽取失败时附带上游错误正文 |
| 0.2.23 | 安装向导拆分对话与向量模型配置，新增「同站配置」勾选框 |
| 0.2.24 | 支持 OIDC RP-Initiated Logout，退出时跳转 Authentik `end_session_endpoint`，避免被 SSO 静默续登 |
| 0.2.25 | 新增独立登录页 `/auth/login`，退出后停在自己的登录页而非直接静默回后台 |
| 0.2.26 | 支持通过 Authentik 用户组授予系统管理员（`groups` 声明），可用 `groupsClaim` 自定义声明字段 |
| 0.2.27 | Authentik 超级用户（内置 `authentik Admins` 组）默认即系统管理员，无需额外配置；修正 0.2.26 误请求的 `groups` scope |
| 0.2.28 | Agent 密钥改为可随时查看：创建时用 `CONFIG_ENCRYPTION_KEY` 以 AES-256-GCM 加密保存 token 副本，认证仍只比对 SHA-256 哈希，每次查看写审计日志 |

升级注意：

- 使用用户组授权管理员时，需在 Authentik 的 OAuth2/OIDC Provider Scopes 中加入 `groups` 属性映射（`authentik default OAuth Mapping: OpenID 'groups'`）。
- 使用 RP-Initiated Logout 时，需把 `https://<MCP 域名>/auth/login` 加入 Authentik 的 post-logout redirect URI。
- `0.2.28` 之前创建的 Agent Key 没有加密副本，无法再次查看，需撤销后重新创建。
