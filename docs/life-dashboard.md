# Life Dashboard

仓库：[Guyao146/Life-Dashboard](https://github.com/Guyao146/Life-Dashboard)

## 定位

Life Dashboard 是一个 PHP 8.2 + 原生前端的个人生活中枢，当前版本为 `0.10.1`。它把家庭环境、设备控制、日程、天气、纪念日、习惯、能耗、AI 助手和 DSH 工作区状态放在同一块看板中。

## 功能模块

- **总览**：时间、问候、天气、工作区动态和纪念日。
- **我的家**：Home Assistant 区域、实体、快捷控制和环境数据。
- **日程**：Microsoft To Do 等待办和日程展示。
- **消费与订单**：配送进度和相关卡片。
- **健康**：习惯周历与生活状态。
- **AI 助手**：兼容 OpenAI 接口格式，向模型附带看板实时数据。
- **设置**：组件、导航、主题、天气、DSH 配对和版本升级。

## 环境要求

- PHP `8.2`。
- Nginx 或 Apache，并正确保护 `.env`。
- Authentik OIDC（推荐）或可选的浏览器本地登录。
- Home Assistant 长期访问令牌（使用智能家居功能时）。

## 部署步骤

```bash
git clone https://github.com/Guyao146/Life-Dashboard.git
cd Life-Dashboard
cp .env.example .env
chmod 600 .env
```

至少配置 OIDC、管理员白名单和 Home Assistant：

```dotenv
LIFE_HUB_OIDC_CLIENT_ID="Authentik 客户端 ID"
LIFE_HUB_OIDC_AUTHORIZE_URL="https://login.example.com/application/o/authorize/"
LIFE_HUB_OIDC_TOKEN_URL="https://login.example.com/application/o/token/"
LIFE_HUB_OIDC_USERINFO_URL="https://login.example.com/application/o/userinfo/"
LIFE_HUB_ADMIN_GROUPS="Life Dashboard Admins"
LIFE_HUB_HA_URL="https://home.example.com"
LIFE_HUB_HA_TOKEN="replace-me"
```

Authentik 的 `profile` Scope Mapping 必须返回用户组声明；管理员组名和 `.env` 中的值需一致。登录后可在设置页查看身份诊断，排查组声明或权限问题。

## DSH 工作区动态

追加：

```dotenv
LIFE_HUB_DSH_PUSH_SECRET="至少 32 位随机字符串"
LIFE_HUB_DSH_OFFLINE_AFTER_SECONDS="45"
LIFE_HUB_OIDC_REMEMBER_DAYS="30"
```

插件每 10 秒主动推送快照。管理员可以查看已授权工作区的会话、事件和 Token 汇总，并向仍在运行的会话发送最多 8,000 字符的后续消息。消息使用 120 秒短时队列、UUID 幂等投递和下一次签名快照回执。

## 安全要点

Nginx 必须拒绝点文件及旧配置文件：

```nginx
location ~ /\.(?!well-known(?:/|$)) { return 404; }
location = /config.js { return 404; }
location = /config.example.js { return 404; }
```

PHP FastCGI 需要转发 `Authorization` 头。更安全的做法是把 `.env` 放在 Web 根目录之外，并通过 `LIFE_HUB_ENV_FILE` 指定。Home Assistant Token 只应在服务端保存并通过管理员鉴权接口使用。

## 项目自身更新

项目内置 `update.php` 和升级控制台：服务器在临时目录维护 GitHub 浅克隆，严格拒绝重复版本和降级；升级过程通过 SSE 展示源码同步、校验、原子部署和清理阶段。更新权限复用 Authentik 管理员会话，不需要额外的更新 Token。