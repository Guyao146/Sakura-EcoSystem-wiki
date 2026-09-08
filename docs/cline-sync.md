# Cline Sync 本地客户端

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-09-08`（Cline Sync 本地客户端独立版本）

源码：[Sakura-MCP-Server/tools/cline-sync](https://github.com/Guyao146/Sakura-MCP-Server/tree/main/tools/cline-sync)

## 工具定位

Cline Sync 是 Sakura-MCP-Server 的配套本地工具。它定时读取 Cline 已经写入磁盘的任务历史，找出尚未处理的文本消息，再调用服务端 `memory_extract_and_remember`，把适合长期保留的信息抽取到 Sakura 记忆库。

它不是 MCP Server、Cline 插件或实时监听器。Sakura-MCP-Server 无法被动看到本地 Cline 会话；只有运行 Cline Sync 并明确配置 Agent Key 后，本地历史才会按配置发送到服务端。

## 同步流程与数据边界

```text
Cline 本地任务目录
       │ 定时扫描
       ▼
按任务读取增量消息 ── 可选尽力脱敏 ── memory_extract_and_remember
       │                                      │
       └──── 成功后推进本地游标 ◀─────────────┘
```

每轮同步遵循以下边界：

- 按任务保存消息数量游标，只处理游标之后的增量；
- 任务历史变短时从头重新处理；
- 每个任务至少有两条新增消息才发起抽取；
- 只提取文本块，不上传图片和工具结果；
- 单个任务送入抽取前只保留最近最多 200,000 个字符；
- 每个符合条件的任务产生一次抽取调用；
- 成功后推进游标，失败时保留原位置，修复问题后可以重试。

> [!WARNING]
> 对话文本会发送给 Sakura-MCP-Server 配置的 Chat Provider。启用前应确认内容、服务端和模型 Provider 均符合你的隐私要求。

## 前置条件

1. 已部署并可从本机访问 [Sakura-MCP-Server](sakura-mcp-server.md)。
2. 目标服务器已经配置可用的 Chat Provider。
3. 为客户端创建独立 Agent Key，不与其他客户端共用。
4. Agent 具有全局 `memory:write` scope，并获得目标空间的 `memory:write` grant。
5. 从源码运行或打包需要 Node.js `22+`。

客户端当前没有可配置的 `space_id`。实际写入目标由服务端对当前 Agent 和用户默认空间的处理决定；正式使用前应在测试账号和测试空间验证写入位置。

## Cline 任务目录

客户端会尝试识别标准 VS Code + Cline 的任务目录。Windows 常见路径为：

```text
%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\tasks
```

VS Code Insiders、VSCodium、便携版或修改过扩展数据目录的环境可能无法自动识别，需要在配置窗口中手工填写。目录下无法解析的任务 JSON 会被跳过并记录错误，不会删除原始历史。

## 源码运行

```bash
git clone https://github.com/Guyao146/Sakura-MCP-Server.git
cd Sakura-MCP-Server/tools/cline-sync
npm install
npm run build
node dist/main.js
```

开发模式：

```bash
npm run dev
```

首次启动且配置未完成时会自动打开配置窗口。自动同步默认关闭；保存配置并启用后，调度器会先等待一个完整扫描间隔，不会在启动瞬间执行第一轮。需要立即验证时使用面板的“立即同步”或命令行单次同步。

## Windows 单文件构建

```powershell
cd Sakura-MCP-Server\tools\cline-sync
npm install
npm run package
```

默认目标为 `node22-win-x64`，输出到 `release/cline-sync.exe`。打包使用 `@yao-pkg/pkg` 的 SEA 模式，托盘辅助程序会在首次运行时从只读快照解包到用户数据目录。

当前仓库没有可确认的正式签名安装器或带校验和的独立客户端 Release。`npm run package` 是自行构建方式；跨平台 target 也需要自行修改并验证，不能视为已有官方跨平台发行包。

## 配置项

| 配置 | 说明 |
| --- | --- |
| MCP URL | Sakura-MCP-Server 的 Streamable HTTP 地址，推荐生产环境使用 HTTPS |
| Agent Key | `sk_sakura_...` Bearer Key，必须具备写入权限 |
| Cline 任务目录 | Cline 本地 `tasks` 目录 |
| 扫描间隔 | 1–1440 分钟，默认 10 分钟 |
| 任务时间窗口 | 只考虑最近若干天有活动的任务；`0` 表示不按天数过滤 |
| 自动同步 | 默认关闭，显式启用后才按间隔运行 |
| 上传前脱敏 | 默认开启，但只能降低常见凭据泄漏风险，不能保证完整 |
| 任务选择模式 | 全部任务、仅勾选任务、排除勾选任务 |

时间窗口先于任务选择生效。使用“仅勾选任务”时，如果列表为空，将不会同步任何任务。配置面板会显示任务消息数、待处理数量、最后活动和预计抽取调用数。

> [!IMPORTANT]
> Agent Key 以明文保存在本地配置文件中。当前实现对配置文件请求 `0600` 权限，但 Windows 上这不等同于完整 ACL 隔离。应限制用户数据目录访问权限，不要在共享账号中使用高权限 Key。修改配置时应重新填写并确认 Agent Key，不要依赖“留空保留旧值”。

## 托盘与配置窗口

正常启动后客户端常驻系统托盘，可打开配置、立即同步、暂停或恢复自动同步并退出。托盘辅助程序启动失败时，主进程仍可在控制台模式运行。

配置窗口优先使用本机 Edge/WebView2 或 Chrome 的 `--app` 模式，并使用独立浏览器 profile；找不到兼容浏览器引擎时退回默认浏览器。面板服务只绑定 `127.0.0.1`，每次进程启动生成随机 token，读取配置时会掩码显示 Agent Key。

## 命令行与检查

```bash
# 预览本地任务概况，不调用服务端抽取
npm run dry-run

