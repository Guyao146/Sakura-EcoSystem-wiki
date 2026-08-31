# 运维、备份、升级与排障

本页以 Sakura-MCP-Server 的 Docker Compose 部署为主，同时列出樱落生态通用运维原则。

## 日常检查

```bash
cd /opt/sakura-mcp-server
docker compose ps
docker compose logs --tail=100 sakura-mcp
docker compose logs --tail=100 postgres
curl -fsS https://mcp.example.com/health
```

健康响应包含：

```text
database
pgvector
installed
worker.enabled
worker.pending
worker.processing
worker.failed
```

建议监控：

- `/health` HTTP 状态；
- PostgreSQL 数据卷使用量；
- `failed` Worker 任务；
- 审计中的连续 `error`；
- Nginx 401、403、429、5xx；
- 证书到期时间；
- Provider 请求失败率。

## 数据库备份

创建自定义格式备份：

```bash
cd /opt/sakura-mcp-server
mkdir -p backups
chmod 700 backups
docker compose exec -T postgres \
  pg_dump -U sakura -d sakura_memory -Fc \
  > "backups/sakura-memory-$(date +%F-%H%M).dump"
chmod 600 backups/*.dump
```

同时备份：

```text
.env
/etc/nginx/sites-available/sakura-mcp
CONFIG_ENCRYPTION_KEY 的离线副本
Compose 命名卷 `sakura-mcp-server_runtime-secrets`（无 `.env` 部署）
```

只有数据库备份而没有 `CONFIG_ENCRYPTION_KEY`，无法解密 Provider Key。

无 `.env` Compose 部署的密钥位于 `runtime-secrets` 卷。升级时不要执行 `docker compose down -v`，否则会同时删除运行密钥和 PostgreSQL 数据卷。

可以检查命名卷：

```bash
docker volume ls | grep sakura-mcp-server
```

至少应保留 `sakura-mcp-server_postgres-data` 和 `sakura-mcp-server_runtime-secrets`。迁移到新服务器时，除数据库备份外，还必须安全迁移 `runtime-secrets` 中的 `CONFIG_ENCRYPTION_KEY`，或使用原 `.env` 中的同一密钥重新配置。

### 建议保留策略

```text
每日：7 份
每周：4 份
每月：12 份
```

至少有一份备份离开当前服务器，并对备份进行加密。

## 恢复演练

恢复前先备份当前数据库。停止应用，保留 PostgreSQL：

```bash
docker compose stop sakura-mcp
```

重建数据库：

```bash
docker compose exec -T postgres dropdb -U sakura --if-exists sakura_memory
docker compose exec -T postgres createdb -U sakura sakura_memory
docker compose exec -T postgres \
  pg_restore -U sakura -d sakura_memory --clean --if-exists \
  < backups/sakura-memory-YYYY-MM-DD-HHMM.dump
```

启动并验证：

```bash
docker compose start sakura-mcp
docker compose logs -f --tail=100 sakura-mcp
curl -fsS https://mcp.example.com/health
```

恢复必须使用原来的 `CONFIG_ENCRYPTION_KEY`。建议先在隔离测试服务器演练，不要第一次就在生产环境执行。

## 升级

升级前：

```bash
docker compose exec -T postgres \
  pg_dump -U sakura -d sakura_memory -Fc \
  > "backups/pre-upgrade-$(date +%F-%H%M).dump"
cp .env "backups/env-$(date +%F-%H%M)"
```

升级：

```bash
# 下载目标版本的 docker-compose.yml；仓库部署则切换对应 tag
docker compose pull
docker compose up -d
docker compose logs -f --tail=100 sakura-mcp
```

验证：

```bash
curl -fsS https://mcp.example.com/health
docker compose ps
```

数据库迁移按文件名执行，是 forward-only。不要手工删除 `schema_migrations` 记录。应用代码回滚不等于数据库回滚；需要回滚数据库时必须恢复升级前备份。

### 从旧版本升级到 `v0.2.28`

从 `v0.2.1` 起这是一次结构性升级，不能只替换版本号：

