# UniLink

> Wiki 文档版本：`v1.0.1` · 更新日期：`2026-09-23`（UniLink独立版本）

仓库：[Guyao146/UniLink](https://github.com/Guyao146/UniLink) · 当前版本 `v1.2`（协议 v1） · 许可证见下方说明

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![Android](https://img.shields.io/badge/Android-Client-3ddc84)](https://github.com/Guyao146/UniLink)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

UniLink 是一套**手机与电脑互通消息**的完整方案：配套 PC 端与 Android 端软件，可把**状态栏的所有通知**在两台设备间互相同步，还支持文字消息、剪贴板同步和文件互传。

```text
┌──────────────┐   WebSocket   ┌────────────┐   WebSocket   ┌──────────────┐
│  Android 手机 │ ◄──────────► │ 中继服务器   │ ◄──────────► │   Windows PC │
│ Notification │   (AES-GCM    │ server.py  │   (AES-GCM    │  main.py GUI │
│ Listener 抓取 │   端到端加密)  │  只转发不解密│   端到端加密)  │  Tkinter     │
│ 状态栏全部通知 │               └────────────┘               └──────────────┘
└──────────────┘
```

它不是云推送服务：中继服务器只转发密文、不持有密钥；通知抓取依赖 Android 的 NotificationListenerService 与 Windows 的 UserNotificationListener，两端都在本地运行。iOS 系统不允许第三方读取通知中心，因此没有同等级别的 iOS 客户端。

## 快速开始

### 第 1 步：启动服务器（跑在哪台机器都行，通常就是你的电脑）

```bash
cd unilink/server
pip install -r requirements.txt
python server.py --port 8765 --token 换成你的口令
```

查看电脑局域网 IP（Windows：`ipconfig`，如 `192.168.1.100`）。手机与电脑需能访问该地址（同一 Wi-Fi，或服务器有公网 IP）。

> 公网部署建议用 Caddy/Nginx 反代为 `wss`：`unilink.example.com { reverse_proxy 127.0.0.1:8765 }`。

### 第 2 步：运行电脑客户端

**推荐直接双击 `pc-client\run.bat`**（自动用同一个解释器装依赖并启动）。或手动执行：

```bash
cd unilink/pc-client
py -m pip install -r requirements.txt
py main.py
```

> ⚠️ `pip install ...` 和 `py main.py` 必须是**同一个解释器**。若电脑装有多个 Python，`pip` 与 `py` 可能指向不同版本，导致"已安装却 ModuleNotFoundError"。请成对使用 `py -m pip install ...` 与 `py main.py`；可用 `py -0p` 查看所有已注册的解释器。

界面中填写：**服务器** `ws://192.168.1.100:8765/ws`、**房间码**（两端一致，4-32 位）、**令牌**（与服务器 `--token` 相同），点「连接」。状态栏出现 `已连接 · 🔐 AES-GCM` 即成功。

### 第 3 步：安装 Android 客户端

**方式 A（推荐，无需本地环境）—— GitHub Actions 云端构建：**

1. 把 `unilink/` 推到你的 GitHub 仓库（建议 Private；`.gitignore` 已排除 `config.json` 等含令牌的本地文件）。根目录 **`git-init.bat`** 可一键完成 git 初始化与推送。
2. 仓库页 → **Actions** → 若提示启用 workflow 则点确认 → **Build Android APK** → **Run workflow**。
3. 构建完成后在该次运行底部 **Artifacts** 下载 `UniLink-debug-apk.zip`，解压得到 `app-debug.apk`，传到手机安装。

**方式 B —— 本地 Android Studio：**

用 Android Studio（Hedgehog 2023.1.1+）打开 `unilink/android`，连上手机点 Run ▶；或命令行 `cd android && gradle wrapper && ./gradlew assembleDebug`，APK 位于 `app/build/outputs/apk/debug/`。

## 功能总览

| 功能 | 手机 → 电脑 | 电脑 → 手机 |
| --- | --- | --- |
| 文字消息 | ✅ | ✅ |
| **状态栏/系统通知镜像** | ✅（NotificationListenerService） | ✅（WinRT UserNotificationListener） |
| **在电脑上直接回复手机通知** | — | ✅（无障碍自动填写发送，失败自动回落） |
| 剪贴板同步 | ✅ | ✅ |
| 文件传输 | ✅ 接收 | ✅ 发送 |
| 端到端加密 AES-256-GCM | ✅ | ✅ |
| **扫码登录 authentik 项目** | ✅（手机扫码授权） | — |

> 🔐 **扫码登录**：手机登录一次 authentik 后，之后在任意接入 authentik OIDC 的项目登录页上点「手机扫码登录」，用 UniLink 扫码确认即可完成登录——无需为每个项目单独改造。部署见仓库 [docs/QR-LOGIN.md](https://github.com/Guyao146/UniLink/blob/main/docs/QR-LOGIN.md)。

## 目录结构

```text
unilink/
├─ server/server.py          # 中继服务器（Python，只转发不解密）
├─ auth-server/              # 扫码登录服务（OIDC Provider，authentik 的上游源）
├─ pc-client/                # Windows PC 客户端（Python + Tkinter）
├─ android/                  # Android 客户端（Kotlin，Android Studio 工程）
│  └─ app/src/main/java/com/unilink/app/
│     ├─ MainActivity.kt     # 界面与权限引导
│     ├─ LinkService.kt      # 前台服务：WebSocket 收发 / 弹通知 / 存文件
│     ├─ NotifCaptureService.kt  # 抓取状态栏所有通知
│     └─ auth/               # 扫码登录：authentik OIDC + 本地会话

## 常见问题

| 问题 | 处理 |
| --- | --- |
| **已安装包仍报 ModuleNotFoundError** | `pip` 与 `py` 指向了不同解释器。成对执行 `py -m pip install -r requirements.txt` + `py main.py`；或直接运行 `run.bat` |
| 连不上服务器 | 防火墙放行 8765/TCP；确认 IP、端口、令牌正确；手机与电脑同网段 |
| 手机收不到任何电脑通知 | 「允许弹出通知」未授予；或 App 被电池优化杀死 → 加入电池优化白名单 |
| 电脑收不到手机通知 | 「授予通知使用权」被系统回收，重新开启；部分厂商需再关掉 UniLink 的省电限制 |
| 电脑自己的通知没转发给手机 | 需安装通知捕获依赖：Python 3.7~3.11 执行 `pip install winsdk==1.0.0b10`；3.12+ 见 `pc-client/requirements.txt` 内的 winrt-* 说明。安装后还需在 设置→隐私和安全性→通知 中允许访问 |
| 自动回复失败 / 找不到回复按钮 | 1) 确认已开启「无障碍」；2) 手机需亮屏解锁；3) 目标通知必须仍留在通知栏；4) 个别应用控件文案不在中英文匹配范围内，会自动回落为"复制+打开应用" |
| 显示"明文模式" | 未装 `cryptography`，或房间里混入了浏览器测试页 |
| 电脑弹窗不是系统通知 | v1.1 起已默认发送**真实 Windows 系统 Toast**；若首次弹不出，删除 `%APPDATA%\Microsoft\Windows\Start Menu\Programs\UniLink.lnk` 和 `%LOCALAPPDATA%\UniLink\aumid.ok` 后重试 |
| iOS 支持？ | iOS 系统不允许第三方读取通知中心，无法实现同等级功能 |
| **扫码登录：登录页没有扫码按钮** | authentik 里的 OAuth Source 没绑定到 identification stage，见 QR-LOGIN.md 第二步 |
| 扫码后提示"不是 UniLink 登录码" | 二维码里的服务地址不是 https。出于安全考虑 App 拒绝把账号令牌发往公网 http |
| 扫码后提示"服务器不一致" | 二维码指向的服务与 App 登录时用的不是同一个——正常情况下这是钓鱼拦截，属预期行为 |
| 确认时提示"令牌已失效" | authentik 侧 refresh_token 过期或被吊销，重新登录即可；若频繁出现，检查 Provider 是否授予了 `offline_access` |
| 换手机后无法扫码登录 | 令牌加密密钥存在 Android Keystore 中，不随备份迁移，属预期行为，重新登录即可 |

## 已知限制与后续计划

已完成：

- [x] v1：文字 / 通知 / 剪贴板 / 文件 / E2E 加密
- [x] v1.1：在电脑上直接回复手机通知（无障碍自动化 + 复制回落）
- [x] PC 端真实 Windows 系统 Toast（自动 AUMID 引导）
- [x] GitHub Actions 云端自动构建 APK
- [x] v1.2：手机扫码登录所有接入 authentik OIDC 的项目

计划中：

- [ ] 通知图片/附件提取
- [ ] PyInstaller 单文件 exe 打包
- [ ] 局域网 mDNS 自动发现服务器（免手填 IP）
- [ ] auth-server 多实例部署（现为单实例内存会话）

## 与生态其他项目的关系

| 项目 | 作用 |
| --- | --- |
| `UniLink` | 手机与电脑互联；扫码登录是生态所有 Authentik 项目的统一移动端入口 |
| [Sakura-MCP-Server](sakura-mcp-server.md) | 扫码登录直接作用于它的 `/auth/login`，免输入即完成 OIDC 授权 |
| [Life Dashboard](life-dashboard.md) | 同样走 Authentik OIDC，可同样享受扫码登录 |
| [Sakura-Chat](sakura-chat.md) | 当前使用自建账号体系，与 UniLink 的账号链路互相独立 |

UniLink 的扫码登录设计为对下游项目零侵入：只要项目接入 authentik OIDC 并在登录页放一个「手机扫码登录」按钮，就能复用；不需要每个项目改造后端。

## 许可证

仓库当前**没有 LICENSE 文件**，README 也未声明许可证。按 GitHub 默认规则，代码在无许可证声明时保留所有权利，他人不具备使用、修改或再分发的默认授权。

README 结尾注明"仅供学习与个人使用"。正式发布或让他人部署前，应先在仓库添加明确的许可证，本 Wiki 页面以仓库最终声明为准。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。

├─ docs/PROTOCOL.md          # 通信协议与加密算法说明
├─ docs/QR-LOGIN.md          # 扫码登录部署指南（authentik 接入）
└─ tools/test_client.html    # 浏览器联调页
```

## 通知回复的实现

PC 点「回复通知…」选中一条手机通知并输入内容后：

- 弹窗中每条通知带 **⟨适配模式⟩ 徽标**（微信模式 / QQ 模式 / Telegram 模式 / 通用模式），模式来自**手机端动态同步的能力表**——在 `AppRules.kt` 里新增规则后无需改 PC 端。
- 手机无障碍已开启 → 全自动：拉下通知栏、点"回复"、填入文本、点"发送"，发送完成后**自动收起通知栏并回到原来的应用**。
- 未开启 / 屏幕锁定 / 控件识别失败 → 回复自动复制到手机剪贴板并打开来源 App，手动粘贴即可（PC 会收到失败原因提示）。

> Android 禁止第三方直接触发他应用通知里的 RemoteInput 动作，因此全自动回复依赖无障碍服务模拟点击（与 Pushbullet 同方案）。匹配关键词覆盖中/英文常见文案，个别定制 UI 可能识别失败，此时自动回落为"复制内容并打开来源 App"。

## 安全模型

**消息互通部分**：

- 房间码 + 访问令牌共同派生 32 字节密钥（PBKDF2-HMAC-SHA256 ×120000），所有业务 payload 用 **AES-256-GCM** 加密——服务器只转发密文。
- 令牌即密码：请使用强口令；浏览器测试页无加密能力，加入会强制房间降级为明文，正式使用时不要让 Web 页面进入房间。

**扫码登录部分**（独立于消息互通，两者互不影响）：

- auth-server 只**中转身份**：手机递上 authentik 令牌，服务端拿它去问 authentik「这是谁」。伪造令牌换不出身份，令牌被吊销立刻失效。服务端不存密码、不存长期令牌。
- 签发的 `sub` 沿用 authentik 的 `sub`，回连时匹配到同一用户，不会重复建号。
- 二维码 ticket 为 32 字节随机串（3 分钟过期），授权码一次性且 60 秒过期，支持并强制校验下游传来的 PKCE。
- **授权码只交给发起登录的那个浏览器**：页面里另有一个不进二维码的轮询密钥，因此别人拍下或截屏二维码也拿不到 code。
- **扫码后必须在手机上人工确认**，确认框显示"以谁的身份登录到哪个应用"——这是防"把二维码摆到别人面前"的唯一有效手段。
- 手机端令牌用 Android Keystore 硬件密钥加密后落盘；拒绝向公网 http 发送令牌；拒绝指向非本机登录服务器的二维码。
- App 是 public client，**强制 PKCE S256**——Android 自定义 scheme 可被抢注，没有 PKCE 时授权码被截获即等于账号失守。

详细协议见仓库 `docs/PROTOCOL.md` 与 `docs/QR-LOGIN.md`。


App 内：

1. 填服务器地址 / 房间码 / 令牌 → 点 **「连接并保持后台」**。
2. 点 **「授予通知使用权」**，在系统设置里允许 UniLink（★ 同步状态栏消息的关键授权）。
3. 点 **「允许弹出通知」**（Android 13+ 需要）。
4. （可选，推荐）点 **「登录 authentik」** 以启用扫码登录。
