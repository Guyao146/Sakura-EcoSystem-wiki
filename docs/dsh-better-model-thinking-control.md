# DSH Better Model Thinking Control

仓库：[Guyao146/dsh-better-model-thinking-control](https://github.com/Guyao146/dsh-better-model-thinking-control) · 许可证 `LGPL-v2.0`

[![樱落生态成员](https://raw.githubusercontent.com/Guyao146/Sakura-EcoSystem-wiki/main/assets/ConnectEcoSystem.svg)](https://mcylyr.cn)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-4c7dff)](https://github.com/deepseek-ai/deepseek-harness)

`dsh-better-model-thinking-control` 是樱落生态中的 DSH Web 插件，用于按中转站和模型配置思考强度（Reasoning Effort）。它读取 OpenAI 兼容中转站公开的模型能力，并把结果写入 DSH 原生 `llm-pi-ai` 设置，让 DSH 自己的模型选择器和思考档位机制继续负责实际请求。

## 项目定位

不同 OpenAI 兼容中转站对思考参数的命名和可用档位并不统一。有的接口提供 `reasoning_efforts`，有的提供 `thinking_levels`，有的还会为 `high` 或 `max` 使用自定义 wire value。DSH 原生配置需要统一的 `reasoningEfforts` 结构：

```yaml
reasoningEfforts:
  off:
  low: low
  high: high
  max: max
```

本插件负责把中转站能力元数据转换成这个结构，减少手工编辑 DSH 配置的需要。它**不代理、不拦截也不篡改模型请求**。

## 功能概览

- 在 DSH 设置侧栏增加独立的 **模型思考强度** 页面。
- 按中转站展开和收起配置。
- 通过下拉多选为每个模型配置 `Off`、`Minimal`、`Low`、`Medium`、`High`、`XHigh`、`Max`。
- 支持将模型标记为**非推理模型**。
- 模型 ID、思考强度下拉框和删除按钮使用同一行对齐布局，中转站各自使用独立分组框。
- 自动请求中转站的 OpenAI 兼容 `GET /models` 接口。
- 识别 `reasoning_efforts`、`supported_reasoning_efforts`、`thinking_levels`、`reasoning.efforts`、`thinking.levels` 等常见字段。
- 保留中转站自定义请求值，例如把 DSH 的 `high` 映射为网关实际接受的 `default`。
- `/models` 缺少能力信息时，尝试使用 DSH 已注册的本地模型适配器补全。
- 支持临时填写一次性 API Key；该 Key 不会写入插件配置或 DSH credentials。
- 支持通过 DSH credentials 引用读取已经保存的凭据。
- 支持手动添加、编辑、删除模型，以及撤销未保存修改。

## 适用范围与限制

插件要求：

- 使用 DSH Web 或加载 Web 客户端插件的 DSH Desktop；
- DSH 已启用 `llm-pi-ai`；
- 中转站使用 OpenAI Completions 或 Responses 协议；
- provider 的基础地址可以访问 `/models`。

插件不负责：

- 代理或改写实际模型请求；
- 替换 DSH 的模型选择器；
- 通过真实对话逐档试错；
- 估算请求费用；
- 管理中转站账户或生成 API Key。

标准 OpenAI `/models` 通常只有模型 ID，并不声明思考档位。缺少公开能力元数据时，插件会保留当前配置并允许手动选择，不会发起可能产生费用或副作用的测试对话。

## 安装

### 从源码打包

```bash
npm pack
dsh plugin --profile web add "file:./dsh-better-model-thinking-control-0.2.0.tgz"
```

安装后重启 DSH Web，入口位于：

```text
设置 → 模型思考强度
```

插件只注册设置侧栏页面，不会在 DSH 的“插件”配置页重复显示一张卡片。

### 从 GitHub Release 安装

从项目 [Releases](https://github.com/Guyao146/dsh-better-model-thinking-control/releases) 下载 `.tgz` 后执行：

```bash
dsh plugin --profile web add "file:<安装包路径>/dsh-better-model-thinking-control-<版本>.tgz"
```

如果实际运行的是 DSH Desktop，应安装到对应 profile：

```bash
dsh plugin --profile desktop add "file:<安装包路径>/dsh-better-model-thinking-control-<版本>.tgz"
```

`web` 与 `desktop` 是相互独立的插件环境。更新其中一个 profile，不会同步更新另一个。

## 使用流程

1. 启动或重启 DSH。
2. 打开 **设置 → 模型思考强度**。
3. 展开需要配置的中转站。
4. 点击 **自动拉取**。
5. 如果 DSH 没有可用的凭据引用，在一次性 API Key 输入框填写 Key。
6. 检查自动拉取得到的模型和档位。
7. 在下拉多选中修正档位，或将不支持思考的模型标记为**非推理模型**。
8. 点击 **保存配置**。
9. 回到 DSH 模型选择器，选择模型及思考档位。

自动拉取只合并模型信息并提示检查，不会立即覆盖 DSH 设置。只有点击“保存配置”才会写入。

## 配置结构

插件编辑 DSH 原生 `llm-pi-ai` 命名空间：

```yaml
llm-pi-ai:
  providers:
    my-gateway:
      displayName: 我的中转站
      baseURL: https://gateway.example/v1
      api: openai-completions
      apiKeyEnv: MY_GATEWAY_KEY
      models:
        - id: deepseek-reasoner
          reasoningEfforts:
            off:
            low: low
            high: high
            max: max
```

| DSH 档位 | 常见配置值 | 含义 |
| --- | --- | --- |
| `off` | `null` | 关闭思考，不发送思考参数 |
| `minimal` | `minimal` | 最小思考档位 |
| `low` | `low` | 低思考强度 |
| `medium` | `medium` | 中等思考强度 |
| `high` | `high`、`default` | 高思考强度或网关自定义值 |
| `xhigh` | `xhigh` | 更高思考强度 |
| `max` | `max`、`ultra` | 最高思考强度或网关自定义值 |

`reasoningEfforts` 的键是 DSH 展示的统一档位，值是中转站实际接受的 wire value。只有 `off` 可以为空值，表示关闭思考时不发送协议参数。

## 自动识别机制

点击“自动拉取”后，宿主端会：

1. 校验基础地址，只接受 `http:` 或 `https:`；
2. 清理查询参数、hash 和末尾斜杠；
3. 请求 `<baseURL>/models`；
4. 如果有 Key，同时发送 `Authorization: Bearer` 和 `x-api-key`；
5. 解析 OpenAI 风格的 `data` 数组；
6. 提取模型 ID、名称、上下文长度和思考能力；
7. 按模型 ID 合并到当前 provider；
8. 等待用户确认和保存。

示例响应：

```json
{
  "data": [
    {
      "id": "deepseek-reasoner",
      "reasoning_efforts": ["off", "low", "high"]
    },
    {
      "id": "gateway-reasoner",
      "reasoning": {
        "efforts": [
          {"id": "off"},
          {"id": "high", "wire": "default"},
          {"id": "max", "value": "ultra"}
        ]
      }
    }
  ]
}
```

会转换为：

```yaml
deepseek-reasoner:
  off: null
  low: low
  high: high

gateway-reasoner:
  off: null
  high: default
  max: ultra
```

### 没有能力元数据时

插件会：

- 保留现有 `reasoningEfforts`；
- 允许通过下拉多选配置中转站文档明确支持的档位；
- 尝试从 DSH `llm.resolveModelInfo()` 读取本地模型适配器能力；
- 不把“不确定”误报成“已确认支持”。

## API 与安全边界

宿主端只提供一个同源探测接口：

```http
POST /dsh-reasoning-control/api/probe
X-DSH-Reasoning: 1
Content-Type: application/json
```

请求体示例：

```json
{
  "provider": "my-gateway",
  "baseURL": "https://gateway.example/v1",
  "api": "openai-completions",
  "apiKeyEnv": "MY_GATEWAY_KEY",
  "apiKey": "仅本次探测使用的 Key"
}
```

安全约束：

- 缺少 `X-DSH-Reasoning: 1` 时返回 `403`；
- 只接受 `POST`，其他方法返回 `405`；
- 请求体上限 32 KiB；
- 上游响应上限 4 MiB；
- 上游请求超时为 15 秒；
- 只接受 HTTP/HTTPS 地址；
- 一次性 API Key 只参与当前探测，不写入设置；
- 没有一次性 Key 时，才尝试通过 DSH credentials 解析 `apiKeyEnv`；
- 原始上游响应不会直接转发给浏览器，只返回受限的模型摘要。

一次性 Key 仍会在当前浏览器请求和本机 DSH 进程内短暂存在。不要在公共屏幕、录屏、日志或 Issue 中暴露它。

## 常见问题

### 设置里没有“模型思考强度”

- 确认安装到了正在运行的 `web` 或 `desktop` profile；
- 安装后完整重启 DSH；
- 确认 DSH 已启用 `llm-pi-ai`；
- 确认当前环境会加载 Web 客户端插件；
- 检查插件版本是否为 `0.2.0` 或更高。

### 页面提示未检测到 `llm-pi-ai`

先在 DSH 模型设置中添加或启用 OpenAI 兼容中转站，再重新打开本页。本插件不会重复注册或创建 `llm-pi-ai` 命名空间。

### 自动拉取返回 401 或 403

检查：

- API Key 是否有效；
- Key 是否允许访问 `/models`；
- `baseURL` 是否包含正确的 `/v1` 路径；
- 中转站是否要求特定认证头；
- 是否需要在一次性 API Key 输入框提供 Key。

### 只有模型 ID，没有思考档位

这是标准 OpenAI `/models` 的常见情况。插件不会猜测真实能力。请检查 DSH 本地适配器信息，或在下拉菜单中选择中转站文档明确支持的档位。

### 保存按钮不可用

可能是 DSH 设置当前为只读，或 `llm-pi-ai` 设置尚未就绪。页面会显示对应状态提示。

### 自动识别后出现重复模型

插件按模型 ID 精确合并。大小写、别名或不同前缀会被视为不同模型，请在保存前删除不需要的条目。

## 与樱落生态的关系

| 项目 | 作用 |
| --- | --- |
| `dsh-better-model-thinking-control` | 配置 DSH 模型思考档位和中转站能力映射 |
| `dsh-activity-tracker` | 统计 DSH 本地活动、工具调用和 Token 使用 |
| `Life Dashboard` | 汇总生活信息，并接收授权的 DSH 工作区状态 |

三个项目可以独立使用。思考强度插件不依赖 Activity Tracker，也不会上传活动统计；它只在用户点击自动拉取时访问所配置中转站的 `/models`。

## 项目结构与实现

```text
dsh-better-model-thinking-control/
├─ cordis.patch.yml
├─ package.json
├─ README.md
├─ lib/
│  ├─ index.js
│  └─ client.js
└─ test/
   └─ reasoning-control.test.js
```

### 宿主端 `lib/index.js`

- 注入 `webServer`、`credentials` 和 `llm`；
- 注册 `/dsh-reasoning-control/api`；
- 从 credentials 服务解析凭据引用；
- 请求并限制上游 `/models` 响应；
- 解析不同网关的能力字段；
- 与 DSH 本地模型信息合并。

### 客户端 `lib/client.js`

- 绑定 DSH 原生 `settingsScope`，命名空间为 `llm-pi-ai`；
- 通过 `settings.section` 注册独立页面；
- 展示 provider、模型和思考档位；
- 发送探测请求；
- 将确认后的修改保存回 DSH 原生设置。

`cordis.patch.yml` 会激活名为 `better-model-thinking-control` 的插件实例。

## 开发、测试与发布

```bash
npm test
npm pack
```

项目使用 Node.js 内置测试运行器，当前覆盖：

- 数组形式的 `reasoning_efforts`；
- 对象能力映射；
- 自定义 wire value；
- `reasoning: false` 非推理模型；
- `off` 缺少 wire value 时转换为 `null`。

GitHub Actions 在推送 `main` 后会使用 Node.js 22 执行测试、`npm pack`、创建版本化 Tag 和 Release，并上传 `.tgz`。创建 Release 需要 Actions 工作流具有 `Read and write permissions`。

### 客户端版本演进

- `0.1.6`：只保留设置侧栏中的独立入口，档位改为英文标准值；
- `0.1.7`：自动识别说明移到总标题下方；
- `0.1.8`：档位复选区域改为下拉多选；
- `0.1.9`：模型 ID、强度下拉和删除按钮改为同一行，非推理模型移入下拉菜单；
- `0.2.0`：移除最外层卡片边框，只保留中转站分组框，并固定三项控件的对齐布局。

## 维护建议

- 修改能力字段解析前先补充测试；
- 不要再次注册 `llm-pi-ai` 命名空间；
- 不要将 API Key 写入插件设置、测试、README 或 Git；
- DSH 档位键保持标准英文值，网关差异放在 wire value；
- 保留上游响应大小限制和超时；
- 修改客户端入口、命名空间或 profile 行为后完整重启 DSH 验证。

## 相关链接

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [项目 GitHub](https://github.com/Guyao146/dsh-better-model-thinking-control)
- [项目 Issues](https://github.com/Guyao146/dsh-better-model-thinking-control/issues)
- [樱落生态总览](../README.md)