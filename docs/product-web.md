# 樱落生态 · 产品星图（Product-web）

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-10-05`（Product-web独立版本）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![已编写Wiki](../assets/sakura-wiki.svg)](product-web.md)

仓库：[Guyao146/Product-web](https://github.com/Guyao146/Product-web)（私有仓库） · PHP 8.2+，无 Composer / npm 运行依赖，无数据库

## 项目定位

产品星图是面向 MCYLYR.CN 的产品系列网站，把樱落生态里的每一个项目和 Skill 汇聚成可筛选、可追溯的产品页：产品名称、介绍、功能、运行环境、Logo / 替代标识、正式版本与最近活动一站可查。

它不是后台管理系统，也不存储业务数据：PHP 只处理一个 Webhook 入口，其余页面是纯静态外壳加前端渲染。

## 已实现能力

- **产品矩阵**：16 个独立仓库产品 / Skill 加 Cline Sync 配套工具，共 17 个独立详情 URL；涵盖 AI 基础设施、生态服务、DSH 工具箱、日常与效率、创作工具、游戏工具。
- **浏览与筛选**：合并时间线、产品 / 发布 / 代码筛选、加载更多；关闭 JavaScript 时静态外壳仍给出 Wiki 与 GitHub 入口。
- **数据自动同步**：GitHub Release / Push Webhook，原始字节 HMAC-SHA256 校验、仓库白名单、重复投递去重、文件锁和原子写；处理结果立即写入同源静态快照。
- **网站自动部署**：可选与 Wiki 同款的自动部署——Product-web 的 main Push → 验签 → Git fetch / reset，使用独立密钥、部署锁和私有日志。
- **前台更新检查**：已打开页面每 30 秒拉取同源静态快照检查更新；离开标签页时暂停，失败保留旧内容。
- **视觉**：夜空背景、青紫渐变、玻璃卡片、响应式布局、键盘焦点及「减少动态效果」适配。

## 本地预览

需 PHP 8.2+：

```powershell
php -S 127.0.0.1:8080 -t D:\VSProject\Product-web\public
```

访问 `http://127.0.0.1:8080/`。PHP 内置服务器仅用于开发。初始历史数据随仓库提供（已生成的 `public/assets/data.json` 快照），不配置密钥也能预览完整内容；Webhook 默认关闭（503），不会以空密钥接受请求。`public/index.html` 是纯静态外壳，所有内容由 `public/assets/app.js` 从快照渲染；PHP 只处理 `public/webhook.php`。

## 部署要点（宝塔示例）

1. 上传整个项目，PHP 设 8.2 或更高，启用 `curl` 扩展（仅主动历史同步需要）。
2. 网站运行目录必须设为 `/public`，默认文档 `index.html`；不要把仓库根目录直接公开，`webhook.php` 是 public 下唯一的 PHP 入口。
3. `config/local.example.php` 复制为 `config/local.php`，用 `bin2hex(random_bytes(32))` 生成 `webhook_secret`，不要提交 Git。
4. 启用网站自动部署时：网站目录必须是本仓库的 Git clone（含 `.git`）；`deploy_secret` 与 `webhook_secret` 互相独立；`origin` 必须为 `https://github.com/Guyao146/Product-web.git`，Git 需允许 `proc_open` 系函数且不关闭 TLS 验证。
5. 参照 `deploy/nginx.conf.example` 加入安全规则；开了 `open_basedir` 的站点需放行项目根目录与系统临时目录。

完整步骤、权限示例与自动部署细节见仓库 README。

## 与生态其他项目的关系

- 产品星图是生态的「产品目录前端」：各项目的版本、发布与活动经 Webhook 自动汇入，Wiki 则承载设计与决策文档，两者互补。
- 自动部署机制与 [Sakura-EcoSystem-wiki](https://github.com/Guyao146/Sakura-EcoSystem-wiki) 本站使用的是同一套思路（Push → 验签 → Git reset），但密钥与部署锁互相独立。
- 目前为私有仓库，公开访问以站点本身为准；本页内容基于本地源码与 README 整理。

## 版本记录

| 版本 | 要点 |
| --- | --- |
| 快照（无 tag） | 17 个产品详情页与合并时间线；Release/Push Webhook 与同源快照；可选网站自动部署；30 秒前台更新检查；响应式玻璃卡片视觉 |

来源：[仓库 README](https://github.com/Guyao146/Product-web)（私有仓库，需访问权限）与本地源码。仓库当前没有 LICENSE 文件与版本 tag，正式公开前应补齐许可与版本声明。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
