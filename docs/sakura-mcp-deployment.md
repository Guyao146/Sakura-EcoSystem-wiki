# Sakura-MCP-Server 生产部署

> [!WARNING]
> `v0.3.1` 已创建正式 Release。生产部署建议固定 `v0.3.1` tag，先在测试环境完成安装、备份恢复、权限和模型 Provider 演练。

## 推荐拓扑

```text
Internet
   │
   ▼
Nginx :443 / TLS
   │
   ▼
Sakura-MCP-Server 127.0.0.1:3001
   │
   ▼
PostgreSQL 16 + pgvector（Docker 内部网络）
```

只向公网开放 `80/443`，不要开放宿主端口 `3001` 或数据库端口 `5432`。

## 环境要求

推荐：

```text
Ubuntu 22.04 / 24.04 LTS
2 vCPU
4 GB RAM
20 GB 可用磁盘
Docker 24+
Docker Compose v2
```

如果本机运行 Ollama，应按模型提高内存或配置 GPU。

需要准备：

```text
mcp.example.com       Sakura-MCP-Server
login.example.com     已有 Authentik
```

## 安装 Docker 与 Nginx

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker nginx
sudo usermod -aG docker "$USER"
```

重新登录 SSH 后验证：

```bash
docker --version
docker compose version
```

## 下载项目

```bash
sudo mkdir -p /opt/sakura-mcp-server
sudo chown "$USER":"$USER" /opt/sakura-mcp-server
git clone https://github.com/Guyao146/Sakura-MCP-Server.git /opt/sakura-mcp-server
cd /opt/sakura-mcp-server
git checkout v0.3.1
```

生产环境使用 `v0.3.1` 或经过 CI 验证的 commit，不要长期无审查跟随 `main`。

## 只拉取 Compose 的生产编排

当前生产 Compose 默认使用 GHCR 预构建镜像，可以只下载 Compose 和环境模板，不需要克隆源码，也不需要服务器安装 Node.js：

```bash
mkdir -p /opt/sakura-mcp-server
cd /opt/sakura-mcp-server
curl -fsSLO https://raw.githubusercontent.com/Guyao146/Sakura-MCP-Server/v0.3.1/docker-compose.yml
curl -fsSLO https://raw.githubusercontent.com/Guyao146/Sakura-MCP-Server/v0.3.1/.env.example
cp .env.example .env
```

编辑 `.env` 填写真实密钥。生产镜像默认是：

```dotenv
SAKURA_MCP_IMAGE=ghcr.io/guyao146/sakura-mcp-server:0.3.1
```

准备数据目录并启动：

```bash
mkdir -p data
chmod 700 data
chmod 600 .env
docker compose pull
docker compose up -d
```

Compose 会先拉取 PostgreSQL 和 Sakura-MCP-Server 生产镜像，然后启动服务。生产镜像支持：

```text
linux/amd64
linux/arm64
```

如需升级版本，只修改镜像 tag，并确保 Compose、`.env.example` 和镜像版本一致：

```dotenv
SAKURA_MCP_IMAGE=ghcr.io/guyao146/sakura-mcp-server:0.3.1
```

本地源码构建使用仓库中的开发 Compose 文件：

```bash
git clone https://github.com/Guyao146/Sakura-MCP-Server.git
cd Sakura-MCP-Server
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

不要在生产环境把 `SAKURA_MCP_IMAGE` 改成 `latest`；固定正式版本便于回滚和审计。

## 无 `.env` 直接启动

`v0.3.1` 的生产 Compose 可以在空目录中只放一个 `docker-compose.yml`，然后直接启动：

```bash
mkdir -p /opt/sakura-mcp-server
cd /opt/sakura-mcp-server
curl -fsSLO https://raw.githubusercontent.com/Guyao146/Sakura-MCP-Server/v0.3.1/docker-compose.yml
mkdir -p data && chmod 700 data
docker compose up -d
```

一次性 `bootstrap-secrets` 容器会自动生成并持久化：

```text
PostgreSQL 密码
CONFIG_ENCRYPTION_KEY
bootstrap Agent Key
```

密钥保存在 Compose 命名卷 `sakura-mcp-server_runtime-secrets`；PostgreSQL 密码通过 `POSTGRES_PASSWORD_FILE` 使用，应用只读挂载 secret 卷。已有 secret 卷不会因为后续环境变量变化而被覆盖，升级时不要删除它。

默认访问：

```text
http://127.0.0.1:3001/setup
```

无 `.env` 模式的容器内 `PUBLIC_BASE_URL` 默认是 `http://localhost:3000`，只适合先启动容器；浏览器从宿主机访问时使用 `http://localhost:3001/setup`。正式域名、认证模式和 Provider 等配置仍建议通过 `.env`、Docker Desktop 或面板环境变量设置，并重新创建应用容器。

## 一键首次部署

Linux 服务器可以使用仓库内的安全首次部署脚本：

```bash
cd /opt/sakura-mcp-server
chmod +x scripts/install.sh
./scripts/install.sh https://mcp.example.com
```

脚本会：