- 宿主端口默认从 `3000` 改为 `3001`（`MCP_HOST_PORT`）。更新反向代理 `proxy_pass` 目标和防火墙规则，容器内部仍监听 3000。
- 推荐 MCP 地址从 `/mcp` 改为公网根域名；`/mcp` 保留兼容。更新 Agent 配置时优先使用根域名。
- Compose 可以无 `.env` 启动，一次性 `bootstrap-secrets` 生成并持久化 `runtime-secrets` 卷。升级已有 `.env` 部署时保留原 `.env`，不要执行 `docker compose down -v`。
- 首次安装不再需要 `SETUP_TOKEN`；旧 `.env` 中的 `SETUP_TOKEN` 会被忽略，可以保留或删除。
- `0.2.28` 起数据库迁移到 `008_agent_secret_reveal.sql`，为 Agent Key 增加加密副本列。迁移是 forward-only，升级前务必备份。
- GHCR 镜像固定为 `ghcr.io/guyao146/sakura-mcp-server:0.2.28`，不要使用 `latest`。
- 确认认证模式：公网必须保持 `AUTH=true`；`AUTH=false` 仅限已隔离的私有网络。
- 若使用 Authentik 用户组授权管理员，需在 Provider Scopes 中加入 `groups` 属性映射；使用 RP-Initiated Logout 需把 `/auth/login` 加入 post-logout redirect URI。

升级步骤：

```bash
# 备份数据库和 .env，见上文
curl -fsSLO https://raw.githubusercontent.com/Guyao146/Sakura-MCP-Server/v0.2.28/docker-compose.yml
docker compose pull
docker compose up -d
curl -fsS https://mcp.example.com/health
```

### 升级到 `v0.3.1`

从 `v0.3.0` 升级只需替换镜像版本，但带一次数据库迁移：

- `009_login_probe.sql` 为 `oidc_login_attempts` 增加 `purpose` 列，用于隔离「静默探测」与真实登录事务。迁移是 forward-only 的加列操作，升级前仍应备份。
- 登录页新增「以 *** 的身份登录」。该功能要求 Authentik 侧对应 Provider 的同意模式为隐式（implicit consent）；若配置为每次登录都需确认，探测会返回 `consent_required`，页面静默回退到普通登录流程，不报错但功能不生效。
- 登录页从 `api.mcylyr.cn` 加载自托管字体。若该资源域不可达，浏览器会静默回退系统字体，页面功能不受影响。
- 不需要在 Authentik 新增 redirect URI，探测复用现有的 `/auth/callback`。

```bash
# 备份数据库和 .env，见上文
curl -fsSLO https://raw.githubusercontent.com/Guyao146/Sakura-MCP-Server/v0.3.1/docker-compose.yml
docker compose pull
docker compose up -d
curl -fsS https://mcp.example.com/health   # 确认 version 为 0.3.1
```

当前生产容器来自 GHCR 版本镜像，内部使用 `node:24-bookworm-slim`，运行容器由 Debian `groupadd/useradd` 创建的非 root `mcp` 用户启动。Compose 使用 `pull_policy: always`，版本升级应执行 `docker compose pull && docker compose up -d`；本地源码构建才使用 `docker-compose.dev.yml`。

生产 Compose 当前默认使用 `ghcr.io/guyao146/sakura-mcp-server:0.3.1` 多架构镜像。升级前先备份，再下载对应版本的 Compose/模板并执行 `docker compose pull && docker compose up -d`。管理后台会显示当前版本，并允许系统管理员检查 GitHub 最新 Release，但不会自动执行升级。本地源码构建应使用 `docker-compose.dev.yml`，不要用开发构建覆盖生产镜像。

## Worker 运维

管理后台“后台任务”页面支持：

- 按空间查看任务；
- 重建 Embedding；
- 取消 pending/processing 任务；
- 重试 failed/cancelled 任务。

任务长时间停留在 processing 时，先检查 Provider 和日志。超过 `WORKER_STALE_AFTER_SECONDS` 后，其他 Worker 会恢复任务。

多个副本可以同时开启 Worker，因为任务通过 `FOR UPDATE SKIP LOCKED` 原子领取。若想独立部署纯 API 副本，可设置：

```dotenv
WORKER_ENABLED=false
```

## 审计日志

主要审计位于 PostgreSQL `audit_logs`，应急副本位于：

```text
./data/audit.jsonl
```

管理后台可以按空间、动作和结果查询。正文、Token、Cookie、API Key、Authorization 等字段会脱敏；不要把应用 debug 日志设置为长期公开可读。

