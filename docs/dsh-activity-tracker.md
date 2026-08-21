# DSH Activity Tracker

仓库：[Guyao146/dsh-activity-tracker](https://github.com/Guyao146/dsh-activity-tracker) · 许可证 `LGPL-v2.0`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-4c7dff)](https://github.com/deepseek-ai/deepseek-harness)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

这是 DeepSeek Harness（DSH）Web 的本地活动统计插件。插件不依赖外部数据库，直接读取 DSH 本地会话文件，解析用户消息、工具调用、助手 Token 使用和会话元数据，在 DSH Web 中提供可交互的统计浮层；可选地把“工作区摘要”推送到 Life Dashboard。

它不是一个通用日志采集器：默认不会上传完整会话，远程功能也只发送工作区标识、活动时间、统计汇总和按授权返回的受限记录。

## 运行要求

- 已安装并能运行 DSH Web，插件必须安装到 `web` profile。
- Node.js `22.15+` 或 `24+`。源码调用 `node:zlib.zstdDecompressSync` 解压会话。
- 当前用户对 DSH 会话目录有读取权限。
- 默认会话目录：

  ```text
  Linux/macOS: ~/.dsh/sessions
  Windows:     %USERPROFILE%\.dsh\sessions
  ```

  设置 `DSH_HOME` 后，插件从 `$DSH_HOME/sessions` 读取。

## 安装与启用

### Release 安装（推荐）

```bash
curl -fL https://github.com/Guyao146/dsh-activity-tracker/releases/latest/download/dsh-activity-tracker.tgz -o dsh-activity-tracker.tgz
dsh plugin --profile web add "file:./dsh-activity-tracker.tgz"
```

Windows PowerShell：

```powershell
Invoke-WebRequest -Uri "https://github.com/Guyao146/dsh-activity-tracker/releases/latest/download/dsh-activity-tracker.tgz" -OutFile "dsh-activity-tracker.tgz"
dsh plugin --profile web add "file:./dsh-activity-tracker.tgz"
```

安装后重启 DSH Web；在“新会话”按钮附近应出现“活动统计”入口。

### 从源码打包

```bash
git clone https://github.com/Guyao146/dsh-activity-tracker.git
cd dsh-activity-tracker
npm pack
dsh plugin --profile web add "file:./dsh-activity-tracker-1.6.2.tgz"
```

项目是直接打包的 JavaScript 插件，不需要构建步骤。`cordis.patch.yml` 在 DSH bundle 安装时注册 `activity-tracker`；发布包只包含 `lib/`、`cordis.patch.yml`、`README.md`、`LICENSE` 和 `package.json`。

## 统计内容

### 汇总与图表

- 输入、输出、缓存读取 Token。
- 活动事件数和活动会话数。
- GitHub Contributions 风格的 26 周热力图。
- 24 小时活动事件分布和 Token 分布。
- 事件时间线：用户输入、编辑、命令执行、文件/内容读取和其他工具。
- 每日汇总表，可点击日期查看当天记录。
- 按项目、会话、模型和时间范围统一筛选。
- 项目费用统计与模型费用统计（需配置 Sub2API 价格）。

事件分类由 `lib/index.js` 的工具名规则决定：`u` 用户输入，`e` 编辑（如 `edit`、`write`、`apply_patch`），`c` 命令（如 `bash`、`pwsh`、`cmd`），`r` 读取（如 `read`、`grep`、`list_files`），`o` 其他工具。未识别工具会归入其他。

### 仪表盘交互

可以显示或隐藏模块，为模块选择小/中/大尺寸，拖拽调整顺序，也可以使用模块菜单改变尺寸或关闭模块。项目、会话、日期范围筛选会保持在 UI 状态中；窄屏会自动调整为 3/2/1 列。

## 数据处理流程

```text
~/.dsh/sessions/*/*/session.jsonl.zstd
        │
        ├─ zstd 解压 + JSON Lines 解析
        ├─ 读取 session/title、cwd、turn/start
        ├─ 归类 user/message、tool/call、assistant/message.usage
        └─ 按项目 / 日期 / 小时聚合
                 │
      DSH webServer API / React client
```

每个会话目录中的 `session.jsonl.zstd` 是多帧 Zstandard 压缩的 JSON Lines。插件读取 `cwd` 推导项目，读取 `session/title` 得到会话标题，读取 `turn/start` 统计轮次；`assistant/message.usage` 提供输入、输出和缓存读取 Token。解析缓存以文件 `mtime + size` 判断是否需要重新扫描，损坏或无法识别的会话会被跳过。

## 本地 API

请求需要携带：

```http
X-DSH-Activity: 1
```

### 统计和会话

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/dsh-activity/api/overview` | 项目列表、会话摘要、日期/小时聚合、总览数据 |
| `GET` | `/dsh-activity/api/day?date=YYYY-MM-DD&project=<name>&session=<id>` | 某日、项目或会话的事件与 Token 详情 |
| `GET` | `/dsh-activity/api/ui/config` | 读取模块布局、尺寸和筛选状态 |
| `PUT` | `/dsh-activity/api/ui/config` | 保存 UI 状态 |
| `GET` | `/dsh-activity/api/costs` | 费用汇总 |

`project` 和 `session` 为可选筛选项；详情响应会限制单条记录和 Token 数据规模，避免把完整会话内容作为统计接口返回。

### Life Dashboard 连接 API

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/dsh-activity/api/workspaces` | 读取本地工作区摘要，需要 dashboard token |
| `POST` | `/dsh-activity/api/dashboard/pair` | 使用 Life Dashboard 一次性验证码配对 |
| `GET` | `/dsh-activity/api/dashboard/config` | 读取当前连接状态 |

配对码有效 5 分钟，只能成功使用一次，最多 5 次尝试。成功后连接配置保存在 `DSH_HOME/dsh-activity-tracker-dashboard.json`，文件权限为仅当前用户可读写。

## Life Dashboard 远程推送

在 Life Dashboard 的 Authentik 管理员设置中生成 6 位配对码，然后打开 DSH 的“活动统计 → 总设置 → 生活看板连接”，填写 Life Dashboard 的 `config.php` HTTPS 地址，输入验证码，并按需勾选“允许查看会话详情”。

配对后插件每 10 秒向服务器主动发送快照，因此本机在 NAT 后也不需要开放端口。推送使用 HMAC-SHA256、时间戳窗口和重放防护；服务端 `LIFE_HUB_DSH_PUSH_SECRET` 与本地 token 都必须至少 32 个随机字符。停止推送超过服务端 `LIFE_HUB_DSH_OFFLINE_AFTER_SECONDS`（默认 45 秒）后，工作区显示为离线。

服务端默认只接收工作区名称、工作区 key、活动年龄、事件/Token 聚合、会话数量等摘要。详情授权后，管理员才能读取受限会话记录；未经授权不会上传用户消息、工具参数、文件内容或完整会话原文。

### 远程会话消息

Life Dashboard 管理员可在已授权工作区中选择仍在运行的会话发送后续消息。插件在下一次已签名推送中领取命令，并把消息交给 DSH 官方 `agent.followup()`。

- 单条消息最多 8,000 字符。
- 服务端队列保存 120 秒。
- 命令使用 UUID 幂等，成功领取后删除。
- 目标会话必须仍出现在当前 DSH 运行会话中，超时不会投递到其他会话。

## Sub2API 费用统计

可在“活动统计 → 设置”配置 Sub2API 地址、账号密码、TOTP、可选 group ID，或者使用兼容的 JWT/API Key 模式。

```http
GET  /dsh-activity/api/pricing/config
PUT  /dsh-activity/api/pricing/config
POST /dsh-activity/api/pricing/auth/login
POST /dsh-activity/api/pricing/auth/login-2fa
POST /dsh-activity/api/pricing/auth/logout
GET  /dsh-activity/api/pricing/account
POST /dsh-activity/api/pricing/sync
GET  /dsh-activity/api/pricing/state
GET  /dsh-activity/api/costs
```

登录后插件保存 access token、refresh token、过期时间和账户摘要到 `DSH_HOME/dsh-activity-tracker-pricing.json`，并在过期前刷新；不会把凭证放进统计 API 响应。价格来自 `/api/v1/channels/available` 的输入、输出、缓存读取单价和 `rate_multiplier`，费用公式为：

```text
输入 Token × 输入单价
+ 输出 Token × 输出单价
+ 缓存读取 Token × 缓存读取单价
```

每日成功同步会保存当天价格快照，因此历史费用按当天价格计算，不会因以后修改模型价格而回溯变化。无法匹配价格的模型显示为未计价。

## 发布、排错与限制

在 `main` 推送后，`.github/workflows/release.yml` 会读取 `package.json` 版本，执行 `node --check`、许可证检查和 `npm pack --dry-run`，再创建 `v<version>` Release，上传 tgz、固定下载名 `dsh-activity-tracker.tgz` 和 `SHA256SUMS.txt`。修改实现时应同步提升版本号。

常见问题：

- 没有“活动统计”：确认 `--profile web`、重启 DSH Web，并检查 bundle 是否包含 `activity-tracker`。
- 缺少 zstd：升级到 Node.js `22.15+` 或 `24+`。
- 没有用户数据：检查 `DSH_HOME`、`~/.dsh/sessions` 和文件读取权限；新会话创建后点击刷新。
- 个别会话缺失：损坏或未知格式会被跳过；不同完整路径会被视为不同项目。
- 统计 Token 与账单不一致：统计使用 DSH 原始 `usage`，不包含中转站折扣、倍率或其他账单规则。

## 源码结构与许可证

```text
lib/index.js    # 解析、聚合、本地 API、配对、推送和 Sub2API
lib/client.js   # 侧栏入口、React 统计浮层、图表和交互
cordis.patch.yml
.github/workflows/release.yml
```

项目使用 GNU AGPL v3.0 only。修改后通过网络提供服务时，需按 AGPL 的远程网络交互条款向用户提供对应源码。