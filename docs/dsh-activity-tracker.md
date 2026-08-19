# DSH Activity Tracker

仓库：[Guyao146/dsh-activity-tracker](https://github.com/Guyao146/dsh-activity-tracker)

## 定位

这是一个 DeepSeek Harness（DSH）Web 插件，当前版本为 `1.6.2`，许可证为 `AGPL-3.0-only`。它读取本地 DSH 会话目录中的 `session.jsonl.zstd`，聚合活动和 Token 数据，并通过 DSH Web API 与 React 浮层呈现。

## 主要功能

- Token、活动事件和会话数量统计。
- 26 周活动热力图、24 小时活动与 Token 分布。
- 用户输入、编辑、命令、读取和其他工具调用时间线。
- 每日汇总、项目与模型统计、时间范围筛选。
- 可调整大小、拖拽排序、持久化的小组件布局。
- 可选 Sub2API 登录、余额和价格同步。
- 可选 Life Dashboard 推送、工作区详情和当前会话后续消息。

## 安装

推荐从 GitHub Release 下载后安装：

```bash
curl -fL https://github.com/Guyao146/dsh-activity-tracker/releases/latest/download/dsh-activity-tracker.tgz -o dsh-activity-tracker.tgz
dsh plugin --profile web add "file:./dsh-activity-tracker.tgz"
```

Windows PowerShell：

```powershell
Invoke-WebRequest -Uri "https://github.com/Guyao146/dsh-activity-tracker/releases/latest/download/dsh-activity-tracker.tgz" -OutFile "dsh-activity-tracker.tgz"
dsh plugin --profile web add "file:./dsh-activity-tracker.tgz"
```

安装后重启 DSH Web，在新会话按钮附近打开“活动统计”。运行时要求 Node.js `22.15+` 或 `24+`，并需要 `node:zlib` 的 `zstdDecompressSync`。

## 数据来源与处理

默认扫描：

```text
~/.dsh/sessions/*/*/session.jsonl.zstd
```

Windows 默认目录为 `%USERPROFILE%\.dsh\sessions`，也可以通过 `DSH_HOME` 改变根目录。插件以文件的 `mtime + size` 做解析缓存，避免每次刷新重复解压；会话先在本地聚合，API 只返回统计和受限详情。

## Life Dashboard 连接

在 Life Dashboard 中生成配对码后，在插件设置中输入。配对码有效 5 分钟且只能使用一次；插件会把连接信息保存到 DSH 配置目录，默认推送间隔为 10 秒。

详情授权应按需开启。服务器使用 HMAC-SHA256、时间窗口和重放防护验证推送；本地 `token` 与服务端 `LIFE_HUB_DSH_PUSH_SECRET` 都必须至少 32 个随机字符，绝不能提交到 Git。

## 内部结构

- `lib/index.js`：会话扫描与 Zstandard 解压、事件分类、统计 API、配对和推送。
- `lib/client.js`：DSH Web 侧栏入口、React 组件、热力图、时间线和筛选交互。
- `cordis.patch.yml`：安装时把插件加入 DSH bundle。

事件分类包括用户输入 `u`、编辑 `e`、命令执行 `c`、读取 `r`、其他 `o`。Token 来源于 `assistant/message.usage` 的输入、输出和缓存读取字段。