1. 检查 Docker、Docker Compose 和 OpenSSL；
2. 拒绝覆盖已有 `.env`；
3. 校验公网地址必须是 `https://域名`；
4. 生成数据库密码、`CONFIG_ENCRYPTION_KEY` 和 bootstrap Key；
5. 创建 `.env` 并设置 `600` 权限；
6. 创建 `data/` 并设置 `700` 权限；
7. 默认拉取 GHCR 生产镜像并执行 `docker compose up -d`；
8. 输出安装向导和健康检查地址。

脚本不会打印生成的密钥，也不会覆盖已有 `.env`。首次启动后仍需配置 Nginx HTTPS，再打开 `/setup` 完成 Authentik 和 Provider 设置。脚本必须从仓库根目录执行。

如果要在本地源码构建而不拉取 GHCR，明确传入：

```bash
./scripts/install.sh https://mcp.example.com --local-build
```

`--local-build` 使用 `docker-compose.dev.yml`，只适合开发或需要自行构建镜像的环境。

### Windows Docker Desktop

PowerShell 安装器：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\install.ps1 https://mcp.example.com
```

默认拉取 GHCR 镜像；本地源码构建使用：

```powershell
.\scripts\install.ps1 https://mcp.example.com -LocalBuild
```

脚本拒绝覆盖已有 `.env`，会生成数据库密码、配置加密密钥和 bootstrap Key。

## 创建 `.env`

```bash
cp .env.example .env
chmod 600 .env
```

生成独立随机值：

```bash
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

手工 `.env` 部署至少生成：

1. PostgreSQL 密码；
2. `CONFIG_ENCRYPTION_KEY`；
3. 可选 bootstrap API Key。

推荐配置：

```dotenv
PUBLIC_BASE_URL=https://mcp.example.com
HOST=0.0.0.0
PORT=3000
MCP_HOST_PORT=3001
LOG_LEVEL=info

POSTGRES_PASSWORD=<数据库随机密码>
DATABASE_URL=postgresql://sakura:<数据库随机密码>@postgres:5432/sakura_memory
DATABASE_MAX_CONNECTIONS=20
AUTO_MIGRATE=true

CONFIG_ENCRYPTION_KEY=<独立 32 字节 Base64URL 主密钥>

MCP_API_KEYS=bootstrap-admin:<独立随机值>:memory:read|memory:write|memory:update|memory:delete|memory:export|space:create|space:manage|member:manage|agent:manage|admin:system

AUTH=true
AUTHENTIK_ISSUER=
AUTHENTIK_AUDIENCE=
AUTHENTIK_JWKS_URI=
AUTHENTIK_SCOPE_CLAIM=scope

OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_CHAT_MODEL=
OPENAI_COMPATIBLE_EMBEDDING_MODEL=

OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_CHAT_MODEL=
OLLAMA_EMBEDDING_MODEL=

WORKER_ENABLED=true
WORKER_POLL_INTERVAL_MS=2000
WORKER_STALE_AFTER_SECONDS=900

TRUST_PROXY=true
RATE_LIMIT_MCP_PER_MINUTE=120
RATE_LIMIT_WEB_PER_MINUTE=300
RATE_LIMIT_AUTH_PER_MINUTE=20
RATE_LIMIT_SETUP_PER_MINUTE=10

AUDIT_LOG_PATH=/app/data/audit.jsonl
```

`CONFIG_ENCRYPTION_KEY` 必须离线备份；它丢失以后，数据库中的 Provider Key 无法解密。

安装完成并确认 Authentik、数据库 Agent Key 可用后，应删除 `.env` 中的 bootstrap Key 并重建容器。

## Authentik 配置

进入 Authentik：

```text
Applications → Applications → New Application
```

选择：

```text
Provider Type: OAuth2/OIDC
Client Type: Public
Authorization Flow: Authorization Code
PKCE: S256 / Required
```

精确 Redirect URI：

```text
https://mcp.example.com/auth/callback
```

不要使用通配符。Scopes 至少包括：

```text
openid profile email
```

确保 Token 返回 `sub`、`email`，以及 `name` 或 `preferred_username`。

安装向导可以根据 Authentik 根地址和应用 Slug 自动读取 Discovery 文档：

```text
https://login.example.com/application/o/sakura-mcp/.well-known/openid-configuration
```

向导自动回填：

```text
Issuer
Client ID
Authorization URL
Token URL
JWKS URI
UserInfo URL（可选）
```

Audience 和 Client ID 不在通用 Discovery 文档中，仍需手工填写。浏览器 ID Token 验证使用 Client ID 作为 audience。远程 MCP JWT 认证推荐使用独立资源 audience，例如 `https://mcp.example.com`；如果 Authentik 没有签发该 audience，可以先让 Agent 使用数据库 API Key。

安装完成前，向导会向 Token Endpoint 发送无效授权码进行 Public Client + PKCE 预检。返回 `invalid_grant` 才表示客户端身份方式正确；`invalid_client` 会阻止安装，并提示检查 Public Client 和 Client ID。

## 启动服务

```bash
cd /opt/sakura-mcp-server
mkdir -p data
chmod 700 data
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f sakura-mcp
```

