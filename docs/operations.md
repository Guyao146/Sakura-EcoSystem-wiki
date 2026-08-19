# 更新与发布

## 推荐方案：GitHub Actions + SSH

你的仓库是 [Guyao146/Sakura-EcoSystem-wiki](https://github.com/Guyao146/Sakura-EcoSystem-wiki)，推荐让 GitHub Actions 在 `main` 分支收到 push 后，通过 SSH 登录服务器并执行同步脚本。完整链路如下：

```text
git push origin main
        │
        ▼
GitHub Actions ── SSH ──> wiki.mcylyr.cn 服务器
                              │
                    git fetch + reset
                              │
                         Nginx 提供文件
```

### 1. 首次准备服务器

以下命令在服务器执行。将路径替换成你实际的网站目录：

```bash
sudo mkdir -p /srv/Sakura-EcoSystem-wiki
sudo chown -R "$USER":"$USER" /srv/Sakura-EcoSystem-wiki
git clone https://github.com/Guyao146/Sakura-EcoSystem-wiki.git /srv/Sakura-EcoSystem-wiki
cd /srv/Sakura-EcoSystem-wiki
git switch main
```

让 Nginx 的 `root` 指向 `/srv/Sakura-EcoSystem-wiki`。服务器必须已经安装 Git，并且能访问 GitHub。

### 2. 创建服务器部署脚本

在服务器保存 `/usr/local/bin/update-sakura-wiki`：

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

REPO=/srv/Sakura-EcoSystem-wiki
LOCK=/tmp/sakura-ecosystem-wiki-deploy.lock

exec 9>"$LOCK"
flock -n 9 || { echo "deployment already running"; exit 0; }

cd "$REPO"
git fetch --prune origin main
git reset --hard origin/main
test -s index.html
echo "wiki updated to $(git rev-parse --short HEAD)"
```

然后执行：

```bash
sudo chmod 755 /usr/local/bin/update-sakura-wiki
/usr/local/bin/update-sakura-wiki
```

脚本只同步固定仓库的 `main` 分支，不把任何 HTTP 参数拼接到 shell 命令中。`reset --hard` 只会覆盖服务器这个 Wiki 工作树中的本地改动，不要把服务器上的 `.env` 或其他私有文件放进该目录。

### 3. 创建 GitHub Actions SSH 密钥

在本地生成专用密钥，不要复用个人登录密钥：

```bash
ssh-keygen -t ed25519 -C "github-actions-sakura-wiki" -f ~/.ssh/sakura-wiki-actions
```

把公钥追加到服务器部署用户的 `~/.ssh/authorized_keys`：

```bash
cat ~/.ssh/sakura-wiki-actions.pub | ssh YOUR_USER@wiki.mcylyr.cn "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

在 GitHub 仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加：

| Secret | 值 |
| --- | --- |
| `WIKI_SSH_HOST` | 服务器域名或 IP，例如 `wiki.mcylyr.cn` |
| `WIKI_SSH_USER` | 服务器部署用户，例如 `deploy` |
| `WIKI_SSH_PRIVATE_KEY` | `sakura-wiki-actions` 私钥的完整内容 |
| `WIKI_SSH_FINGERPRINT` | 服务器 SSH host key 指纹 |

获取指纹：

```bash
ssh-keyscan -t ed25519 wiki.mcylyr.cn 2>/dev/null | ssh-keygen -lf - -E sha256
```

### 4. 推送触发自动更新

仓库已经包含 `.github/workflows/deploy-wiki.yml`。配置上述四个 Secret 后，执行：

```bash
git add .
git commit -m "docs: update wiki"
git push origin main
```

在 GitHub 仓库的 **Actions** 页面可以看到部署结果。部署失败时先检查 SSH 用户权限、私钥格式、host 指纹和服务器上的脚本路径。

## Webhook 方案（备选）

也可以让 GitHub Webhook 调用服务器接口，但需要额外维护公网 HTTP 入口、签名校验和请求限流。若使用 Webhook，必须校验 `X-Hub-Signature-256`、限制 `ref` 为 `refs/heads/main`，并使用部署锁；不要直接执行请求体中的命令。

Docsify 运行时需要从 jsDelivr 加载资源，因此服务器应允许访问 CDN。如果希望完全离线，可以把 Docsify 及插件文件下载到仓库的 `assets/vendor`，再改为本地路径。

## GitHub Pages（可选）

Docsify 不需要构建产物，直接发布仓库根目录即可。使用 GitHub Pages 时，可在仓库设置中选择 `main` 分支根目录；自定义域名需要增加 `CNAME` 文件，内容为 `wiki.mcylyr.cn`。

如果域名当前由自己的 Nginx 托管，不要同时让 GitHub Pages 和 Nginx 使用同一 DNS 记录，应选择一种托管链路。

## 本地预览

```bash
npx --yes serve .
```

直接打开 `index.html` 也可能工作，但 Docsify 的路由和搜索在 HTTP 静态服务器下更可靠。

## 发布检查

- 页面可访问，侧栏链接和 GitHub 链接无 404。
- 未提交 `.env`、令牌、私钥或真实 OIDC 配置。
- 首页项目版本与对应仓库的 `package.json`/`version.js` 一致。
- 移动端导航、代码块复制和站内搜索可用。