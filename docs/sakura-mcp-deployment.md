# Sakura-MCP-Server 生产部署

> [!WARNING]
> 当前 `v0.2.0` 尚未创建正式 Release。生产部署前请固定已验证 commit，先在测试环境完成安装、备份恢复、权限和模型 Provider 演练。

## 推荐拓扑

```text
Internet
   │
   ▼
Nginx :443 / TLS
   │
   ▼
Sakura-MCP-Server 127.0.0.1:3000
   │
   ▼
PostgreSQL 16 + pgvector（Docker 内部网络）
```

只向公网开放 `80/443`，不要开放 `3000/5432`。

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
git checkout main
git pull --ff-only
```

生产部署建议改为固定正式 tag 或经过验证的 commit，不要长期无审查跟随 `main`。

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
4. 生成数据库密码、`SETUP_TOKEN`、`CONFIG_ENCRYPTION_KEY` 和 bootstrap Key；
5. 创建 `.env` 并设置 `600` 权限；
6. 创建 `data/` 并设置 `700` 权限；
7. 执行 `docker compose up -d --build`；
8. 输出安装向导和健康检查地址。

脚本不会打印生成的密钥，也不会覆盖已有 `.env`。首次启动后仍需配置 Nginx HTTPS，再打开 `/setup` 完成 Authentik 和 Provider 设置。脚本必须从仓库根目录执行。

## 创建 `.env`

```bash
cp .env.example .env
chmod 600 .env
```

生成独立随机值：

```bash
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

至少生成：

1. PostgreSQL 密码；
2. `SETUP_TOKEN`；
3. `CONFIG_ENCRYPTION_KEY`；
4. 可选 bootstrap API Key。

推荐配置：

```dotenv
PUBLIC_BASE_URL=https://mcp.example.com
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info

POSTGRES_PASSWORD=<数据库随机密码>
DATABASE_URL=postgresql://sakura:<数据库随机密码>@postgres:5432/sakura_memory
DATABASE_MAX_CONNECTIONS=20
AUTO_MIGRATE=true

SETUP_TOKEN=<独立随机值>
CONFIG_ENCRYPTION_KEY=<独立 32 字节 Base64URL 主密钥>

MCP_API_KEYS=bootstrap-admin:<独立随机值>:memory:read|memory:write|memory:update|memory:delete|memory:export|space:create|space:manage|member:manage|agent:manage|admin:system

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

从 Authentik Discovery 文档复制实际端点：

```text
https://login.example.com/application/o/sakura-mcp/.well-known/openid-configuration
```

需要记录：

```text
Issuer
Client ID
Authorization URL
Token URL
JWKS URI
UserInfo URL（可选）
```

浏览器 ID Token 验证使用 Client ID 作为 audience。远程 MCP JWT 认证推荐使用独立资源 audience，例如 `https://mcp.example.com`；如果 Authentik 没有签发该 audience，可以先让 Agent 使用数据库 API Key。

## 启动服务

```bash
cd /opt/sakura-mcp-server
mkdir -p data
chmod 700 data
docker compose up -d --build
docker compose ps
docker compose logs -f sakura-mcp
```

当前 Compose 项目名固定为 `sakura-mcp-server`，应用使用 `node:24-bookworm-slim` 运行镜像，并以非 root 用户 `mcp` 启动。应用容器默认通过 `host.docker.internal:host-gateway` 访问宿主机 Ollama，且 PostgreSQL 没有公网端口映射。

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

容器只绑定：

```text
127.0.0.1:3000
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
docker compose up -d --build --force-recreate
```

## 首次安装

访问：

```text
https://mcp.example.com/setup
```

向导步骤：

1. 输入 `.env` 中的 `SETUP_TOKEN`；
2. 检查 PostgreSQL、pgvector 和迁移；
3. 配置并测试 Authentik；
4. 可选配置并测试 OpenAI-compatible/Ollama；
5. 填写首位管理员邮箱；
6. 确认 `CONFIG_ENCRYPTION_KEY` 已备份；
7. 完成安装。

安装完成前 `/mcp` 返回 `503 setup_required`。完成后 Setup 写接口返回 `410 setup_locked`，不能通过浏览器远程重装。

## 管理后台与 Agent

访问：

```text
https://mcp.example.com/admin
```

使用安装时登记的管理员邮箱通过 Authentik 登录。进入“Agent 密钥”创建 Token，再给它授予具体空间和 scope。

MCP 连接信息：

```text
URL: https://mcp.example.com/mcp
Authorization: Bearer sk_sakura_<prefix>_<secret>
```

通用配置示例：

```json
{
  "mcpServers": {
    "Sakura-MCP-Server": {
      "url": "https://mcp.example.com/mcp",
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
curl -fsS https://mcp.example.com/.well-known/oauth-protected-resource/mcp
curl -i https://mcp.example.com/mcp
docker compose ps
sudo ss -lntp | grep -E '3000|5432'
```

未认证 `/mcp` 应返回 `401`。3000 应只监听 `127.0.0.1`，5432 不应监听公网。

下一步阅读：[运维、备份、升级与排障](operations.md)。
