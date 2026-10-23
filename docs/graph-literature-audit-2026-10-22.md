# 研究图谱文献核查：2026-10-22

本记录只覆盖本轮论文与作者技术文章，不覆盖其他代理单独核查的 LessWrong 评论。日期按 America/Los_Angeles 记录；原始来源时间保留 UTC。使用项目内 `paper-lookup` 与 `citation-management`，完成有边界的原文整理，不称为系统综述、完整引用普查或独立复现。

## 实际范围与结果

- 读取现有 30 条目录、7 个核心来源及此前引用补查记录，没有据此假定它们已经全面覆盖文献。
- arXiv `id_list` 一次返回 14/14 个预期记录：13 篇已有主题论文，另 1 篇为 K-Dense 软件方法引用。
- 定向关键词查询报告 22 条，取得 22 条，单页上限 40；未截断，无需翻页。它查询 arXiv 索引元数据，不是遍历全部参考文献。
- 取得并核查 19 篇固定版本 HTML：13 篇既有论文与 6 篇新选论文。18 篇后续论文均在原始参考文献条目核对了对原 J-lens 工作的直接引用；这不是新增 18 项独立验证。
- 新增 6 个可供图谱展开的候选节点；另 10 个关键词命中保留为仅元数据候选。仅凭命中不能建立继承、支持或质疑关系。其中 JLD 的摘要研究视觉感知距离，同名 Jacobian lens 不能直接当作本主题的方法继承。
- 共 30 次有边界的原始网络请求，低于 50 次约束；arXiv HTML 请求单连接、相隔至少 3 秒。未使用付费模型、未配置新凭据，也未运行模型实验。

结构化交付位于 `.data/graph-literature-research.json`，包含 19 条双语 brief/limitation、完整作者及来源版本时间、28 条有定位的 citation/method 关系，以及保留原始响应的检索记录。该文件是本地审计输入，不是新的公开数据库读取层。

## 可重复的查询

```text
GET https://export.arxiv.org/api/query
id_list=2607.15495,2609.01924,2609.32102,2608.31084,2608.25347,2609.32434,2609.33458,2610.23275,2610.22169,2610.09087,2610.04489,2608.24958,2610.13527,2609.00065
max_results=14

GET https://export.arxiv.org/api/query
search_query=(all:"J-lens" OR all:"Jacobian lens" OR all:"J-space") AND submittedDate:[202607010000 TO 202610222359]
max_results=40
sortBy=submittedDate
sortOrder=descending
```

通过 `curl --get --data-urlencode` 保存原始 Atom XML，再由技能自带 `arxiv_atom.py` 解析；并检查了返回总数、实际条数及执行后的查询。`citation-management/scripts/extract_metadata.py --arxiv 2607.15495` 另外实际生成了根论文 BibTeX，作者、题名与原始 arXiv 记录一致。没有为无正式期刊记录的预印本编造页码、卷期或期刊 DOI。

原始结果保存在忽略目录 `.data/graph-literature/`：`arxiv-batch.*`、`arxiv-query.*`、`root-citation.bib`、19 份版本化 HTML 与本地提取的段落/定位。后续代码发布若需共享审计快照，应先选择必要元数据，不能直接把原文镜像当作可转载内容。

## 新选的六个节点

这些简要均为编辑转述，状态是 `machine_inspected_pending_human`；不是作者认可或本站复现结果。

