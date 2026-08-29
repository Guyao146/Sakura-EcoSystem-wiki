# DSH Windows Tool Fix

仓库：[Guyao146/dsh-windows-tool-fix](https://github.com/Guyao146/dsh-windows-tool-fix) · 当前版本 `0.2.1` · 许可证 `LGPL-2.1-or-later`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-4c7dff)](https://github.com/deepseek-ai/deepseek-harness)
[![已编写Wiki](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/sakura-wiki.svg)](https://wiki.mcylyr.cn/)

## 项目定位

`dsh-windows-tool-fix` 是面向 DSH Desktop 的 Windows 配置插件，专门解决 Windows 上默认 `minimal` Agent preset 使用持久 PTY 时的报错：

```text
subprocess-local: terminal inspection is unsupported on platform win32
```

插件通过 DSH profile patch 把 `minimal-gitbash` 设为新会话的默认 Agent preset，让命令经 Git for Windows Bash 的 subprocess 执行，绕开 Windows 不支持的持久 PTY 检查路径。

它不修改 DSH 安装目录、`app.asar` 或官方 shipped preset，因此 DSH 升级不会与之冲突。

## 功能

- Windows 环境下自动将新会话默认 preset 设为 `minimal-gitbash`。
- 复用 `@icelily/dsh-gitbash-preset` 提供的 Git Bash 执行器。
- 保留 `bash` 与 `str_replace_editor` 工具入口，不需每次手动切换 preset。
- 通过 DSH subprocess seam 处理命令执行、输出收集、超时和进程清理。
- 支持通过移除插件并恢复默认设置回滚。

它不绕过 DSH 的 sandbox、审批或单次权限升级机制，也不写入 DSH Desktop 安装目录。

## 环境要求

- 已安装并能正常运行的 DSH Desktop，且为 Windows 系统。
- Node.js `>=20`。
- DSH profile 能加载本地插件和 `cordis.patch.yml`。
- 已安装 `@icelily/dsh-gitbash-preset`，用户 preset 目录中存在 `minimal-gitbash`。
- 已安装 Git for Windows，能找到 `bash.exe`。默认探测路径：

  ```text
  C:\Program Files\Git\bin\bash.exe
  ```

## 安装

先安装 Git Bash preset：

```cmd
dsh plugin --profile desktop add @icelily/dsh-gitbash-preset
```

再安装本插件（三种方式任选）：

```cmd
dsh plugin --profile desktop add Guyao146/dsh-windows-tool-fix
dsh plugin --profile desktop add file:C:/path/to/dsh-windows-tool-fix
dsh plugin --profile desktop add https://github.com/Guyao146/dsh-windows-tool-fix/releases/download/v0.2.1/dsh-windows-tool-fix-0.2.1.tgz
```

安装完成后**完全重启** DSH Desktop。

## 验证

```cmd
dsh plugin --profile desktop list
dsh --profile desktop --dump-config
```

`--dump-config` 输出中的 `agent-presets` 应包含：

```yaml
default: minimal-gitbash
```

## 工作原理

插件通过 `package.json` 的 `dsh.bundle.patch` 声明 `cordis.patch.yml`，补丁只覆盖 profile 中 `agent-presets` 的默认配置：

```yaml
- insert:
    - id: dsh-windows-tool-fix
      name: dsh-windows-tool-fix

- id: agent-presets
  config:
    default: minimal-gitbash
```

实际执行器来自已安装的 `minimal-gitbash` preset，插件自身不复制也不修改 DSH 安装目录中的 preset 文件。

## 沙箱与权限

`minimal-gitbash` 使用 Git for Windows 的 MSYS 运行时。在 Windows 受限令牌沙箱中 MSYS 可能无法创建 signal pipe，因此命令执行可能需要：

- 将会话切换到 `danger-full-access`；或
- 对单次工具调用使用 DSH 的 `sandbox_permissions: "danger-full-access"` 并提供理由。

这是执行后端的兼容性限制。插件不会自动提升权限，也不会绕过 DSH 的审批流程。

## 已知限制

- 只处理 DSH profile 的默认 Agent preset，**不会迁移已创建的会话**。DSH 会保存会话创建时使用的 preset，需新建会话验证。
- 依赖 `@icelily/dsh-gitbash-preset`；未安装该 preset 时默认值会指向不可用的 preset。
- 依赖 Git for Windows；不会自动安装 Git，也不使用 WSL Bash 作为替代。
- Git Bash preset 按次启动 shell，跨调用不保证保持 `cd`、`export` 等交互状态。
- Windows 以外的平台不会应用该插件的默认设置。

若 `settings.yaml` 中显式保存了旧默认值，需手工写入：

```yaml
agent-presets:
  default: minimal-gitbash
```

## 回滚

```cmd
dsh plugin --profile desktop remove dsh-windows-tool-fix
```

然后把 `DSH_HOME/settings.yaml` 中的默认 preset 恢复为原值（例如 `minimal`），最后重启 DSH Desktop。

## 与生态其他项目的关系

这是三个 DSH 插件中唯一处理**执行层**问题的：

- [DSH Activity Tracker](dsh-activity-tracker.md) 读取会话文件做统计，不参与命令执行。
- [DSH Better Model Thinking Control](dsh-better-model-thinking-control.md) 配置模型思考档位，不参与命令执行。
- 本插件只改默认 Agent preset，不解析会话也不读取模型能力。

三者可同时安装，互不干扰；但要注意它们分属 `desktop` 与 `web` 两个独立 profile，需装到实际运行的那个。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