# 执行一轮同步后退出
npm run sync-once

# TypeScript 类型检查和测试
npm run check
```

单次同步存在失败任务时返回退出码 `2`。`dry-run` 只用于检查任务文件和文本规模，不完全模拟真实同步：它不会严格复现游标、任务选择和最终字符截断。

## 认证与安全

- 客户端使用静态 Agent Bearer Key，不使用 Authentik 浏览器登录、OAuth 或动态客户端注册；
- 远程服务生产环境应使用 HTTPS；客户端实现接受 HTTP，但明文网络会暴露 Key 和对话内容；
- 为 Cline Sync 单独创建最小权限 Key，泄露后可独立删除；
- 本地配置和游标不应同步到网盘、公共 Git 仓库或共享目录；
- 上传前脱敏只处理常见凭据形式，是 best-effort 防护，不是数据泄露保证；
- 配置面板仅监听回环地址，但本机其他进程仍可能读取配置文件，应依赖操作系统账户和目录权限隔离。

## 故障排查

### 没有发现任务

- 检查填写的是 Cline 的 `tasks` 目录，而不是工作区目录；
- 确认扩展数据目录仍是 `saoudrizwan.claude-dev`；
- VS Code Insiders、VSCodium 或便携版需要手工选择实际目录；
- 检查任务 JSON 是否可读且格式完整。

### 一直显示没有新增内容

- 单个任务少于两条新增消息时会等待后续内容；
- 任务可能已经推进游标；
- 任务最后活动时间可能超出配置窗口；
- “仅勾选任务”模式的空列表表示不同步任何任务；
- “排除勾选任务”模式下检查任务是否被加入排除列表。

### 返回 401 或 403

确认：

```text
Agent Key 未被删除
∩ Agent 全局 scope 包含 memory:write
∩ Agent 获得目标空间的 memory:write grant
∩ 当前用户仍有目标空间访问权限
```

### 返回 429

服务端正在限流。增加扫描间隔、减少同步任务，或检查 Sakura-MCP-Server 的 Agent 和接口速率限制。

### 连接关闭或超时

- 确认 MCP URL 指向根域名或 `/mcp` Streamable HTTP 端点；
- 初始化连接超时为 20 秒，单次抽取超时为 120 秒；
- 使用 Nginx 时为 MCP 路径设置 `proxy_buffering off;`；
- 检查服务端版本、健康状态、证书和反向代理日志。

### 配置窗口或托盘无法打开

- 托盘不可用时从控制台查看错误，主同步进程可能仍在运行；
- 检查用户数据目录是否允许解包和执行托盘辅助程序；
- 未找到 Edge/Chrome 时会回退默认浏览器，可直接打开控制台显示的回环面板地址；
- 防病毒软件可能拦截自行打包且未签名的单文件程序，应先核对源码并自行构建。

## 已知限制

- 使用定时扫描，不监听 Cline 实时事件；
- 不上传图片和工具结果；
- 少于两条新增消息不会立即抽取；
- 不支持在客户端配置目标 `space_id`；
- 不提供安装器、开机自启、Windows Service 注册或自动更新；
- 不自动删除或修改 Cline 原始任务历史；
- 脱敏无法覆盖所有秘密、个人信息和业务数据；
- CI 当前只检查类型和测试，不代表单文件打包、签名或跨平台发行已经验证。

> 工具行为以 Sakura-MCP-Server 仓库中 `tools/cline-sync` 的源码、README 和 CI 为最终依据。
