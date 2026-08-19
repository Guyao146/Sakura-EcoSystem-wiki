# 配置与密钥规范

## 不应进入 Wiki 的内容

- Home Assistant 长期访问令牌。
- Authentik Refresh Token、用户数据和私密配置。
- `LIFE_HUB_DSH_PUSH_SECRET` 与本地 DSH 配对 token。
- Sub2API API Key、Refresh Token 和账户详情。
- 生产服务器敏感路径、备份和完整会话原文。

文档只能使用 `replace-me`、`example.com` 和结构化占位符。若真实密钥曾提交过，应立即吊销并轮换，单纯删除 Git 文件不足以完成处置。

## 数据最小化

DSH Activity Tracker 的默认能力是本地统计。启用远端工作区动态后，也应只授权需要展示的工作区；“允许查看会话详情”会扩大数据暴露范围，建议默认关闭。

Life Dashboard 的私密配置通过服务器权限网关下发。普通用户、本地浏览器登录和未登录请求都不应获得 Home Assistant Token。

## 部署检查

```bash
curl -i https://life.example.com/.env
```

响应必须是 `403` 或 `404`，不能出现任何环境变量。Wiki 本身是公开文档，所有配置示例都必须脱敏后再提交。