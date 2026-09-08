# Local Model Gateway

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-09-08`（Local Model Gateway独立版本）

仓库：[Guyao146/Local-Model-Gateway](https://github.com/Guyao146/Local-Model-Gateway) · 许可证 `LGPL-v2.1`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![Local Gateway](https://img.shields.io/badge/Local-Gateway-3f9d6d)](https://github.com/Guyao146/Local-Model-Gateway)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

Local Model Gateway 是运行在本机的轻量模型聚合网关。它把本地客户端的 OpenAI、Anthropic 和 Responses 请求转发到多个可配置的上游站点，并在中间完成协议转换、路由分流、熔断降级、限流和用量统计。

它解决的是「一台机器上装了多个 AI 客户端，每个客户端各自配一堆中转站」的重复劳动：上游只在网关里配置一次，客户端统一指向 `http://127.0.0.1:8787/v1`，用网关签发的本地 Key 访问。

它不是账单系统，也不是模型训练或推理引擎。余额查询是按需手工触发的读取操作，用量统计只用于本地排查，不等同于上游账单。

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 运行要求 | Node.js `18+`（使用内置 `fetch`） |
| 第三方依赖 | 无，仅使用 Node 内置模块 |
| 默认监听 | `127.0.0.1:8787` |
| 本地协议 | OpenAI Chat Completions、Anthropic Messages、OpenAI Responses |
| 上游协议 | OpenAI 兼容、Anthropic |
| 管理后台 | `/`，本机回环免认证；远程使用 Authentik OIDC |
| 模型调用认证 | 后台签发的本地 API Key |
| 配置存储 | `data/config.json`，`0600` 权限、原子写 |
| 测试 | 10 个纯 Node 测试脚本，`npm test` 一次跑完 |

## 功能概览

| 领域 | 能力 |
| --- | --- |
| 协议转换 | 三种本地协议与两种上游协议互转，含 SSE 流式响应 |
| 上游管理 | 增删改、连接测试、`/v1/models` 拉取回填、客户端标识预设 |
| 路由 | 精确匹配 → `*` 兜底 → 上游模型列表匹配；故障转移、轮询、加权轮询、随机 |
| 模型选择 | 同名模型跨站合并、按前缀分组、本地别名、默认思考强度 |
| 轮询池 | 同名模型可勾选参与轮询的上游子集，未勾选的站点不参与分流 |
| 可靠性 | 内存熔断（阈值 + 冷却 + 半开探测）、全局并发限制、每 Key 限流 |
| 观测 | 聚合计数 + 可分页的追加式请求日志，`x-request-id` 全链路透传；支持导出最近 100 条或全部保留记录 |
| 余额 | NewAPI Token Usage、常见额度字段、Sub2API 平台额度解析 |
| 桌面端 | Windows WebView2 与 Electron 客户端，内嵌网关并自动选择空闲回环端口 |
| 升级 | 后台检查 GitHub Release，校验 SHA-256、备份 `data/` 后自动升级并重启 |

## 架构

```text
Claude Code / Codex CLI / Cherry Studio / 其他本地客户端
                    │
                    │ HTTP + 本地 API Key
                    ▼
            Local Model Gateway
        ┌───────────┼────────────┐
        │           │            │
    协议转换     路由与熔断     指标与日志
        │           │            │
        └───────────┼────────────┘
                    │
        多个 OpenAI 兼容 / Anthropic 上游

浏览器 ── 回环免认证 / Authentik OIDC ── 管理后台
```

模块划分：

```text
src/server.js          HTTP 服务、鉴权、路由、转发与管理接口
src/config.js          配置读写、密钥掩码、原子落盘
src/protocol.js        OpenAI / Anthropic / Responses 互转
src/routing.js         四种分流策略的候选排序
src/metrics.js         聚合计数与 JSONL 请求日志
src/admin-auth.js      回环识别与 Authentik OIDC
src/balance.js         上游余额响应解析
src/client-identity.js 客户端标识预设
public/                管理后台前端
test/                  单元与集成测试
```

## 请求路径