建议对 `data/` 设置：

```bash
chmod 700 data
```

## 密钥轮换

### Agent Key

1. 创建新 Agent Key；
2. 配置同样的空间 grant；
3. 更新 Agent 客户端；
4. 验证连接；
5. 撤销旧 Key。

### Provider API Key

在管理后台更新 Provider Key。新值会使用 AES-256-GCM 加密保存，旧值不返回浏览器。

### 首次安装入口

当前版本不再使用 `SETUP_TOKEN`。安装完成后 Setup 写接口永久锁定；未安装阶段应在 Nginx、VPN 或防火墙中限制 `/setup` 和 `/api/setup/`，并尽快完成安装。

### CONFIG_ENCRYPTION_KEY

不要直接修改。更换主密钥需要先解密并重新加密所有受保护配置；当前版本没有在线轮换向导。丢失时只能重新填写并轮换 Provider Key。

## 常见故障

### `/health` 返回 503

```bash
docker compose ps
docker compose logs postgres
docker compose logs sakura-mcp
```

常见原因：

- `DATABASE_URL` 密码不一致；
- PostgreSQL 未健康；
- pgvector 不存在；
- 数据卷权限或空间不足；
- 数据库迁移失败。

### 安装页面无法检查环境

检查 `/assets/setup.js` 和 `/api/setup/status` 是否被 Nginx 正确代理到 `127.0.0.1:3001`。修改 Compose 环境变量后需要执行：

```bash
docker compose up -d --force-recreate sakura-mcp
```

### Authentik callback 失败

检查：

- Redirect URI 是否完全等于 `/auth/callback`；
- Client 是否为 Public；
- PKCE 是否为 S256；
- Issuer 和 Client ID；
- JWKS URI 是否来自 Discovery；
- 服务器时间。

错误信息会显示经过限制和清理的 OAuth `error` / `error_description`：

- `invalid_client`：检查 Provider 是否为 Public、Client ID 和客户端认证方法；
- `invalid_grant`：检查回调地址，并从 `/auth/login` 重新发起登录，不能刷新旧 callback URL。

如果完全无法登录，先限制管理端来源，再临时设置 `AUTH=false`，进入 `/admin` 的“身份认证”页测试并保存，随后恢复 `AUTH=true`。

安装向导和身份认证页会执行 Public Client + PKCE 预检：只有预期的 `invalid_grant` 代表客户端身份方式正确；`invalid_client` 表示 Provider 不是 Public Client、Client ID 错误或认证方法不兼容。

```bash
timedatectl status
```

### Agent 认证成功但看不到空间

必须同时满足：

```text
Agent 全局 scope
Agent 空间 grant
所属用户是空间成员
用户空间角色允许该操作
```

### Embedding 一直 failed

检查空间 AI 策略、Provider Base URL、模型名称和容器到 Provider 的网络。高敏感空间如果启用了隐私模式，只能使用 Ollama。

修复后在“后台任务”中发起空间向量重建。

### Ollama 连接失败

宿主机测试：

```bash
curl http://127.0.0.1:11434/api/tags
```

Linux Docker 增加：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### 429 Too Many Requests

检查应用返回的：

```text
RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset
Retry-After
```

如果通过 Nginx 部署，确认应用不能被公网绕过，并设置 `TRUST_PROXY=true`；否则保持 `false`，避免伪造 `X-Forwarded-For`。

## 安全更新检查

项目 CI 执行：

```text
npm audit --omit=dev --audit-level=high
真实 PostgreSQL + pgvector 集成测试
Docker 构建
Docker Compose 校验
Trivy HIGH/CRITICAL 镜像扫描
```

部署前确认目标 commit 的 GitHub Actions 为绿色，不要只根据版本字段判断可发布状态。当前 Trivy 以报告模式运行：它会输出基础镜像的 HIGH/CRITICAL 风险，但不会因为上游基础镜像临时 CVE 阻塞应用测试和 Compose 校验；`npm audit --omit=dev --audit-level=high` 仍会阻塞 CI。

## 其他生态项目

- Life Dashboard 升级应先备份 `.env`，并确认 Nginx 禁止访问点文件。
- DSH Activity Tracker 默认数据保留在本机；远端连接只授权必要工作区。
- DSH 插件升级后应重启 DSH Web，并确认插件 profile 为 `web`。
