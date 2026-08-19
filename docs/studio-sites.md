# 顾瑶工作室网站群

官网：[www.mcylyr.cn](https://www.mcylyr.cn/)

> 一个站群，十个站点；从相遇开始，在游乐与创作中展开，最后回到可以承载日常生活的空间。

## 站群概览

| 站点 | 入口 | 作用 |
| --- | --- | --- |
| 樱落怡然 LHYY | [lhyy.mcylyr.cn](https://lhyy.mcylyr.cn) | 工作室品牌与内容展示入口 |
| OA 控制台 / 统一认证 | [login.mcylyr.cn](https://login.mcylyr.cn) | 统一登录、身份认证和后台入口 |
| 樱落怡然 · 我的世界 | [mc.mcylyr.cn](https://mc.mcylyr.cn) | Minecraft 相关的游戏与社区空间 |
| 皮肤站 / 共享登录 | [pfz.mcylyr.cn](https://pfz.mcylyr.cn) | 皮肤、角色和游戏登录服务 |
| AI 控制台 | [chat.mcylyr.cn](https://chat.mcylyr.cn) | AI 对话、模型和创作工作台 |
| OpenClaw 小助手 | [openclaw.mcylyr.cn](https://openclaw.mcylyr.cn) | 面向智能助手与自动化实验的空间 |
| BigBanana AI 绘图 | [aicut.mcylyr.cn](https://aicut.mcylyr.cn) | AI 图像生成与视觉创作工具 |
| 樱落怡然云盘 | [pan.mcylyr.cn](https://pan.mcylyr.cn) | 文件存储、分享和跨设备流转 |
| API 统一接口 | [api.mcylyr.cn](https://api.mcylyr.cn) | 站群公共 API 与后端能力入口 |
| 生活看板 | [life.mcylyr.cn](https://life.mcylyr.cn) | 将家庭、日程、AI 和工作状态汇入一个看板 |

## ACT 01 · 相遇

### 樱落怡然 LHYY

[打开 LHYY](https://lhyy.mcylyr.cn)

LHYY 是站群中面向外部访问者的品牌与内容入口，承载工作室的视觉表达、作品展示和品牌叙事。它更像一张“名片”，负责让访问者先认识工作室。

### OA 控制台 / 统一认证

[打开统一认证](https://login.mcylyr.cn)

统一认证站点是站群的身份基础设施。其他需要登录的服务可以通过它完成统一身份验证，避免每个站点各自维护一套账号体系。Life Dashboard 的管理员权限也依赖 Authentik/OIDC 认证链路。

## ACT 02 · 游乐

### 樱落怡然 · 我的世界

[打开 Minecraft 站点](https://mc.mcylyr.cn)

这是站群中面向 Minecraft 的游戏空间。

### 皮肤站 / 共享登录

[打开皮肤站](https://pfz.mcylyr.cn)

皮肤站负责游戏角色外观、皮肤管理和共享登录体验，承担身份、外观和登录服务。

## ACT 03 · 创作

### AI 控制台

[打开 AI 控制台](https://chat.mcylyr.cn)

AI 控制台是面向对话和模型能力的创作入口。它与 Wiki 中记录的 Life Dashboard AI 助手属于相邻能力：前者是独立的 AI 工作台，后者把 AI 嵌入个人生活数据和看板上下文。

### OpenClaw 小助手

[打开 OpenClaw](https://openclaw.mcylyr.cn)

OpenClaw 小助手是站群中的智能助手与自动化实验空间，承载更偏向 Agent、工具和自动化流程的探索。

### BigBanana AI 绘图

[打开 AI 绘图](https://aicut.mcylyr.cn)

BigBanana AI 绘图把创作从文字和对话延伸到视觉内容，用于图像生成、素材尝试和视觉表达。

## ACT 04 · 流转

### 樱落怡然云盘

[打开云盘](https://pan.mcylyr.cn)

云盘是站群的数据流转层：文件从创作工具产生后，需要被保存、分享和在设备之间访问，云盘承担了这部分基础能力。

### API 统一接口

[打开 API](https://api.mcylyr.cn)

API 统一接口是站群的公共连接层。它把多个站点需要复用的后端能力、接口和服务统一起来，减少每个站点重复建设基础设施。

### 生活看板

[打开 Life Dashboard](https://life.mcylyr.cn)

生活看板是当前 Wiki 重点记录的个人生活中枢。它把 Home Assistant、天气、Microsoft To Do、日历、纪念日、AI 助手和 DSH 工作区动态放到同一个 Dashboard 中，是“流转”篇章回到日常生活的最后一站。

## 与 Wiki 项目的关系

```text
樱落站群首页
      │
      ├─ 身份：统一认证 / OA
      ├─ 游乐：Minecraft / 皮肤站
      ├─ 创作：AI / OpenClaw / AI 绘图
      ├─ 流转：云盘 / API
      └─ 生活：Life Dashboard
                    │
                    └─ DSH Activity Tracker
```


## 其他导航

| 类型 | 地址 |
| --- | --- |
| 站群首页 | [www.mcylyr.cn](https://www.mcylyr.cn/) |
| GitHub - 主页 | [github.com/Guyao146](https://github.com/Guyao146) |
| Github - DSH 活动统计 | [dsh-activity-tracker](https://github.com/Guyao146/dsh-activity-tracker) |
| Github - 生活看板 | [Life-Dashboard](https://github.com/Guyao146/Life-Dashboard) |

> 官网的站点数量、文案和入口可能会随站群演进变化；本文根据 `www.mcylyr.cn` 当前页面整理，具体服务状态以各站点实际访问结果为准。