```text
本地客户端请求
  │ 校验本地 API Key
  │ 并发槽与每 Key 限流检查
  ├─ 选择路由：精确 → 通配 → 上游模型列表 → 单上游兜底
  ├─ 过滤已停用和熔断中的上游，按策略排序候选
  ├─ 依次尝试：连接失败、超时、408/425/429、5xx 时换站
  │   上游返回 4xx 参数或鉴权错误时不换站，避免掩盖配置问题
  ├─ 本地协议与上游协议不同时执行转换
  └─ 记录聚合计数与请求日志
```

流式请求只在建立上游响应之前切换站点。一旦开始向客户端输出内容就不再重试，避免重复生成。

## 模型选择与轮询池

后台的模型目录会按模型 ID 合并所有来源站，并按前缀分组。每个模型可以：

- 勾选是否暴露给本地客户端；
- 设置本地别名和默认思考强度；
- 在多站存在时选择「自动选择」或「固定站」。

选择「自动选择」后会出现**轮询站点**勾选框，只有勾选的上游参与轮询。保存时网关把选择合成一条托管路由：

| 模式 | 生成的托管路由 |
| --- | --- |
| 自动选择 | 池中第一个站为主上游，其余为备用，策略 `round_robin` |
| 固定站 | 只有主上游，无备用，策略 `failover` |

勾选数少于两个时前端会回退为全部站点。手工路由与托管路由可以共存，同名冲突会在保存时报错。

## 思考强度

客户端显式提供 `reasoning_effort` 或 `thinking` 时优先使用客户端值，否则按配置的档位转换：

| 档位 | OpenAI 兼容上游 | Anthropic 上游 |
| --- | --- | --- |
| low | `reasoning_effort: low` | `budget_tokens: 2048` |
| medium | `reasoning_effort: medium` | `budget_tokens: 4096` |
| high | `reasoning_effort: high` | `budget_tokens: 8192` |
| auto / off | 不主动添加 | 不主动添加 |

网关会从上游模型元数据识别 `supports_thinking`、`thinking_levels`、`reasoning_effort`、`supported_parameters` 等字段；上游声明不支持思考时不会强行添加参数。

## 指标与请求日志

聚合计数与请求明细分开存放，避免每次请求重写大文档：

| 文件 | 内容 | 写入方式 |
| --- | --- | --- |
| `data/metrics.json` | 总量与按上游统计的计数器 | 每次请求原子重写 |
| `data/metrics-log.jsonl` | 逐条请求明细，一行一条 JSON | 追加写入 |

日志默认保留 5000 条，可用 `LOCAL_MODEL_GATEWAY_MAX_LOGS` 调整，下限 100。文件行数超过上限两倍时压实回上限。日志只含脱敏元数据与 Token 数字，不含请求内容或密钥。

管理接口 `GET /api/admin/metrics/logs` 支持 `limit` 与 `offset` 分页，后台「加载更多」按已渲染行数递增 offset。`GET /api/admin/metrics/export?scope=recent|all` 可导出最近 100 条或当前保留的全部记录；管理页面每 5 秒只刷新统计，不会重新加载配置或打断尚未保存的模型选择。

每次模型请求都会返回并向上游透传 `x-request-id`；客户端提供合法 ID 时沿用，否则由网关生成。JSON 错误与日志保留同一 ID，便于跨网关和上游排查。

## 认证边界

管理面与调用面完全分开：

| 面 | 接口 | 认证 |
| --- | --- | --- |
| 管理面 | 后台页面与 `/api/admin/*` | 本机回环免认证；远程 Authentik OIDC |
| 调用面 | `/v1/*` | 本地 API Key，回环与远程一视同仁 |

远程管理使用 Authorization Code + PKCE、state、nonce 和 JWKS 签名校验，会话为 HttpOnly Cookie 且只存服务端内存，重启后失效。Client Secret 只从环境变量读取，不写入配置文件。

