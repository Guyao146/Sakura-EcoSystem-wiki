# 配置与密钥规范

## 数据最小化

DSH Activity Tracker 的默认能力是本地统计。启用远端工作区动态后，也应只授权需要展示的工作区；“允许查看会话详情”会扩大数据暴露范围，建议默认关闭。

Life Dashboard 的私密配置通过服务器权限网关下发。普通用户、本地浏览器登录和未登录请求都不应获得 Home Assistant Token。

## Sakura-MCP-Server

- 每条记忆必须属于空间；每次读取、检索、更新和删除都重新验证当前用户的空间成员关系。
- Agent scope 与空间角色取交集，`memory_id`、`space_id` 和邀请 ID 都不是访问凭证。
- 每个 Agent 使用独立密钥；正式 Agent Secret 和空间邀请 Token 在数据库中只保存哈希。
- Authentik Access Token 必须验证 issuer、audience、过期时间和 JWKS 签名，不能透传给模型 Provider。
- OpenAI-compatible API Key 使用服务器 `CONFIG_ENCRYPTION_KEY` 进行 AES-256-GCM 加密；浏览器和 Agent 不应读取密钥明文。
- `CONFIG_ENCRYPTION_KEY` 必须离线备份并限制文件权限。丢失后应轮换 Provider Key，而不是尝试绕过加密。
- 首次安装接口由 `SETUP_TOKEN` 保护；安装完成后写接口必须锁定，不能提供远程恢复出厂设置。
- 高敏感空间应优先使用本地 Ollama，或关闭自动提取；发送到外部模型前必须得到空间策略授权。
- 删除分为软删除和永久删除；永久删除需要管理员权限，并应进入审计记录。
- Web 登录使用 Authorization Code + PKCE；Session Token 只保存哈希，写请求还必须验证 Session 绑定的 CSRF Token。
- MCP、Web、登录和安装接口使用独立速率限制；只有应用确实只能由受信任反向代理访问时才启用 `TRUST_PROXY`。
- 审计 Metadata 必须递归脱敏正文、Token、Cookie、Authorization、Password 和 API Key；普通用户不能读取其他租户审计。
- PostgreSQL 不映射公网端口，MCP 应用端口只绑定 `127.0.0.1`，公网只开放 HTTPS。
- 备份必须同时包含数据库、`.env`、Nginx 配置和 `CONFIG_ENCRYPTION_KEY` 的离线副本。

## 生产发布检查

- TypeScript、单元测试和真实 pgvector 集成测试通过；
- `npm audit --omit=dev` 无 High/Critical；
- Docker Compose 配置检查通过；
- Trivy 镜像扫描无可修复 High/Critical；
- 完成恢复演练，而不只是生成备份文件；
- 目标 commit 的 GitHub Actions 为绿色。