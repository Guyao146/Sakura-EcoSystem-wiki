# Sakura Chat

> Wiki 文档版本：`v1.0.2` · 更新日期：`2026-09-23`（Sakura Chat独立版本）

仓库：[Guyao146/Sakura-Chat](https://github.com/Guyao146/Sakura-Chat) · 许可证见下方说明

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![Node.js](https://img.shields.io/badge/Node.js-≥22-3c873a)](https://nodejs.org/)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

Sakura Chat 是一个仿微信的网页聊天应用：账号密码登录、好友/群聊、实时消息、加密传输 + 加密存储。Node.js 全栈（后端 Express + WebSocket + SQLite，前端原生 ES Module 单页应用，无构建步骤、无 CDN 依赖）。

它不是 IM 云服务或 SaaS：所有数据落在本机 SQLite，主密钥由本机生成，部署后完全自有。聊天记录搜索、多端漫游等能力建立在「服务端可解密存储」的前提下，因此它不适合作为完全零信任的端到端加密工具。

## 快速开始

```bash
git clone https://github.com/Guyao146/Sakura-Chat.git
cd Sakura-Chat
npm install

# 生产部署请先设置 JWT 密钥
cp .env.example .env
# 把 .env 里的 JWT_SECRET 改成随机值：openssl rand -hex 32

npm start          # 或 npm run dev（改动自动重启）
```

3. 浏览器打开 <http://localhost:3000>，注册账号即可使用。
4. 开两个浏览器窗口（或无痕窗口）注册两个账号互加好友，即可体验完整流程。

> 环境要求 Node.js `≥22`（使用内置 `node:sqlite` 与 `node:crypto`，无需编译原生模块）。首次启动会在 `server/data/key.json` 自动生成**存储主密钥**，用于加密数据库中的聊天记录——**该文件必须备份，丢失将无法解密历史消息**。

### Docker Compose（推荐生产环境）

```bash
cp .env.example .env
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
docker compose up -d --build
```

- 访问 <http://localhost:3000>，用 `HOST_PORT=8080 docker compose up -d` 可换宿主机端口。
- 主密钥 `key.json` 与 SQLite 在 `sakura-data` 卷，上传文件在 `sakura-uploads` 卷；重建容器不丢数据，但请定期备份卷。
- 已发布 GHCR 镜像 `ghcr.io/guyao146/sakura-chat`，可在 compose 中直接用 `image:` 替换本地构建。

## 功能概览

| 模块 | 功能 |
| --- | --- |
| 账号 | 用户名/密码注册登录、JWT 鉴权、密码 scrypt 哈希存储 |
| 好友 | 用户名/昵称搜索、好友请求（发送/同意/拒绝）、好友列表、删除好友、**文件传输助手**（内置系统账号，注册即自动互加好友，消息自动送达+已读，不可登录/搜索/删除） |
| 单聊 | 实时收发、离线消息存储、**已发送 → 已送达 → 已读** 状态回执 |
| 群聊 | 建群（群主）、邀请/移出成员、退群、解散群、群成员列表、**群公告**、**群昵称**、群主/管理员（管理员可发公告、移人） |
| 消息 | 文字、Emoji 表情面板、**表情包（程序化生成的猫咪贴纸）**、图片消息（上传/预览）、**语音消息（按住说话、波形播放）**、系统消息 |
| 消息交互 | **2 分钟内撤回**、**引用回复**（点击卡片跳转原文）、**表情反应角标**、**消息编辑**、**拍一拍**、消息复制、未读角标、未读分界线、滚动加载历史 |
| 通话 | **1 对 1 语音/视频通话**（WebRTC P2P 直连 + DTLS-SRTP 加密，信令走加密 WS 通道） |
| 输入 | 粘贴/拖拽图片直接上传、右键菜单（复制/引用/拍一拍/撤回/编辑/收藏） |
| 状态 | **四态在线状态**（在线/隐身/忙碌/离线，隐身对他人表现为离线）、"对方正在输入…" |
| 会话管理 | **置顶**、**免打扰**、**全局搜索**（好友/群/消息/收藏四分组）、**消息收藏** |
| 聊天记录 | 服务端加密存储、分页加载、会话内搜索 |
| 资料 | 修改昵称、个性签名、上传头像 |
| 界面 | Markdown 渲染、**移动端自适应**、侧边栏可拖拽调宽（宽度记忆）、**输入框默认占满剩余空间、高度可拖拽调节（拖到顶或双击把手恢复占满）** |

## 架构与加密

采用「传输层加密 + 服务端可解密存储」三层模型：

```text
浏览器 ── TLS (HTTPS/WSS) ── 服务端 ── SQLite
   │                            │
   └─ 会话密钥（登录后下发）      └─ AES-256-GCM 加密存储
      每条消息 AES-GCM 加密         主密钥 key.json
```

1. **传输层**：HTTPS/WSS（TLS），可用自签证书或反代终结。
2. **会话层**：登录后服务端下发会话密钥，客户端对每条消息做 AES-256-GCM 加密后再发送，服务端解密后按类型分发。
3. **存储层**：聊天记录在 SQLite 中以密文存放，主密钥独立保存在 `key.json`。

音视频通话的**信令**复用加密 WS 通道，**媒体流**由两台浏览器 WebRTC P2P 直连（DTLS-SRTP 加密）——服务器既不转发媒体、也无法解密音视频内容。通话信令仅允许好友之间中继。

## 目录结构

```text
server/index.js     HTTP(S) + WebSocket + 静态托管前端
server/crypto.js    AES-256-GCM 加解密、scrypt 密码哈希
server/db.js        SQLite 表结构与 DAO（含幂等迁移）
server/ws.js        收发/已读/输入/撤回/反应/编辑/拍一拍/心跳/重连
server/system.js    系统账号「文件传输助手」
server/api/         auth / users / friends / groups / conversations / stickers / upload
public/             前端（Express 直接托管，无构建步骤）
public/js/lib/      crypto / api / socket / util / emoji / voice / call
test/e2e.js         端到端集成测试（45 项断言）
```

## 接口

| 方法 | 路径 | 作用 |
## 测试

```bash
npm start                                # 先启动服务（另开终端）
HOST=http://127.0.0.1:3000 npm test      # 运行端到端测试
```

覆盖注册登录、JWT、会话密钥、好友请求/同意、加密 WS 收发、ACK、已读回执、撤回、群聊广播、表情包与语音消息、通话信令中继、引用回复/表情反应/消息编辑/拍一拍、置顶+免打扰、全局搜索、收藏、隐身状态广播、文件传输助手，以及**断言数据库中不存在明文聊天记录**，共 45 项。

GitHub Actions 在每次 push/PR 执行**语法检查 + 45 项 E2E + Docker 镜像构建冒烟**；push master 时额外把镜像推送到 GHCR。

## 近期更新

| 提交 | 要点 |
| --- | --- |
| 文件传输助手 | 内置系统账号，注册即自动互加好友，消息自动送达+已读，不可登录/搜索/删除 |
| 输入框高度自适应 | 输入框高度随内容自适应增长，顶部把手可拖拽调节并记忆；默认占满剩余空间，拖到顶或双击把手恢复占满 |

> 仓库使用 master 分支且暂无 Release tag，上表以 master 提交记录为准。

## 音视频通话说明

- 单聊会话头部点 📞（语音）或 📹（视频）发起；对方收到振铃弹窗（WebAudio 合成铃声）。
- 支持静音、开/关摄像头、切换前后摄像头、挂断与通话计时。
- 挂断后由主叫方写入一条系统消息（如「语音通话 02:15」「视频通话未接听」），双方可回看。
- `getUserMedia` 仅在 **HTTPS 或 localhost** 下可用；NAT 穿透依赖公共 STUN，严格 NAT 需在 `public/js/lib/call.js` 的 `ICE_SERVERS` 补充 TURN。
- 通话期间 WebSocket 断开自动结束通话；超过 45 秒无人接听自动挂断。

## 生产部署建议

1. **启用 TLS**：把证书放到 `server/data/`，在 `.env` 配置 `SSL_KEY_PATH` / `SSL_CERT_PATH`；或用 Nginx/Caddy 反代终结 TLS（需放行 WebSocket Upgrade 头）。
2. **修改 JWT 密钥**：`.env` 设置随机 `JWT_SECRET`，或执行 `npm run keygen`。
3. **备份主密钥**：`server/data/key.json` 丢失将导致历史聊天记录无法解密。Docker 用户定期执行：

   ```bash
   docker run --rm -v sakura-chat_sakura-data:/data -v $PWD:/backup alpine tar czf /backup/data.tgz -C /data .
   ```

4. SQLite 单机足够中小规模使用；如需横向扩展可平滑迁移至 Postgres/MySQL。
5. 上传目录 `public/uploads/` 需可写，建议挂载到独立卷或对象存储。

## 已知局限

- 聊天记录搜索为服务端解密后内存检索（适合中小消息量），超大规模需引入加密检索方案或明文索引。
- 同一账号多标签页登录会共存（各自独立会话密钥），暂未做互踢。
- 图片与语音文件本身以文件形式存放于 uploads 目录，未做静态加密（消息正文中的链接仍加密存储）。
- 音视频通话仅支持**好友间 1 对 1**；群组多人通话需要 SFU 媒体服务器，暂未集成。
- 语音消息的波形为录音时采集的频谱峰值快照，并非精确音频波形。

## 与生态其他项目的关系

| 项目 | 作用 |
| --- | --- |
| `Sakura-Chat` | 自有的网页聊天应用，加密传输 + 加密存储 |
| [UniLink](unilink.md) | 手机与电脑互联；其扫码登录基于 Authentik，与 Sakura-Chat 的本地账号体系互相独立 |
| [Sakura-MCP-Server](sakura-mcp-server.md) | Agent 长期记忆，走 MCP 协议，与聊天应用互不经过 |

Sakura-Chat 当前使用自建账号体系，不依赖 Authentik；可以与生态其他项目部署在同一台机器上，互不干扰。

## 许可证

仓库当前**没有 LICENSE 文件**，也未在 `package.json` 声明 `license` 字段。按 GitHub 默认规则，代码在无许可证声明时保留所有权利，他人不具备使用、修改或再分发的默认授权。

正式发布或让他人部署前，应先在仓库添加明确的许可证（生态其他项目常用 `LGPL-2.1`），本 Wiki 页面以仓库最终声明为准。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。

| --- | --- | --- |
| `POST` | `/api/auth/register` `/login` | 注册 / 登录，返回 JWT 与会话密钥 |
| `GET` | `/api/friends` `/api/friends/requests` | 好友列表与请求 |
| `POST` | `/api/groups` | 建群、邀请成员、公告 |
| `GET` | `/api/conversations/:id/messages` | 分页历史（服务端解密后返回） |
| `POST` | `/api/conversations/:id/read` | 标记已读并回执对方 |
| `GET` | `/api/conversations/:id/search?q=` | 聊天记录搜索（服务端解密后检索） |
| `POST` | `/api/upload` | Base64 图片/文件/语音上传 |
| — | `ws(s)://host/ws?token=&sid=` | 加密实时通道 |

WebSocket 协议：客户端发送 `{sid, d: base64(IV+密文+Tag)}`，服务端解密后按 `type` 分发（`chat / read / typing / recall / call_* / ping`），服务端推送 `message / ack / status / read / typing / presence / recall / friend_request / group_* / call_*`。
