# SakuraID（Sakura-Auth-Server）

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-10-05`（Sakura-Auth-Server独立版本，上游 `v1.5.1`）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![已编写Wiki](../assets/sakura-wiki.svg)](sakura-auth-server.md)

仓库：[Guyao146/Sakura-Auth-Server](https://github.com/Guyao146/Sakura-Auth-Server) · 许可证 `Sakura-License-1.2`（源码可用、限制商用） · `package.json` `1.5.1`（README 另有 `v0.7.0` 标注，以仓库 `package.json` 为准）

## 项目定位

SakuraID 是一个自托管的统一身份认证服务（IdP）：业务系统统一跳转到这里登录，通过 OAuth 2.0 / OpenID Connect 拿回令牌访问各自的接口。定位对标 authentik 的核心子集——不过超大而全，只把「发令牌」这一件事做对。零 npm 依赖，Node.js ≥ 22.5，SQLite 存储。

它不是业务系统，也不托管业务数据：只负责用户、应用、授权、令牌与审计。生态内的 [Sakura-MCP-Memory-Server](sakura-mcp-memory-server.md)（`0.4.0` 起）与 [Sakura Chat](sakura-chat.md)（`v1.1.0` 起）都已把它作为可选的标准 OIDC 登录提供方。

## 快速开始

```bash
node server.js
```

默认监听 `http://localhost:9000`。看到配置向导地址即成功：

1. 打开 `http://localhost:9000/setup` 完成四步配置向导（环境检测 → 站点设置 → 管理员 → 完成）；
2. 控制台「应用」里新建一个客户端，拿到 `client_id` / `client_secret`；
3. 业务系统对接发现文档 `/.well-known/openid-configuration` 即可。

部署方式：**Docker Compose（推荐）**，数据落在 `./data` 卷，升级只换镜像；或 **Node + systemd** 托管。环境变量清单见 `.env.example`。数据备份用 `npm run backup`（SQLite `VACUUM INTO` 一致性快照 + uploads 整目录，默认保留最近 14 份，可在运行中执行）；恢复用 `npm run restore -- <备份目录或 .tar.gz> --force`（恢复前先停服务，不加 `--force` 不替换数据）。

## 功能概览

| 领域 | 能力 |
| --- | --- |
| OAuth2 | 授权码 + PKCE（S256/plain）、refresh_token 轮换与重放检测、client_credentials |
| OIDC | 发现文档、JWKS、id_token（nonce/at_hash/auth_time）、`/userinfo` |
| 运维端点 | RFC 7662 内省、RFC 7009 吊销 |
| 控制台 | 用户管理（禁用/重置密码/用户组）、应用管理（机密/公开客户端、密钥重置、令牌吊销） |
| 两步验证 | 账号页自助开启 TOTP（RFC 6238，兼容 Google Authenticator 等）、扫码二维码、8 枚一次性恢复代码、登录第二因子、管理员可重置 |
| 应用门户 | 普通用户的业务入口页：按权限组过滤可见应用，一键发起统一登录（IdP 代发 PKCE） |
| 权限组 | 组管理与成员关系；应用可限制「可访问的权限组」，组外用户在授权阶段被拦截；`groups` claim 由成员关系驱动 |
| 我的授权 | 查看已记住授权的应用/范围/时间，一键撤销并级联吊销其现有令牌 |
| 账号自助 | 找回密码（零依赖 SMTP 客户端，支持 STARTTLS）、管理员可控的自助注册开关 |
| 会话安全 | 用户自助查看全部登录设备（IP/UA/时间），撤销单个或其他全部会话 |
| 审计 | 登录/2FA/授权同意与撤销/注册/管理操作全量留痕（滚动保留 5000 条），管理端可筛选、清空 |
| 品牌定制 | 管理端可视化配置站点 Logo（上传/删除）、主题强调色（防 CSS 注入）、品牌口号，保存即全站生效 |
| 界面语言 | 简体中文 / English 切换（cookie + `/-/lang/:code`），高流量页面覆盖，缺词回退中文 |
| Passkey | WebAuthn/Passkey 无密码登录：账号页注册凭据（上限 8 个），登录页一键登录；counter 防克隆、零依赖 CBOR/ES256 |
| 联邦登录 | Microsoft 账号 OIDC 登录与绑定，未绑定可关联本地账号或注册新号 |
| 安全 | scrypt 口令哈希、CSRF 双提交、登录限流、授权码一次性、改密/重置/禁用后统一凭据失效、防用户枚举 |

## 与生态其他项目的关系

- [Sakura-MCP-Memory-Server](sakura-mcp-memory-server.md) 自 `0.4.0` 起内置 Sakura 浏览器登录提供方，即本服务：授权码 + PKCE、RS256 ID Token 与 `/jwks.json`，身份以 `sakura:<sha256(issuer)>:<sub>` 隔离。
- [Sakura Chat](sakura-chat.md) 自 `v1.1.0` 起可作为标准 OIDC 客户端接入本服务（公开客户端推荐，仅 PKCE），本地账号与第三方身份可互相绑定/解绑。
- [UniLink](unilink.md) 的手机扫码登录面向 authentik OIDC 项目，与本服务并列；两者可共存于同一部署。
- 各项目接入本服务时，统一在管理端「应用 → 新建应用」登记回调地址（如 `https://<站点>/api/auth/oauth/sakura/callback`），`openid profile` 即可满足绝大多数场景。

## 版本记录

来源为仓库 git log 的版本提交与 [README 功能清单](https://github.com/Guyao146/Sakura-Auth-Server/blob/main/README.md)；未发现独立 Release tag，不把版本提交称作正式发布版本。

| 版本 | 要点 |
| --- | --- |
| `v1.2.0` | OAuth 加固包 7 项 + Web 加固包 6 项（上轮审计建议全部落地） |
| `v1.3.0` | WebAuthn/Passkey 无密码登录（零依赖 CBOR/ES256）、一键备份/恢复、新设备登录邮件提醒、授权用户 CSV 导出 |
| `v1.4.0` | 界面中英文切换（cookie + `/-/lang/:code`）、LICENSE 与 UA 码点截断、Logo 上传原子化 |
| `v1.5.0` | 品牌定制：站点 Logo、主题强调色、品牌口号，管理端可视化配置并全站生效 |
| `v1.5.1` | 注册 / 两步验证 / 找回密码 / 重置密码页统一为品牌分栏布局（与登录页同款） |

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
