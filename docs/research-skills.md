# 项目级研究 skills

已将 [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills) 中的四个技能安装到本仓库 `.agents/skills/`。固定来源 commit 为 `593377bb048752abb0152deab9fbb1083a6087df`，上游文件保持原样；每个技能附有上游 MIT `LICENSE.md`。安装清单与 SKILL 文件 SHA-256 在 `.agents/skills/installation.json`。

| 技能 | 版本 | 在本项目中的用途 |
| --- | --- | --- |
| `paper-lookup` | 2.4 | 查 arXiv、Semantic Scholar、OpenAlex 等来源，追踪前向引用，记录分页与检索覆盖范围 |
| `citation-management` | 2.3 | 核对 DOI/arXiv 元数据、生成 BibTeX、检查重复文献 |
| `literature-review` | 1.11 | 制定检索式，记录纳入/排除依据，整理文献与覆盖缺口 |
| `scientific-critical-thinking` | 1.5 | 检查实验控制、混杂因素、结论范围以及独立验证情况 |

这是开发端的 Codex 技能，不会启用网站采集、后台定时任务或面向读者的模型助手。四个项目级技能现已被当前会话发现，并在本轮论文与评论整理中按需使用。可直接提出：

> 使用 $paper-lookup 和 $citation-management，补查 J-lens 的前向引用；保留检索式、日期、分页结果与失败记录，按研究而非转载数量去重。

> 使用 $literature-review 整理读出方法分支，用 $scientific-critical-thinking 核查哪些观察只是读出能力，哪些涉及因果使用。

## 本机运行环境

基础脚本使用 Python 3.13.5。`paper-lookup` 的脚本只使用标准库；其余检索/引用脚本需要 `requests`。已在忽略提交的 `.data/research-skills-venv/` 中安装 `requests==2.34.2` 及其依赖，没有修改全局 Python 或网站依赖。

从仓库根目录执行 PowerShell：

```powershell
& .data/research-skills-venv/Scripts/python.exe .agents/skills/paper-lookup/scripts/paginate.py --list-apis
& .data/research-skills-venv/Scripts/python.exe .agents/skills/citation-management/scripts/search_openalex.py --help
& .data/research-skills-venv/Scripts/python.exe .agents/skills/literature-review/scripts/verify_citations.py --help
```

其他机器可先创建本地环境再安装基础依赖：

```powershell
python -m venv .data/research-skills-venv
& .data/research-skills-venv/Scripts/python.exe -m pip install requests==2.34.2
```

基础查询不要求配置付费服务。实际接口仍可能限流、缺少索引或失败，必须记录，不能将失败解释为没有引用或检索已经完整。Google Scholar 的 `scholarly`、Parallel、AI 制图、Pandoc/XeLaTeX 都是可选能力，本次未安装或配置。

## 安装验证

Codex 本地 `skills/list` 已发现四个技能，全部为 `scope=repo`、`enabled=true`，无加载错误。已核对全部 67 个上游文件与固定版本一致，18 个 Python 文件通过语法检查，12 个基础脚本通过 `--help` 启动检查；离线样本验证 arXiv 错误响应会被拒绝、BibTeX 重复项能合并且默认不覆盖输入。

验证记录位于忽略提交的 `.data/project-skill-discovery.json` 和 `.data/research-skills-check/validation.json`。安装验收当时没有执行在线文献查询、付费请求或模型实验；这些安装检查本身不代表文献覆盖已经补全或所有外部 API 当前可用。

## 本轮实际使用

本轮使用 `paper-lookup` / `citation-management` 保存 arXiv 查询和原文版本，核对参考文献与作者信息；使用 `literature-review` / `scientific-critical-thinking` 记录纳入边界、评论回复语境、方法局限与竞争解释。新增 6 篇 arXiv 论文，研究目录扩至 36；28 条有原文定位的关系归一去重后为 27 条额外图谱关系。原文核对与引用索引失败/身份冲突详见 [图谱文献核查](graph-literature-audit-2026-10-22.md)。这些是有边界的定向整理，不称为系统综述或全球 citation 全集。

LessWrong 另通过公开 GraphQL 检查 16 帖、30 条评论，选录 12 条观点，包含 Neel Nanda 的真实回复。分数与作者身份不当作科学质量评分；评论的实验报告也不直接算独立验证。详见 [讨论核查](graph-discussion-audit-2026-10-22.md)。

已沉淀手动命令：

```powershell
.data/node.exe modules/observatory/scripts/collect-discussions.ts --item jlens-bench --out .data/discussion-candidates.json
```

该命令仅检查目录中已有的 LessWrong 帖，将候选与原始响应写入 `.data/`，按帖子/评论 ID 更新并保留上一次真实快照。WorkspaceBench 两次真实执行保留 1 帖、2 条不同评论，无重复。它不调用模型、不发布、不创建定时任务，也没有接入 X。在线查询与公开评论采集不等于运行新模型实验。

## 开发工具致谢

Timothy Kassis, Vinayak Agarwal, Yuhuan He, Darshil Patel, and Aubrey M. Brueckner（2026），[Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://arxiv.org/abs/2609.00065)。已核对当前 arXiv 记录为 v2；引用链接保持无版本后缀。该参考是检索、引用整理与科学审查的软件方法归属，不是 J-lens 证据或已集成的网站 Agent。

## J-lens 使用边界

- 保留原始 arXiv ID、版本和来源；arXiv DOI 不保证可通过 Crossref 或 OpenAlex 解析。
- 元数据去重不等于独立研究或独立证据去重。论文、代码和作者解读可以对应同一项工作。
- 引用关系必须由引用记录或原文确认，不能自动解释为支持、复现或因果证据。
- 文献检索不能替代 LessWrong 或 X 讨论采集；这些讨论需要另外记录来源与核查状态。
- 方法学审查采用 ML 研究适用的控制与判据，不机械套用医学 GRADE/RoB 分数。
- 网络查到论文、公开了代码、实际跑通实验和独立复现是不同状态。安装这些技能没有运行新的模型实验。
