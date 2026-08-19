# 项目关系

## 两个项目分别解决什么问题

`dsh-activity-tracker` 关注“开发工作发生了什么”：从 DSH 压缩 JSONL 会话文件中提取用户输入、工具调用、Token 使用、项目、日期和小时等摘要，并在 DSH Web 中展示。

`Life Dashboard` 关注“生活与工作状态如何汇总”：它以 Dashboard 连接 Home Assistant、天气、日程、纪念日、AI 助手，并通过工作区动态展示 DSH 的近期活动。

## 集成链路

1. 在本机安装并启用 DSH Activity Tracker。
2. Life Dashboard 的 Authentik 管理员生成一次性 6 位配对码。
3. 在 DSH 的“活动统计 → 总设置 → 生活看板连接”输入配对码。
4. 插件保存服务器下发的连接配置，每 10 秒主动通过 HTTPS 推送工作区快照。
5. Life Dashboard 仅向通过 Authentik 管理员鉴权的浏览器提供工作区详情。

NAT 后无需向本地开发机开放端口，因为连接方向是本地插件主动访问远端服务器。

## 能力边界

| 能力 | 默认位置 | 数据范围 |
| --- | --- | --- |
| 统计卡片、热力图、时间线 | DSH Web | 本地会话聚合结果 |
| 工作区在线和活动状态 | Life Dashboard | 字段白名单摘要 |
| 会话详情 | Life Dashboard | 仅限已授权工作区和管理员 |
| 向当前会话发送消息 | Life Dashboard → DSH | 管理员、已授权且运行中的会话 |