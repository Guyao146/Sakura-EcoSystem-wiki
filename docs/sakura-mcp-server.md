# Sakura-MCP-Server

仓库：[Guyao146/Sakura-MCP-Server](https://github.com/Guyao146/Sakura-MCP-Server) · 许可证 `LGPL-v2.1`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![MCP Server](https://img.shields.io/badge/MCP-Server-7c5cff)](https://modelcontextprotocol.io/)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

Sakura-MCP-Server 是面向所有兼容 Model Context Protocol（MCP）的 AI Agent 的多用户长期记忆平台。Claude、Cline、Cursor、Windsurf 以及其他支持远程 MCP 的 Agent，可以在经过授权后，把事实、偏好、人物、事件、任务、项目、文档摘要和对话结论写入同一个记忆库，并在未来会话中检索和召回。

它不是某几个业务项目的专用 API 网关。外部项目和服务只作为可选 Connector 接入统一记忆模型；核心服务负责身份、空间、权限、记忆治理、检索、模型 Provider 与审计。

## 核心能力

### 跨 Agent 长期记忆

- 多个 Agent 使用同一个 HTTPS MCP 地址连接。
- 每个 Agent 使用独立凭据和最小权限 scope。
- 记忆不依赖单次对话连接，服务端使用不透明 UUID 持久化。
- Agent 可以显式写入、搜索、召回、更新和遗忘记忆。
- 记忆保留来源、版本、重要性、置信度、敏感级别和有效时间。

### 多用户与空间

每个 Authentik 用户首次进入系统时自动创建个人空间；用户也可以创建共享空间并邀请其他成员。

| 角色 | 主要能力 |
| --- | --- |
| `owner` | 管理空间、成员、配置和全部记忆 |
| `admin` | 邀请成员、管理空间设置和记忆 |
| `editor` | 创建、更新、归档和软删除记忆 |
| `contributor` | 创建新记忆 |
| `viewer` | 浏览、搜索和召回记忆 |

权限由用户身份、Agent scope、目标空间角色和操作类型共同决定。仅知道 `space_id` 或 `memory_id` 不能取得访问权。

### 记忆治理

一条记忆可以包含：

```text
类型、正文、摘要、标签
重要性、置信度、敏感级别
有效起止时间、自动过期时间
来源类型、来源 URI、来源 Agent
状态、替代关系、创建者
版本、关系、反馈、向量
```

记忆状态包括：

- `active`：当前有效；
- `pending_confirmation`：等待用户确认；
- `superseded`：已被新事实替代；
- `archived`：保留但不参与默认召回；
- `deleted`：软删除，等待恢复或彻底清除。

更新操作会写入版本快照。永久删除需要目标空间的管理员权限，普通编辑操作不能直接绕过恢复机制。

## MCP Tools

开发分支当前提供以下通用工具：

| Tool | Scope | 作用 |
| --- | --- | --- |
| `memory_remember` | `memory:write` | 向个人空间或有权限的共享空间写入记忆 |
| `memory_search` | `memory:read` | 按正文、摘要、类型和标签搜索 |
| `memory_recall` | `memory:read` | 根据当前上下文召回相关长期记忆 |
| `memory_get` | `memory:read` | 读取单条记忆 |
| `memory_update` | `memory:update` | 更新记忆并保留版本 |
| `memory_forget` | `memory:delete` | 软删除或管理员永久删除 |
| `space_list` | `memory:read` | 列出当前用户可访问的空间 |
| `space_create` | `space:create` | 创建共享空间并成为 owner |
| `space_list_members` | `memory:read` | 查看空间成员与角色 |
| `space_invite_member` | `member:manage` | 创建限时、一次性邮箱邀请 |
| `space_accept_invitation` | `memory:read` | 使用当前 Authentik 邮箱接受邀请 |

规划中的工具包括记忆关系、批量导入、冲突处理、反馈、导出、Agent Key 管理和空间策略管理。尚未完成的工具不会返回伪造数据或静默降级为无权限操作。

## 存储与检索

服务使用 PostgreSQL `16` 与 pgvector。结构化数据和向量保存在同一数据库中，避免只使用向量数据库时难以完成版本、关系、权限、删除和审计的问题。

`v0.2.0` 的目标架构如下，其中 Web 管理后台和自动整理 Worker 仍在开发：

```text
AI Agent / Web 管理后台（开发中）
             │
             ▼
     Sakura-MCP-Server
        ├─ 空间权限
        ├─ 记忆 CRUD
        ├─ 全文检索
        ├─ 自动整理 Worker（开发中）
        └─ Provider
             │
             ▼
   PostgreSQL + pgvector
```

当前基础检索使用 PostgreSQL 全文索引、类型和标签过滤，并结合重要性与更新时间排序。后续混合检索会组合：

```text
向量相似度
+ 全文相关度
+ 重要性与置信度
+ 时间衰减
+ 用户反馈
```

数据库结构已经为每个空间绑定 Embedding Provider、模型和向量维度预留配置；自动生成和重建向量的后台任务仍在开发。更换模型时需要重新生成向量；原始记忆正文始终保留，不以向量代替原文。

## AI Provider

### OpenAI-compatible

兼容 `/chat/completions` 和 `/embeddings` 的服务都可以接入，包括 OpenAI、中转站和自托管兼容接口。

```dotenv
OPENAI_COMPATIBLE_BASE_URL="https://api.example.com/v1"
OPENAI_COMPATIBLE_API_KEY=""
OPENAI_COMPATIBLE_CHAT_MODEL=""
OPENAI_COMPATIBLE_EMBEDDING_MODEL=""
```

### Ollama

本地 Ollama 使用 `/api/chat` 和 `/api/embed`，适合禁止内容离开服务器的私密空间。

```dotenv
OLLAMA_BASE_URL="http://host.docker.internal:11434"
OLLAMA_CHAT_MODEL=""
OLLAMA_EMBEDDING_MODEL=""
```

模型生成的结构化记忆必须通过 JSON Schema 校验。字段缺失、类型错误或无法解析的结果不会写入数据库；模型调用失败也不会导致原始输入丢失。

## 运行要求

- Docker Engine 与 Docker Compose；
- 可用于反向代理的 Nginx、Caddy 或同类服务；
- 生产环境 HTTPS 域名；
- Authentik OAuth/OIDC Provider；
- 可选的 OpenAI-compatible 服务或 Ollama；
- 从源码运行时需要 Node.js `22+`。

## Docker 部署

```bash
git clone https://github.com/Guyao146/Sakura-MCP-Server.git
cd Sakura-MCP-Server
cp .env.example .env
chmod 600 .env
docker compose up -d --build
```

Compose 包含两个服务：

| 服务 | 镜像/来源 | 网络暴露 |
| --- | --- | --- |
| `postgres` | `pgvector/pgvector:pg16` | 仅 Compose 内部网络 |
| `sakura-mcp` | 当前仓库 Dockerfile | 默认绑定服务器 `127.0.0.1:3000` |

PostgreSQL 使用持久化 volume，MCP 容器使用只读根文件系统、`no-new-privileges` 和独立审计日志目录。生产环境只开放 HTTPS `443`，不直接公开 PostgreSQL 或 `3000` 端口。

## 首次安装向导

数据库地址无法由 Web 页面在服务启动前配置，因此 `.env` 至少需要先填写：

```dotenv
PUBLIC_BASE_URL="https://mcp.example.com"
DATABASE_URL="postgresql://sakura:密码@postgres:5432/sakura_memory"
POSTGRES_PASSWORD="数据库密码"
SETUP_TOKEN="至少 32 位随机字符串"
CONFIG_ENCRYPTION_KEY="32 字节 Base64URL 主密钥"
```

生成随机值：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

命令运行两次，分别作为安装令牌和配置加密主密钥。`CONFIG_ENCRYPTION_KEY` 必须离线备份；丢失后数据库中已加密的 Provider API Key 无法恢复。

启动后访问：

```text
https://mcp.example.com/setup
```

中文安装向导依次完成：

1. 使用 `SETUP_TOKEN` 检查 PostgreSQL、pgvector 和迁移；
2. 配置并测试 Authentik Issuer、Audience、JWKS 与首位管理员邮箱；
3. 可选配置并测试 OpenAI-compatible 或 Ollama；
4. 确认主密钥已备份，事务化写入配置并锁定安装入口。

安装完成前，`/mcp` 返回 `503 setup_required`。安装完成后，Setup 写接口返回 `410 setup_locked`；安装令牌不能用于远程重新安装，Web 页面也不提供恢复出厂设置按钮。

## Authentik 与 Agent 认证

### Authentik JWT

服务验证 JWT 的签发者、受众、过期时间和 JWKS 签名。Authentik Provider 必须为 MCP 配置独立 audience，并提供标准 `scope` 或自定义 scope claim。

```dotenv
AUTHENTIK_ISSUER="https://login.example.com/application/o/sakura-mcp/"
AUTHENTIK_AUDIENCE="https://mcp.example.com"
AUTHENTIK_JWKS_URI="https://login.example.com/application/o/sakura-mcp/jwks/"
AUTHENTIK_SCOPE_CLAIM="scope"
```

首位管理员邮箱在安装时进入服务端白名单。该邮箱对应用户首次登录后自动获得系统管理员标记；邮箱比较不区分大小写。

### Agent API Key

开发阶段保留 `.env` 引导 Key；正式的 Agent Key 将由管理后台创建，归属于用户并绑定空间、scope、过期时间和撤销状态。每个 Agent 应使用独立密钥，不应在 Claude、Cline、自动化脚本之间复用。

```http
Authorization: Bearer <Agent 独立密钥>
```

## MCP 与 HTTP 入口

| 路径 | 权限/作用 |
| --- | --- |
| `/mcp` | MCP Streamable HTTP，Bearer 认证 |
| `/health` | 数据库健康检查 |
| `/.well-known/oauth-protected-resource/mcp` | RFC 9728 授权服务器发现 |
| `/setup` | 首次安装页面 |
| `/api/setup/status` | 只返回安装完成状态 |
| `/api/setup/diagnostics` | 安装令牌保护的数据库诊断 |
| `/api/setup/test-authentik` | 测试 OIDC Metadata 与 JWKS |
| `/api/setup/test-provider` | 测试 OpenAI-compatible 或 Ollama |
| `/api/setup/complete` | 完成并锁定安装 |

MCP transport 使用无状态请求模式：每个请求重新验证 Bearer 身份并创建权限受限的工具表，避免一个客户端的连接状态被另一个用户复用。

## 数据与安全边界

- Provider API Key 使用 `AES-256-GCM` 加密后保存，主密钥只来自服务器环境变量。
- Setup Token 使用恒定时间比较，安装完成后不再具备配置能力。
- 邀请 Token 和正式 Agent Secret 在数据库中只保存哈希。
- MCP 用户 Token 不会透传给模型 Provider 或其他下游服务。
- 每次读取和修改都重新检查空间成员关系，ID 不是访问凭证。
- 记忆支持敏感级别、有效期、软删除、版本和审计。
- 安装页面不会显示已经保存的模型 API Key。
- 生产环境必须使用 HTTPS，并将 `.env` 设置为仅服务账户可读。

## 源码结构

```text
src/index.ts                    # HTTP、Setup、OAuth Metadata 与 MCP 入口
src/auth.ts                     # API Key 与 Authentik JWT 验证
src/database.ts                 # PostgreSQL 连接和顺序迁移
src/tools.ts                    # 通用记忆与空间 MCP Tools
src/memory/                     # 记忆仓库、类型和空间权限
src/spaces/                     # 共享空间、成员和邀请
src/providers/                  # OpenAI-compatible 与 Ollama
src/settings/                   # 安装配置与 AES-256-GCM 加密
src/setup/                      # 首次安装服务与中文向导页面
migrations/                     # 多租户记忆平台和安装状态迁移
tests/                          # 单元测试与 pgvector 集成测试
Dockerfile
docker-compose.yml
nginx-mcp.conf.example
```

## 测试、发布与当前状态

GitHub Actions 会启动真实的 `pgvector/pgvector:pg16`，执行所有迁移、安装事务、配置加密和管理员映射测试，再构建 Docker 镜像。推送 `v*` 标签后，Release 工作流执行测试、生成 npm tarball 并创建 GitHub Release。

当前公开 Release `v0.1.0` 是早期安全 MCP 网关；通用 AI 记忆平台 `v0.2.0` 正在 `feature/ai-memory-v0.2` 分支开发。

`v0.2.0` 已完成多租户 Schema、基础记忆 CRUD、共享空间与邀请、两类 Provider、安装向导和数据库集成测试。完整 Web 管理后台、数据库 Agent Key、异步自动提取、向量混合检索、冲突确认、导入导出和 MCP Resources 仍在开发中。

> 本页保留部署、权限和使用路径。实现细节、最新提交与问题跟踪以项目仓库的 README、分支、Release 和 Issue 为准。