# 网文写作 Skill

> Wiki 文档版本：`v1.0.0` · 更新日期：`2026-10-05`（网文写作 Skill独立版本）

[![樱落生态成员](../assets/ConnectEcoSystem.svg)](../README.md)
[![已编写Wiki](../assets/sakura-wiki.svg)](online-literature-skill.md)

仓库：[Guyao146/Specialization-of-Online-Literature-Skill](https://github.com/Guyao146/Specialization-of-Online-Literature-Skill) · 许可证 `CC BY-NC-SA 4.0` · 作者 **llsysklt**，Skill 训练者 **guyao146**

## 项目定位

一个面向中文网络文学创作、可持续迭代的提示词 Skill。它以设定卡、《文风参考文本（非正文剧情）》和当前已有正文为锚点，把创作流程拆成可复用的协议：**讨论 → 评审 → 章纲 → 正文 → 修订**。

它不是自动写作机：规则是过滤器而不是声音来源，事件先于句式，人物先于漂亮话；最终正文必须由人确认。规则档刻意做互斥设计，避免题材规则互相污染。

当前规则档：

- **同人通用档**：焚诀 v6.4 / 防拟合协议 v4；
- **古典西幻特化档**：焚诀·西幻版 v1 / 防拟合协议·西幻特化 v1 / 西幻词表 v1，原创与同人通用。

## 使用

将 `SKILL.md` 作为 Skill 入口提供给支持 Markdown 指令的 Agent。开始项目时复制：

```text
templates/project-bible.md  → 你的项目/项目设定.md
templates/character-card.md  → 你的项目/角色卡/角色名.md
templates/chapter-state.md   → 你的项目/状态/第001章.md
templates/style-reference.md → 你的项目/文风参考文本（非正文剧情）.md
```

一次请求建议说明：模式、章节号、视角、已知剧情、目标效果、篇幅和不可改变的事实。正文模式的最终输出必须是纯文本正文，不得输出分析、规则或 Markdown。

写作阶段只读取 `prompts/writing.md` 与 `prompts/format.md`；草稿完成后才进入修订阶段，读取 `prompts/revision.md` 与 `prompts/anti-overfitting.md`。内部推演（锁定、状态、节拍）不输出。

## 核心原则

- 需要搭配自己手写文章作为文风参考使用，公式化输入根据文件内容创作下一章。
- 防拟合只处理过度拟合；设定、世界观、角色 OOC、剧情逻辑和跨作品语域由设定卡、章纲与评审负责。
- 用户明确要求与硬规则冲突时，以用户要求为先，并在执行前简短标记被覆盖的规则编号。
- 规则档互斥：未指定时使用同人通用档；明确要求「西幻特化」或「古典西幻」时切换到 `profiles/classic-western-fantasy/`，不与通用档同名规则叠加。

## 目录与开发

| 路径 | 用途 |
| --- | --- |
| `SKILL.md` | Agent 入口与路由协议 |
| `prompts/` | 分阶段规则；刻意隔离写作与修订 |
| `profiles/` | 可选题材特化档；当前含古典西幻原创/同人档 |
| `templates/` | 可持久化的项目资料模板 |
| `schemas/` | 请求与状态的数据契约 |
| `docs/` | 使用、设计与迭代说明 |
| `scripts/validate.ps1` | 无第三方依赖的结构校验 |

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate.ps1
```

新增规则时先判断它属于「声音来源」「写作约束」还是「修订病征」；不要把硬删表、限量表或提示项放进写作提示词；题材特化必须放入独立 profile，不能污染通用档（详见 `docs/CONTRIBUTING.md`）。

## 与生态其他项目的关系

- 网文写作 Skill 是纯提示词工程产物，无运行时依赖，可以配合任意支持 Markdown 指令的 Agent（如 [SakuraCode](sakuracode.md) 或 DSH）使用。
- 它与生态其他项目没有代码依赖；作为 Product-web 产品矩阵的 16 个产品 / Skill 之一被收录展示。

## 版本记录

| 版本 | 要点 |
| --- | --- |
| 快照（无 tag） | 同人通用档（焚诀 v6.4 / 防拟合协议 v4）与古典西幻特化档（焚诀·西幻版 v1 / 防拟合·西幻特化 v1 / 西幻词表 v1）；讨论 → 评审 → 章纲 → 正文 → 修订五段协议；模板、数据契约与结构校验脚本 |

来源：[仓库 README](https://github.com/Guyao146/Specialization-of-Online-Literature-Skill#readme)。仓库未发布 Release tag；许可为 CC BY-NC-SA 4.0，提交第三方样本、人物原型或测试文本前需确认拥有相应授权。

> 文档基于对应项目源码整理。实现变更后，以项目仓库、版本文件和 CHANGELOG 为最终依据。