当前 Compose 项目名固定为 `sakura-mcp-server`，应用使用 `node:24-bookworm-slim` 运行镜像，并以非 root 用户 `mcp` 启动。宿主机默认绑定 `127.0.0.1:3001`，转发到容器内部 3000；应用容器默认通过 `host.docker.internal:host-gateway` 访问宿主机 Ollama，且 PostgreSQL 没有公网端口映射。

应用启动时按文件名顺序执行 `migrations/*.sql`。不要手工修改 `schema_migrations`。

## Nginx 与 HTTPS

先为域名配置 HTTP 站点并申请证书：

```bash
sudo certbot --nginx -d mcp.example.com
sudo certbot renew --dry-run
```

然后复制示例：

```bash
sudo cp nginx-mcp.conf.example /etc/nginx/sites-available/sakura-mcp
sudo nano /etc/nginx/sites-available/sakura-mcp
```

修改：

```nginx
server_name mcp.example.com;
ssl_certificate /etc/letsencrypt/live/mcp.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/mcp.example.com/privkey.pem;
```

增加 HTTP 跳转：

```nginx
server {
    listen 80;
    server_name mcp.example.com;
    return 301 https://$host$request_uri;
}
```

应用配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

容器默认只绑定：

```text
127.0.0.1:3001
```

当应用只能由受信任 Nginx 访问时，才能设置 `TRUST_PROXY=true`。

## Ollama 访问宿主机

Linux Docker 可能不能解析 `host.docker.internal`。在 `sakura-mcp` 服务中增加：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

重新创建：

```bash
docker compose up -d --force-recreate sakura-mcp
```

## 首次安装

访问：

```text
https://mcp.example.com/setup
```

向导步骤：

1. 自动检查 PostgreSQL、pgvector、迁移和认证模式；
2. `AUTH=true` 时填写 Authentik 根地址和应用 Slug，自动发现 OpenID 端点；
3. 填写 Audience、Public Client ID 和管理员邮箱；
4. 运行 JWKS、OIDC Metadata 和 Public Client + PKCE 预检；
5. 可选配置并测试 OpenAI-compatible/Ollama；
6. 确认 `CONFIG_ENCRYPTION_KEY` 已备份；
7. 完成安装。

安装向导不再需要 Setup Token。安装完成前，任何能访问 `/setup` 的人都可以发起首次安装；公网应临时限制 `/setup` 和 `/api/setup/` 为管理员 IP。根域名 MCP 请求和 `/mcp` 返回 `503 setup_required`。完成后 Setup 写接口返回 `410 setup_locked`，不能通过浏览器远程重装。

### 私有网络无认证模式

认证默认启用。只有服务器已经通过防火墙、VPN、Cloudflare Access 或反向代理白名单限制访问时，才可以设置：

```dotenv
AUTH=false
```

也兼容小写 `auth=false`。该模式会跳过 Authentik 步骤，并让所有网络访问者使用同一个本地系统管理员身份；`/admin`、根域名 MCP 和 `/mcp` 都不要求登录或 Bearer Token。因此它不适合公网部署。

修改认证模式后重建应用容器：

```bash
docker compose up -d --force-recreate sakura-mcp
```

### Authentik 锁定恢复

如果错误的 Authentik 配置导致管理员无法登录：

1. 先在网络层只允许管理员来源；
2. 临时设置 `AUTH=false` 并重建应用容器；
3. 打开 `/admin` 的“身份认证”页面；
4. 测试并保存正确的 Issuer、JWKS、Client ID、授权/令牌地址和管理员邮箱；
5. 恢复 `AUTH=true` 并重建应用容器；
6. 从 `/auth/login` 发起新登录，不要复用旧 callback URL。

恢复模式会临时赋予所有网络访问者系统管理员权限，严禁在没有访问限制的公网开启。

## 管理后台与 Agent

访问：

```text
https://mcp.example.com/admin
```

使用安装时登记的管理员邮箱通过 Authentik 登录。进入“Agent 密钥”创建 Token，再给它授予具体空间和 scope。

MCP 连接信息：

```text
推荐 URL: https://mcp.example.com
兼容 URL: https://mcp.example.com/mcp
Authorization: Bearer sk_sakura_<prefix>_<secret>
```

通用配置示例：

```json
{
  "mcpServers": {
    "Sakura-MCP-Server": {
      "url": "https://mcp.example.com",
      "headers": {
        "Authorization": "Bearer sk_sakura_xxxxx_xxxxx"
      }
    }
  }
}
```

## 验证

```bash
curl -fsS https://mcp.example.com/health
curl -fsS https://mcp.example.com/.well-known/oauth-protected-resource
curl -fsS https://mcp.example.com/.well-known/oauth-protected-resource/mcp
curl -i https://mcp.example.com/mcp
docker compose ps
sudo ss -lntp | grep -E '3001|5432'
```

`AUTH=true` 时未认证根域名 MCP 请求和 `/mcp` 应返回 `401`。3001 应只监听 `127.0.0.1`，5432 不应监听公网。

下一步阅读：[运维、备份、升级与排障](operations.md)。
