# Sakura AI Cut

> Wiki 文档版本：`v1.2.0` · 更新日期：`2026-10-04`（Sakura AI Cut独立版本）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![Sakura AI Cut](../assets/badges/sakura-aicut.svg)](https://github.com/Guyao146/Sakura-AiCut)
[![已编写Wiki](../assets/sakura-wiki.svg)](sakura-aicut.md)

仓库：[Guyao146/Sakura-AiCut](https://github.com/Guyao146/Sakura-AiCut) · 许可证 [`Sakura-License v1.2`](../licenses/Sakura-License-1.2.md) · `package.json` 版本 `0.2.1`

## 项目定位

Sakura AI Cut 是一个无限画布式 AI 短剧/电影生成与在线剪辑平台。它把「AI 剧本 → 资产生成 → 分镜运镜 → 在线剪辑」串成一条流水线，所有能力按**五步工作台**组织，全程在一张无限画布上推进；内置自动规划 Agent，可以端到端替你跑完整条链路。

它不是模型训练工具，也不是云剪辑 SaaS：所有数据在本机 SQLite，模型能力由你配置的外部 API 提供，Docker 一键部署、无需编译镜像。

## 快速开始

只需本机有 Docker 与 Docker Compose，**无需编译任何镜像**：

```bash
git clone https://github.com/Guyao146/Sakura-AICut.git
cd Sakura-AICut

# （可选）改一下密钥与端口
cp .env.example .env

# 一键拉起：自动从 ghcr.io 拉取已构建好的镜像
docker compose up -d
```

3. 打开 <http://localhost:3000> 即可使用；容器数据持久化在 `sakura-data` 卷中。
4. 首次使用先到 **设置 → API 接入** 填写模型服务（NewAPI / OneAPI / 各家官方 API）。

> 生产环境请把 `.env` 中的 `SAKURA_SECRET` 改成至少 32 位的随机字符串——它用于加密保存供应商 API Key。默认端口 `3000`，Worker 并发 `3`。

### 本地开发

```bash
pnpm install
pnpm db:migrate      # 建库 + 写入内置提示词
pnpm dev             # 同时启动 web(3000) 与 worker
```

## 功能特性

- **无限画布 + 五步工作台**
  1. **项目设置** —— 项目名称、风格、类型
  2. **剧本** —— 手写或让旁边的 **AI 小助手**生成
  3. **资产生成** —— 人物 / 场景 / 道具 图片批量生成
  4. **镜头片段** —— 从内置运镜模板挑选，或自定义运镜提示模板
  5. **在线剪辑** —— 时间线编排、导出成片
- **自定义 API 接入** —— NewAPI / OneAPI / 火山引擎 / OpenAI / Claude / Gemini / Kling / MiniMax / DashScope 等通用与专用标准，**支持同步 / 异步任务**
- **按能力选模型** —— 文字、图片、视频三类能力各自指定路由，模型可任意组合
- **提示词库** —— 内置 12 条模板（剧本 / 镜头 / 风格 / 负面词 / 人物 / 场景 / 道具…），一键复制改造
- **运镜模板** —— 内置固定 / 推拉 / 摇移 / 跟随 / 环绕 / 升降 / 特殊，支持自定义运镜模板
- **自动规划 Agent** —— 一句话需求 → 自动拆解并执行全流程，随时可中断、可追问

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | Next.js 16（App Router）· React · Tailwind · @xyflow/react（无限画布） |
| 后端 | Next.js Route Handlers / Server Actions（Web）+ 独立 Worker（tsx 长驻进程） |
| 任务队列 | SQLite 表队列（Web 投递、Worker 轮询认领，支持异步任务与重试） |
| 数据库 | SQLite（node:sqlite），WAL 模式 |
| 媒体处理 | ffmpeg（时间线合成、导出） |
| 包管理 | pnpm workspace monorepo |

## 仓库结构

```text
apps/web          Next.js 应用（含 API / Server Actions）
apps/worker       任务执行器（资产生成、视频生成、Agent）
packages/core     类型 / AI 适配器 / 提示词库 / 运镜库 / Agent 规划
packages/db       SQLite 客户端 / 仓储 / 建表与种子
packages/pipeline 生成流水线（剧本→资产→镜头→时间线）
docker/           Dockerfile（web / worker）
```

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `SAKURA_DATA_DIR` | `./data` | SQLite / 上传素材 / 生成产物 / 渲染结果目录 |
| `APP_URL` | `http://localhost:3000` | 对外地址，用于回调与绝对链接 |
| `PORT` | `3000` | Web 服务端口 |
| `SAKURA_SECRET` | 占位值 | 加密保存供应商 API Key，生产环境必须改（≥32 字符） |
| `WORKER_CONCURRENCY` | `3` | Worker 并发执行的模型任务数 |
| `WORKER_POLL_INTERVAL` | `1500` | Worker 轮询间隔（毫秒） |
| `FFMPEG_PATH` | `ffmpeg` | ffmpeg 路径（Docker 镜像内已内置） |
| `JOB_TIMEOUT` | `600` | 单次生成任务超时（秒） |
| `ASYNC_TASK_TIMEOUT` | `1800` | 异步任务最大轮询时长（秒） |


## 任务队列与异步模型

Web 端投递任务到 SQLite 表队列，独立 Worker 长驻进程轮询认领并执行。这样设计的目的是让长耗时的视频生成不阻塞 Web 界面：

- **同步任务**：文字、图片类能力通常立即返回，直接在请求内完成。
- **异步任务**：视频生成等需要轮询的接口，由 Worker 按上游任务 ID 轮询，`ASYNC_TASK_TIMEOUT` 控制最大轮询时长（默认 30 分钟）。
- Worker 支持并发与重试；重启后未完成的任务会重新进入队列。

## 已知限制

- 依赖外部模型 API 才能生成内容；未配置 API 时只能使用画布编排与剪辑能力。
- ffmpeg 导出依赖宿主机或镜像内的二进制；本地开发需自行安装 ffmpeg。
- 自动规划 Agent 会按拆解步骤调用多次模型 API，消耗 Token 量大于单步操作，可随时中断。
- 当前版本未内置用户系统与多租户，适合单用户自部署。

## 许可证

自 2026-10-04（提交 `88600c5`）起采用 **Sakura-License v1.2**：源码可见、受覆盖的衍生作品同许可共享、保留署名，特定商用须事先取得版权人书面授权。它限制特定商业利用，属于源码可用（source-available）许可证，不是 OSI 批准的开源许可证。

- 许可正文与采用声明在仓库根目录 [`LICENSE`](https://github.com/Guyao146/Sakura-AICut/blob/main/LICENSE) 与 [`NOTICE.md`](https://github.com/Guyao146/Sakura-AICut/blob/main/NOTICE.md)；`package.json` 声明 `SEE LICENSE IN LICENSE`。
- 仓库 `LICENSE` 为正式固定版本 [`Sakura-License-1.2`](../licenses/Sakura-License-1.2.md)（2026-10-04 发布）；条文与审阅稿修订 3（[存档](../licenses/Sakura-License-1.2-draft.md)）逐字一致，不影响已授予的权利。
- 该仓库此前以 LGPL-2.1 授权；在 LGPL-2.1 下已取得副本的接收者可继续按该许可使用、修改与再分发，本次采用不追溯撤销既有授权。
- 运行依赖（Next.js、React、@xyflow/react、zod、zustand、clsx、Tailwind 等）多为 MIT，TypeScript 为 Apache-2.0，均保持各自原许可，不因一同分发而改用 Sakura-License。
- 商用授权申请入口见 [NOTICE.md](https://github.com/Guyao146/Sakura-AICut/blob/main/NOTICE.md)；上游项目以仓库最终声明为准。

## 与生态其他项目的关系

| 项目 | 作用 |
| --- | --- |
| `Sakura-AiCut` | AI 内容创作流水线，消费模型 API 产出短剧/视频 |
| [Local Model Gateway](local-model-gateway.md) | 可作为 AiCut 的统一上游：AiCut 把网关地址当作 OpenAI 兼容 API 填入，网关再向真实中转站分流 |
| [DSH Better Model Thinking Control](dsh-better-model-thinking-control.md) | 管理的是 DSH 内的思考档位；AiCut 的模型路由在自身设置内独立配置，两者互不影响 |

AiCut 不依赖生态任何其他项目即可独立运行；接入 Local Model Gateway 只是可选的统一管理方式。

## 版本记录

本表记录已核实的源码版本，不把包版本直接视为 Release tag。

| 版本 | 要点 |
| --- | --- |
| `0.2.1`（package.json） | 五步工作台与无限画布的源码快照；本次核实的提交调整了按节点类型分流的右键菜单、菜单宽度与直线连线 |
| 提交 `88600c5`（`0.2.1` 之后） | 仓库根 `LICENSE` 自 LGPL-2.1 切换为 Sakura-License-1.2 固定正文，新增 `NOTICE.md` 采用声明；`package.json` 改为 `SEE LICENSE IN LICENSE` |

来源：[package.json](https://github.com/Guyao146/Sakura-AiCut/blob/45e81df/package.json) 与 [画布调整提交 `45e81df`](https://github.com/Guyao146/Sakura-AiCut/commit/45e81df)；许可证切换见 [采用提交 `88600c5`](https://github.com/Guyao146/Sakura-AICut/commit/88600c5)。本表只摘录可确认内容，不推断更早版本的功能归属。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
