# ZCode Buddy

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-10-05`（ZCode Buddy独立版本，上游 `0.7.0`）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![已编写Wiki](../assets/sakura-wiki.svg)](zcode-buddy.md)

仓库：[Guyao146/zcode-buddy](https://github.com/Guyao146/zcode-buddy) · 许可证 `MIT`（不采用 Sakura-License） · `package.json` `0.7.0`

## 项目定位

ZCode Buddy 是 ZCode（智谱 GLM Coding / Start Plan 客户端）的多账号快捷切换与额度管理桌面工具。热切换秒换号、浏览器登录加号、额度实时看板、可撑天数预测、自动更新。Windows + Electron，核心逻辑零依赖（Node ≥ 18 内置模块）。

它不是 ZCode 的插件或补丁，也不与 ZCode / 智谱官方有任何隶属关系：只读写本机的登录态文件并查询公开的 billing 接口。所有数据（账号快照、设置、历史）仅保存在本机，不上传任何服务器。

## 快速开始

要求：本机已安装并登录 [ZCode 客户端](https://zcode.z.ai)（Windows）。

从 [Releases](https://github.com/Guyao146/zcode-buddy/releases) 下载：

- **安装版** `ZCode Buddy Setup x.x.x.exe`：常规安装，支持应用内自动更新（推荐）；
- **便携版** `ZCode Buddy-x.x.x-portable.exe`：免安装，双击即用（不支持自动更新）。

两者的账号数据都存在 `%APPDATA%\zcode-buddy\accounts`，可以混用互换。也可以从源码构建：

```bash
npm install
npm test                 # core 单元测试（node:test）
npm run build:renderer   # 构建前端
npm run dev:electron     # 启动桌面应用（开发）
npm run build            # 打包 NSIS 安装包到 release/
```

## 功能概览

| 领域 | 能力 |
| --- | --- |
| 热切换 | 默认开启：只重启 ZCode 的会话进程、不关主窗口，新消息立即由新账号驱动；切换弹窗可按次选「完整重启」，失败自动回退；切换前自动备份（`.last`）并支持一键回滚 |
| 账号添加 | 浏览器登录添加：一键拉起 ZCode 官方登录流程，授权后新账号自动入库；历史登录态变化（手动登录、切换、回滚）自动捕捉为快照 |
| 快捷键 | `Ctrl+Alt+1~9` 切号、`Ctrl+Alt+0` 切回上次账号（均可选） |
| 额度看板 | 直连 ZCode billing 接口：套餐等级、到期时间、分模型发放/已用量（复刻完整客户端身份头）；当前账号环形额度表、分模型额度卡、全部账号汇总（今日已用 / 全部剩余 / 低额度账号数 / 本地累计已用） |
| 用量统计 | 全部合并与单账号双视图；当日 / 昨日 / 近 7 天合计概览；各账号用量表格；「≈可撑 X 天」预测（近 7 天日均消耗口径） |
| 低额度提醒 | 按可配置间隔自动轮询（默认 5 分钟），剩余低于阈值时 Windows 通知（同账号每小时最多一次），点击直接切换 |
| 自动更新 | 启动与每 12 小时静默检查 GitHub Releases（可关）；关于页手动检查 / 下载 / 一键重启安装；可选「自动下载 + 退出时自动安装」 |
| 界面 | 无边框现代化窗口（自定义标题栏、位置记忆）、深色 / 浅色双主题、窗口透明度调节、开机自启、系统托盘常驻（含各账号剩余百分比） |
| 备份 | 账号加密备份 `.zbak`（AES-256-GCM）含 120 天每日消耗历史，支持跨机器迁移 |

## 工作原理

ZCode 客户端的登录态由两个文件承载（Windows）：

```text
%USERPROFILE%\.zcode\v2\credentials.json   # OAuth token（enc:v1 加密）、zcodejwttoken 等
%USERPROFILE%\.zcode\v2\config.json        # 各 provider 的 apiKey（JWT，明文）
```

- **完整切换**：关闭 ZCode → 备份当前两份文件 → 原子替换为目标账号快照 → 重启 ZCode（运行中修改会被客户端退出时回写覆盖，工具自动处理）。
- **热切换**：杀掉 ZCode 的 agent 会话进程（启动时读取登录态）→ 原子替换两份文件 → 客户端按需重新拉起会话进程即载入新账号，主窗口不关闭。
- **额度查询**：用 `zcodejwttoken` 请求 `https://zcode.z.ai/api/v1/zcode-plan/billing/current` 与 `/billing/balance`，复刻完整客户端身份头（`User-Agent: ZCode/<版本>`、`X-ZCode-App-Version`、`X-Platform`、`X-Device-Mid` 等，缺头返回 400）。

`enc:v1` 字段为 AES-256-GCM，密钥由本机用户信息派生，快照因此**仅限本机使用**。

## CLI

```bash
node core/cli.js status              # 当前账号与 ZCode 状态
node core/cli.js list                # 账号快照列表
node core/cli.js capture [名称]       # 保存当前登录态
node core/cli.js use <id|名称>        # 切换（默认完整重启，--no-restart 跳过重启）
node core/cli.js quota [current|all|<id>]  # 查询额度
node core/cli.js rollback            # 回滚到上次切换前
```

技术栈：Electron + React + Vite；核心逻辑零依赖（Node ≥ 18 内置模块），与界面解耦，core 模块有 50+ 单元测试（`node:test`）。

## 与生态其他项目的关系

- 独立运行，不依赖生态任何其他项目；数据只在本机。
- 与 [SakuraID（Sakura-Auth-Server）](sakura-auth-server.md) 解决的是不同层面的问题：SakuraID 是「服务端发令牌」，ZCode Buddy 是「本机客户端登录态与额度管理」。
- 设计思路参考了 WorkDaddy、zcode-account-switcher、ZCodex-Manager、workbuddy-switch 等社区项目（见仓库 README 致谢）。

> 免责声明：本项目与 ZCode / 智谱官方无任何隶属关系，仅供个人学习与效率工具使用，请遵守对应服务条款；使用产生的任何后果由使用者自行承担。

## 版本记录

| 版本 | 要点 |
| --- | --- |
| `0.7.0`（package.json） | 热切换（不关主窗口）、浏览器 OAuth 添加账号、历史登录态自动捕捉、额度看板与「可撑天数」预测、低额度提醒、自动更新、加密备份；core 模块 50+ 单元测试 |

来源：[package.json](https://github.com/Guyao146/zcode-buddy/blob/main/package.json) 与 [仓库 README](https://github.com/Guyao146/zcode-buddy#readme)。Roadmap：macOS / Linux 支持、快照静态加密（主密码）。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