| 节点 / 版本 | 原始发表与版本更新 | 本轮可以表达什么 | 关键边界与原文定位 |
|---|---|---|---|
| [Foreword / 2610.28187v1](https://arxiv.org/html/2610.28187v1) | 2026-10-20；无新版本 | 用生成前 J-lens 特征及带标签成功/失败参考样本对测试输入排序。 | 三个 8–9B 开放模型、十项任务；标签覆盖和部署分布偏移仍有限。§2.2、§3.1–3.4、§4.2、§7；Reference [16] `#bib.bib15`。 |
| [Entity Lens / 2610.27241v2](https://arxiv.org/html/2610.27241v2) | 2026-10-19；v2 更新 2026-10-21 | 改变 J-lens 拟合提示，研究不依赖关系的实体信息如何预测关系可读性。 | OLMo3-7B、28 种关系；相关性不等于 LRE 实际使用该机制。§4、§6、§9；`#bib.bib6`。 |
| [Activation Control / 2608.21664v1](https://arxiv.org/html/2608.21664v1) | 2026-08-21；无新版本 | 在受控指令下抑制概念激活，检验 J-lens 等监控器漏检。 | 抄写与指定概念场景不等于真实部署中的自发规避。§2、§3.3、§4.1、Appendix B；`#bib.bib9`。 |
| [J-CoT / 2607.21981v1](https://arxiv.org/html/2607.21981v1) | 2026-07-24；无新版本 | 把词表索引系数作为递归推理循环的接口。 | 自有框架的 benchmark 不是 Ouro 复现；词表坐标不自动具有完美语义忠实性。§2–4；`#bib.bib29`。 |
| [Silent Alarm / 2607.12792v2](https://arxiv.org/html/2607.12792v2) | 2026-07-14；v2 更新 2026-08-24 | JADR 在回答前比较危险相关读出，以及模型和量化条件。 | SafetyAUC 及固定词典测量操作性识别，不是对未来有害行为的校准概率。§2.1、§4.1–4.7、§7.2、§8；`#bib.bib1`。 |
| [Safety Accessibility / 2610.04316v1](https://arxiv.org/html/2610.04316v1) | 2026-10-03；无新版本 | 扩展 JADR，比较成对 checkpoint、安全传递与针对监控器的攻击。 | 自有词典影响绝对 AUC；主要干预结论仍来自 135M–1.5B 模型。§3–4、§4.7、§5；根工作 `#bib.bib16`，JADR `#bib.bib30`。 |

完整原始 UTC 时间、作者名单与版本号在结构化文件中保留；表中的日期只是供阅读的日期级显示。

## 十篇已有引文的再次核对

| 资料 | 固定版本与已查位置 | 图谱应保留的区别 |
|---|---|---|
| [Concept Lens](https://arxiv.org/html/2608.31084v2#bib.bib1) | §1、§3、§5.2、§8；References | 直接引用，以及以 J-/R-lens 实现的多 token 扩展；候选覆盖是瓶颈。 |
| [Short Horizons](https://arxiv.org/html/2608.25347v1#bib.bib1) | §3–4、§5.1、§6 | 一阶传递解释和能量筛选改动；不能把单模型试验外推至所有架构。 |
| [Latents to Wires](https://arxiv.org/html/2609.32434v1#bib.bib1) | §4、§6.4、§7 | 用 J-lens 做定位再编辑；能力成本与目标移除同时可见。 |
| [Audio dog concept](https://arxiv.org/html/2609.33458v1#bib.bib4) | §2.2–2.3、§3.3–3.4 | 读出与任务相关干预并列；部分任务未超过对照。 |
| [VERITAS](https://arxiv.org/html/2610.23275v1#bib.bib12) | §2.1、§3、§4.4、Appendix A | 监督分类器与 CoT 回放分析；不误标为通用回答前预警。 |
| [Lexical Frames](https://arxiv.org/html/2610.22169v2#bib.bib12) | §2、§3.2、§4、Appendix D | 固定方向的上下文限制；最终输出一致性与中间概念忠实性分开。 |
| [U-Space](https://arxiv.org/html/2610.09087v1#bib.bib22) | §2–3、§4、Appendix A | 单次生成的语义不确定性分数；不是已校准正确概率。 |
| [DV-Lens](https://arxiv.org/html/2610.04489v1#bib.bib17) | §2–4、Appendix F | 参数级方法的直接引用；没有据此建立 J-lens 方法继承边。 |
| [Audio workspace](https://arxiv.org/html/2608.24958v1#bib.bib1) | §1–3、§5；Reference [12] | 实际用 logit lens，不能标为运行 J-lens 或复现原实验。 |
| [S-Space](https://arxiv.org/html/2610.13527v1#bib.bibx24) | §2–3、§5–6；Reference [24] | 空间子空间不等同原始 J-space；相关论文不等于相同测量对象。 |

另复查根论文、[looped LM](https://arxiv.org/html/2609.01924v1) 与 [Mamba](https://arxiv.org/html/2609.32102v1)。Mamba 参考文献 `#bib.bib5` 明确引用 looped 工作，可以新增真实 citation 边；不是仅据发表顺序推导继承。

## 作者技术文章和同一研究去重

- [J-lens 技术文章](https://transformer-circuits.pub/2026/workspace/#published) 显示 2026-07-06 发表；同一工作 arXiv 初次提交为 2026-07-16T22:54:30Z。两个入口分别存时间，不算两份独立支持。
- [S-Space 作者项目页](https://mirros.ai/blog/s-space#article-start) 显示 Research Insight / Sept 8, 2026，早于 10 月 arXiv 提交；该页由论文指向，作为 companion 保留，不另算一项研究。项目页和论文的报告版本不假定逐字一致。
- U-Space 的 [LessWrong 作者解释](https://www.lesswrong.com/posts/hcpiLD8XjK7cqG6Lr/uncertainty-in-the-verbalizable-workspace-1) 继续按已有同研究映射保留；本轮没有新增该帖评论核查。

## 引用索引失败与元数据冲突

**Semantic Scholar**：`/graph/v1/paper/ARXIV:2607.15495/citations?fields=title,authors,year,externalIds,publicationDate,contexts,intents,isInfluential&limit=100` 返回 429；等待后单次重试仍 429。没有取得可靠前向引用清单，不记录为 0。

**OpenAlex**：网络请求已经恢复，但其元数据不能直接采用。

1. 全题名 `search` 是全文发现查询，返回 763 条宽泛命中；这不是引用数。进一步 `filter=title.search:...` 只返回一条不同作者的近似题名 Zenodo 记录，拒绝当作原论文。
2. `GET /works/doi:10.48550/arXiv.2607.15495` 返回 200 与 `W7169817809`。DOI 和作者名单对应原工作，但题名为另一篇 “The Injected Word Reaches the Answer but Not the Report...”——这是可见的身份字段冲突。
3. 对该 ID 的 `filter=cites:W7169817809` 取得 1 条候选；因为根记录身份字段冲突，未把这个结果或 `cited_by_count` 作为已核实 J-lens 引用覆盖，也未建立图谱边。

因此全球引用总数继续为 `null`。一次成功的 HTTP 状态、错误/混合元数据、未检到或未取得结果，都不能变成“全部只有这些文献”。

## 集成边界与下一小步

保留原 7 节点默认图，论文目录逐项展开；摘要直接链接原文。新论文的引用边、采用方法、评测与实证支持应区分。本轮只交付原文核对后的 citation/method 记录，没有自动把每一篇直接引用论文变为支持证据，也没有制造假设版本或实验结果。

下一步是把待审核 brief/边供人工审阅，并按用户指定范围补查具体讨论观点；点赞与作者身份仅作为发现优先级，评论的具体内容与依据才决定其与主张的关系。前向引用索引仍需处理身份冲突/访问限制，不能用近期 RSS 替代历史检索。

## 软件方法引用

本报告使用的技能来自 K-Dense，来源许可和固定 commit 见 `docs/research-skills.md`。已实际核对其最新 arXiv 元数据：v2、首次提交 2026-08-30、版本更新 2026-09-02，未登记正式期刊或 publisher DOI。

Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). [Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://arxiv.org/abs/2609.00065). arXiv:2609.00065.

这是软件方法引用，不是 J-lens 科学证据或图谱研究节点。
