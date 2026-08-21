# Life Dashboard

仓库：[Guyao146/Life-Dashboard](https://github.com/Guyao146/Life-Dashboard) · 许可证 `LGPL-v2.0`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

Life Dashboard（生活看板）是一个 PHP 8.2 + 原生 JavaScript/CSS 的个人生活中枢。它把 Home Assistant 家庭设备、天气、Microsoft To Do、日历、纪念日、习惯、能耗、配送、AI 助手和 DSH 工作区动态放进同一个响应式 Dashboard。

## 功能总览

### 看板与本地偏好

- 总览、我的家、日程、消费与订单、健康、设置等视图。
- 实时时间、问候语、环境温度/湿度、设备状态和区域。
- 工作区动态按工作中、活跃、最近活动、空闲、无数据分类，10 秒刷新。
- 小组件显示/隐藏、尺寸选择、桌面端拖拽排序和移动端响应式布局。
- 导航分类可隐藏；称呼、主题、天气城市、纪念日、快捷设备、环境传感器选择均可在浏览器保存。
- 日间/夜间/跟随系统主题，初始化时提前设置 `data-theme` 防止刷新闪烁。

### Home Assistant

管理员连接后，前端通过 REST `/api/states` 读取实体，并通过 WebSocket `/api/websocket` 调用区域、设备和实体注册表；设备控制通过 Home Assistant 服务接口完成。看板支持：

- 区域和实体列表、搜索、设备详情。
- 快捷控制，最多选择 6 个可控实体。
- 温度和湿度传感器选择，两个环境数据位彼此独立。
- 区域、设备、实体状态同步。
- 日历事件读取。
- Microsoft To Do 实体 `todo.login_ren_wu` 的待办读取，优先使用实体属性，必要时调用 `todo/get_items`。

### 天气、日程与个人信息

- 天气使用 Open-Meteo 地理编码与预报接口，无 API Key；缓存 30 分钟，显示当前温度、体感、湿度和未来三日预报。
- 日程优先读取指定 To Do；同时读取 Home Assistant `calendar.*` 当日事件。
- 纪念日支持日期、名称和每年重复，自动计算距离下一次事件的天数。
- 健康视图提供习惯周历和能耗卡片；配送卡片预留订单进度展示。

### AI 助手

设置中可填写任意 OpenAI 兼容接口地址、API Key 和模型；可以请求 `/models` 拉取模型列表，再调用 `/chat/completions`。发送消息时会附带当前时间、家庭状态、天气、工作区摘要、设备、日程和纪念日上下文。

AI 配置与对话所需的 API Key 只由当前浏览器保存，接口必须允许浏览器 CORS；这不是服务端密钥托管功能。

## 环境与基础部署

要求 PHP `8.2`、Nginx 或 Apache，以及现代浏览器。使用 Home Assistant、Authentik 或 DSH 集成时还需要相应服务可访问。

```bash
git clone https://github.com/Guyao146/Life-Dashboard.git
cd Life-Dashboard
cp .env.example .env
chmod 600 .env
```

站点根目录包含 `index.html`、`app.js`、`styles.css`、`config.php`、`update.php` 和 `version.js`。`.env` 可以放在 Web 根目录外，并用 `LIFE_HUB_ENV_FILE` 指定。

## Authentik OIDC 与权限模型

### 必要配置

```dotenv
LIFE_HUB_OIDC_CLIENT_ID="Authentik 公共客户端 ID"
LIFE_HUB_OIDC_AUTHORIZE_URL="https://login.example.com/application/o/authorize/"
LIFE_HUB_OIDC_TOKEN_URL="https://login.example.com/application/o/token/"
LIFE_HUB_OIDC_USERINFO_URL="https://login.example.com/application/o/userinfo/"
LIFE_HUB_ADMIN_GROUPS="Life Dashboard Admins"
LIFE_HUB_ADMIN_USERS=""
LIFE_HUB_ADMIN_EMAILS=""
LIFE_HUB_HA_URL="https://home.example.com"
LIFE_HUB_HA_TOKEN="replace-me"
```

管理员可按 Authentik groups、用户名或邮箱白名单匹配；三种白名单全部为空时，私密配置默认拒绝。Provider 应启用 OpenID `profile` Scope Mapping，让 UserInfo 返回 `groups`。

登录流程使用 Authorization Code + PKCE，scope 包含 `openid profile email offline_access`。OIDC 会话默认保存 30 天，Access Token 到期前使用 Refresh Token 自动续期；多标签页通过 Web Locks 避免并发消费旋转 Refresh Token。续期失败或私密接口返回 401 时清理会话并返回登录页。

配置网关 `config.php` 的公开接口只返回 OIDC 参数和可选本地登录配置；`action=private` 先调用 Authentik UserInfo，只有管理员才得到 Home Assistant URL/Token。`action=identity` 用于显示当前用户、groups、允许的 groups 和最终匹配结果。

### 可选本地登录

```dotenv
LIFE_HUB_LOCAL_AUTH_USERNAME="admin"
LIFE_HUB_LOCAL_AUTH_SALT="base64-salt"
LIFE_HUB_LOCAL_AUTH_HASH="base64-pbkdf2-hash"
LIFE_HUB_LOCAL_AUTH_ITERATIONS="310000"
```

本地账号使用浏览器端 PBKDF2-SHA256，可进入不包含私密 Home Assistant 数据的看板；不能替代 Authentik 管理员身份，也不能解锁 HA Token。连续失败 5 次会锁定 30 秒。

## DSH 工作区动态

服务端配置：

```dotenv
LIFE_HUB_DSH_PUSH_SECRET="至少 32 位随机字符串"
LIFE_HUB_DSH_OFFLINE_AFTER_SECONDS="45"
LIFE_HUB_OIDC_REMEMBER_DAYS="30"
```

### 配对与推送

1. Authentik 管理员在“设置 → 连接与账户 → 连接本机 DSH”生成 6 位码。
2. DSH 插件在“活动统计 → 总设置 → 生活看板连接”输入验证码。
3. 验证码 5 分钟有效、只能使用一次、最多 5 次尝试。
4. 配对成功后，插件每 10 秒主动向 `config.php?action=workspace-push` 发送快照。

PHP 端使用 HMAC-SHA256、时间戳 120 秒窗口、`hash_equals` 和重放记录；快照写入 PHP 系统临时目录的私有文件，并限制工作区数量和字段结构。离线阈值由 `LIFE_HUB_DSH_OFFLINE_AFTER_SECONDS` 控制，范围被限制在 30–3600 秒。

管理员查看详情前，必须让该工作区启用详情授权。消息接口再次验证管理员、工作区授权、会话存在性和消息长度；消息最多 8,000 字符，命令队列保存 120 秒，使用 UUID 幂等并等待 DSH 下一次签名推送领取。

## `config.php` 接口行为

| action | 方法 | 权限/作用 |
| --- | --- | --- |
| `public` | GET | OIDC 公共参数、本地登录参数 |
| `identity` | GET | 已登录用户身份与管理员匹配诊断 |
| `private` | GET | Authentik 管理员才返回 HA 配置 |
| `workspaces` | GET | 管理员读取 DSH 工作区缓存 |
| `workspace-pair-create` | POST | 管理员生成一次性配对码 |
| `workspace-command` | POST | 管理员向已授权、运行中的 DSH 会话排队消息 |
| `workspace-push` | POST | DSH 使用 HMAC 推送快照，不接受浏览器 Origin |

所有普通浏览器请求会经过同源检查；DSH 配对消费是无 Origin 的本地机器请求。服务端拒绝超大请求、无效字段、过期签名和重放快照。

## 安全与 Nginx 部署要点

`.env`、点文件和旧的浏览器配置不能被 Web 服务器直接提供：

```nginx
location ~ /\.(?!well-known(?:/|$)) { return 404; }
location = /config.js { return 404; }
location = /config.example.js { return 404; }
```

PHP FastCGI 需要转发 `Authorization`，否则 Authentik 管理员身份无法验证。生产环境应把 `.env` 放在站点根目录之外。

## 服务器一键升级器

`update.php` 支持 `check`、`update` 和 `update-stream` 三种 POST 命令。它会在 PHP 系统临时目录维护远端仓库浅克隆，读取 `version.js` 做语义化版本比较，并使用文件锁避免并发升级。

- `check` 结果缓存 5 分钟。
- 更新前必须通过 Authentik UserInfo 和管理员白名单；普通用户、本地账号和未登录请求不能升级。
- 远端版本必须严格高于当前版本，拒绝重复升级和降级。
- 更新通过逐文件部署，保留服务器 `.env` 和 `.git`，删除旧 `config.js`、`config.example.js`、`work/`、`outputs/` 等遗留产物。
- `update-stream` 使用 SSE 返回源码同步、版本校验、部署、清理和结果日志。

项目版本由 `version.js` 统一记录。`scripts/bump_version.php` 支持 `patch`、`minor`、`major`，`scripts/check_version.php` 检查版本是否与产品改动同步；GitHub Actions 会运行 PHP 语法检查和版本检查。

## 源码结构

```text
index.html                         # 页面骨架、视图和模态框
app.js                             # OIDC、HA、DSH、天气、AI 和偏好逻辑
styles.css                         # 响应式 Dashboard 样式
config.php                         # .env、OIDC、管理员和 DSH 权限网关
update.php                         # 版本检查、原子升级和 SSE 控制台接口
version.js                         # 当前发布版本
upgrade.html                       # 升级控制台
scripts/bump_version.php           # 版本递增
scripts/check_version.php          # 版本一致性检查
nginx-life-dashboard.conf.example  # Nginx 安全规则示例
```

## 版本与路线

当前实现已经包含 OIDC、Home Assistant、天气、纪念日、AI、DSH 工作区动态、自动续期和服务器升级控制台；README 中仍标记为未来方向的设备状态增强、自动化场景、完整天气统计、移动 App 和更多数据分析，需以实际 CHANGELOG 为准。