网关默认只信任 TCP socket 地址，不信任客户端发来的 `X-Forwarded-For`。经反向代理时需要把代理 IP 加入 `TRUSTED_PROXY_ADDRESSES`。

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | 监听地址 |
| `PORT` | `8787` | 监听端口 |
| `LOCAL_MODEL_GATEWAY_DATA_DIR` | 项目下 `data` | 配置与指标目录 |
| `LOCAL_MODEL_GATEWAY_MAX_LOGS` | `5000` | 请求日志保留条数，最小 100 |
| `AUTHENTIK_ISSUER_URL` | — | Authentik OIDC issuer |
| `AUTHENTIK_CLIENT_ID` | — | Client ID |
| `AUTHENTIK_CLIENT_SECRET` | — | Client Secret，仅环境变量 |
| `AUTHENTIK_REDIRECT_URI` | — | 以 `/auth/oidc/callback` 结尾 |
| `AUTHENTIK_SESSION_TTL_SECONDS` | `28800` | 远程会话最长期 |
| `TRUSTED_PROXY_ADDRESSES` | — | 可信反代 IP，逗号分隔 |

## 可靠性设置

| 设置 | 范围 | 默认 |
| --- | --- | --- |
| 上游超时 | 1000–3600000 ms | 600000 |
| 最大备用尝试 | 0–12，0 不限 | 0 |
| 切换前等待 | 0–30000 ms | 0 |
| 熔断失败阈值 | 1–20 | 3 |
| 熔断冷却 | 1000–3600000 ms | 60000 |
| 最大并发请求 | 0–1000，0 不限 | 0 |
| 每 Key 每分钟请求 | 0–10000，0 不限 | 0 |

熔断状态、路由游标和余额缓存都只存内存，重启后重置。

## Windows 桌面客户端

`v1.0.0` 起仓库同时发布两种 Windows 客户端：

- WebView2：.NET 8 WinForms，随包携带 Node.js 20 Windows x64 runtime，需要系统安装 Microsoft Edge WebView2 Runtime；
- Electron：提供安装包和 Portable 版本，自带运行时。

客户端内嵌网关并自动选择空闲的 `127.0.0.1` 端口，配置存放在当前用户目录，升级程序不会覆盖。Release 还包含源码升级包；后台检查到更新后会校验 SHA-256、备份 `data/`，再执行升级和重启。

## 安装与启动

```powershell
git clone https://github.com/Guyao146/Local-Model-Gateway.git
cd Local-Model-Gateway
node src/server.js
```

启动时终端会打印默认本地 API Key。打开 <http://127.0.0.1:8787/> 即进入后台，本机访问不需要任何管理凭据。

客户端配置：Base URL 填 `http://127.0.0.1:8787/v1`，API Key 填后台创建的 `sk-local_...`。

## 与生态其他项目的关系

Local Model Gateway 处在模型调用链路的最前端，与生态其他项目没有强制依赖：

- [DSH Better Model Thinking Control](dsh-better-model-thinking-control.md) 关注「在 DSH 里配置思考档位」，写入 DSH 原生设置；Local Model Gateway 关注「请求实际发往哪个上游」。两者都会读取中转站 `/models` 的能力元数据，但作用层次不同，可以叠加使用：DSH 把网关当作一个中转站，网关再向真实上游分流。
- [Sakura-MCP-Server](sakura-mcp-server.md) 处理 Agent 的长期记忆，走 MCP 协议；网关处理模型请求转发，走 OpenAI/Anthropic 协议。两者互不经过对方。
- 网关的用量统计只覆盖经过它的请求，不替代 [DSH Activity Tracker](dsh-activity-tracker.md) 的会话级统计。

## 测试

```powershell
npm.cmd test
```

覆盖协议转换、分流策略、模型分组、余额解析、客户端标识、来源识别六组单元测试，以及 OIDC 登录、网关转发与熔断、流式响应、模型选择四组集成测试。集成测试会在临时目录启动真实网关进程并用内存 mock 模拟上游。

## 项目内文档

仓库自带一份更细的文档，位于 `wiki/` 目录，可通过 `wiki/index.html` 在浏览器中阅读，包含架构与模块、接口参考、路由与轮询、指标与日志、认证与安全、部署与配置、开发与测试七个章节。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
