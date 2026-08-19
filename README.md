# 樱落生态Wiki

> 🌸 Sakura EcoSystem · Connect Cloud, People and Home.

<img src="//api.mcylyr.cn/photo/logo/EcoSystem.png" alt="Logo" weight='200px' height="100px">

这里记录项目定位、安装方式、架构边界、部署流程与维护决策，让每个项目既能独立使用，也能组合成完整的个人数字系统。

## 当前项目

| 项目 | 定位 | 连接方式 | 当前版本 |
| --- | --- | --- | --- |
| [DSH Activity Tracker](docs/dsh-activity-tracker.md) | DeepSeek Harness Web 的本地活动统计插件 | 扫描本地 DSH 会话，可向 Life Dashboard 推送快照 | v1.6.2 |
| [Life Dashboard](docs/life-dashboard.md) | 个人生活中枢与可视化看板 | Authentik、Home Assistant、天气、To Do、AI 与 DSH | v0.10.1 |

## 生态主线

```text
DSH 本地会话
    │
    ├─ dsh-activity-tracker：解析、统计、展示
    │                     │ HTTPS + HMAC 快照
    ▼                     ▼
本地 DSH Web        Life Dashboard：统一生活看板
                          │
              Home Assistant / Authentik / To Do / AI
```

## 设计原则

- **本地优先**：活动统计默认只读取本机 `~/.dsh/sessions`，不上传会话内容。
- **显式授权**：跨设备连接通过一次性配对码完成，会话详情默认不授权。
- **密钥隔离**：服务器密钥放在 `.env`，浏览器只获取当前功能所需的数据。
- **可独立部署**：两个项目都能单独安装，Life Dashboard 的 DSH 集成是可选能力。

## 从哪里开始

- 想统计 DSH 使用情况：阅读 [DSH Activity Tracker](docs/dsh-activity-tracker.md)。
- 想搭建个人生活看板：阅读 [Life Dashboard](docs/life-dashboard.md)。

> 文档基于 2026-08-19 拉取的两个项目源码整理。实现变更后，以对应项目仓库和 CHANGELOG 为最终依据。
