# SakuraCode

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-10-05`（SakuraCode独立版本，本地源码 `0.1.0`，尚未公开仓库）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![已编写Wiki](../assets/sakura-wiki.svg)](sakuracode.md)

源码状态：本地开发中（`D:\VSProject\SakuraCode`），尚无公开仓库与 Release；本页以本地源码与 README 整理，正式发布前以仓库和 `package.json` 为准。

## 项目定位

SakuraCode 是一个对标 ZCode 风格的终端编码智能体（CLI coding agent），用 TypeScript（ESM）编写。模型通过工具循环读写代码、执行命令、检索仓库，并能把自包含子任务并行委派给 subagent。它的插件体系刻意对齐 DeepSeek Harness（dsh）的架构哲学——**Everything is a Plugin**：内置一个零依赖的 Cordis 风格微内核，服务、工具、审批门、终端渲染全部以插件形式挂载，组合本身就是数据。

## 架构

```text
┌───────────────────────────────────────────────────────────────┐
│ CLI (src/cli.ts)   REPL · -p one-shot · --dump-config          │
└──────────────────────────┬────────────────────────────────────┘
                           │ createHarness(opts)
┌──────────────────────────▼────────────────────────────────────┐
│ harness (src/harness.ts) — BASE_BUNDLE：组合即数据              │
│  core-session → core-system-prompt → core-plugin-registry      │
│  → core-identity → core-approval → core-llm → core-tools       │
│  → core-jobs → core-agent                                      │
│  → tool-fs / tool-fs-search / tool-shell / tool-jobs           │
│  → tool-todo / tool-web / tool-subagent / tool-subagent-control│
│  → dsh-plugin-manager → (bundles + pluginsDir drop-in)          │
│  → ui-renderer（终端渲染，只听 ui/* 事件）                      │
└──────────────────────────┬────────────────────────────────────┘
                           │ ctx.plugin(name/inject/apply)
┌──────────────────────────▼────────────────────────────────────┐
│ kernel Context (src/kernel) — 服务注册表 + 五种事件模式          │
└───────────────────────────────────────────────────────────────┘
```

## 特性

- **微内核**（`src/kernel`）：五种事件派发模式（`emit` / `parallel` / `serial` / `bail` / `waterfall`）；一切注册可逆（`on()` / `effect()` 返回 disposer，`dispose()` 按 LIFO 释放）；插件以 `name` / `inject` / `apply(ctx, config)` 挂载，`inject` 声明的服务键未就绪时自动等待（round-robin 重试）。
- **会话**：append-only JSONL 日志（`.sakura/sessions/<id>/session.jsonl`），"model-visible means logged"——每次请求的上下文都能通过 `deriveMessages()` 从日志重建；支持按 session id 恢复（`--resume <id>`）。
- **工具集**（18 个，按 `read` / `write` / `execute` / `agent` 四类）：
  - read：`read` · `glob` · `grep` · `web_fetch` · `job_list` · `job_output` · `todo_write` · `list_subagent_models` · `list_agents` · `plugin_manager`
  - write：`write` · `edit`
  - execute：`bash` · `pwsh` · `job_kill`
  - agent：子任务委派与并行 subagent 控制。
- **审批门**：`/mode` 切换审批模式；工具执行前可经 `tools/pre-execute` 拦截。
- **REPL 斜杠命令**：`/help` `/plugins` `/sessions` `/resume <id>` `/mode <m>` `/agents` `/tools` `/new` `/exit`。
- **无 Key 冒烟**：`npm test`（vitest）不触网；`createHarness({ adapter })` 可注入自定义 `ModelAdapter`；把 `SAKURA_BASE_URL` 指向任意本地 OpenAI 兼容服务（`http://` 开头即允许无 key 注册适配器）也能直接跑通。

一个 turn 的事件流水线（事件名即公共契约）：`turn/start`（waterfall，可拒绝输入）→ 每步 `step/start` → `agent/request` → `llm/stream` → `tools/pre-execute → execute → post-execute` → `step/end` → `agent/turn-stopping`。UI 观测事件：`ui/turn/start` · `ui/text` · `ui/tool/call` · `ui/tool/result` · `ui/todos` · `ui/turn/end`。会话日志事件：`agent/meta` · `system/message` · `user/message` · `assistant/message`（内嵌流摘要）· `tool/call` · `tool/result` · `assistant/attempt`（仅观测）· `session/note`（仅观测）。

## 与 DeepSeek Harness（dsh）的对齐

SakuraCode 的插件契约刻意对齐 dsh 的架构哲学，`dsh-plugin-manager` 插件可以直接装载 dsh 生态的插件包（如本 Wiki 已收录的 [DSH Activity Tracker](dsh-activity-tracker.md)、[DSH Better Model Thinking Control](dsh-better-model-thinking-control.md)、[DSH Windows Tool Fix](dsh-windows-tool-fix.md) 的 tgz 发布包），让 dsh 插件在终端编码智能体中复用。

## 与生态其他项目的关系

- SakuraCode 是「用生态工具链写代码」的入口：模型请求可经 [Local Model Gateway](local-model-gateway.md) 转发，长期记忆可接入 [Sakura-MCP-Memory-Server](sakura-mcp-memory-server.md)，dsh 插件可直接装载。
- 处于本地开发阶段，未发布仓库、未定许可证；本页记录当前状态，不构成发布声明。

## 版本记录

| 版本 | 要点 |
| --- | --- |
| `0.1.0`（package.json，本地） | Cordis 风格微内核 + 六种核心插件包；18 工具四分类；JSONL 会话与 `deriveMessages()` 重建历史；subagent 并行委派；dsh-plugin-manager 装载 dsh 插件包；REPL 与 one-shot 模式 |

来源：本地 `D:\VSProject\SakuraCode` 的 README 与 `package.json`（无 git 仓库、无远端）。发布到 GitHub 后应更新仓库链接、许可证与版本依据。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
