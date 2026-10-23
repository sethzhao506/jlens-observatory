# J-lens 定向引用补查：2026-10-22

这是目录扩充与来源核对记录，不是系统综述或完整 citation census。核对日期按 America/Los_Angeles 记录；来源原始时间保留各自的 UTC 值。没有运行模型实验，也没有把作者报告当作本站复现。

## 原先为什么少

原 14 条是手动迁入的相关阅读资料，不是引用检索结果。其中 12 条有日期、进入动态流，Ouro 仓库和 R-lens 层忠实性评论因原始日期未知只能通过详情阅读。`external` 来源仅记录归属；两个 LessWrong RSS 和两个 X 搜索均暂停，后台没有实际抓取历史。`/all` 没有七天限制，但单独的 `/api/v1/research-updates` 只有七天窗口，不能作为完整文献目录。

此次从原论文身份、关键词和向前引用候选出发，逐篇回查 arXiv 原文参考文献及 LessWrong 作者原文。OpenAlex、Semantic Scholar 的 API/DNS 访问失败，第三方引用索引仅用于发现候选；没有采用其快照数作为已核实引用总数。

原工作是 [Verbalizable Representations Form a Global Workspace in Language Models](https://arxiv.org/abs/2607.15495)，亦即原 [J-lens 技术网页](https://transformer-circuits.pub/2026/workspace/)。网页发布于 7 月 6 日，arXiv 首次提交于 7 月 16 日；两者是同一研究的不同发布入口，不能重复计算独立支持。

## 新增直接引用论文：10 篇

下列各项均核对了原文中的 Gurnee 等原研究参考文献。直接引用只证明引用关系，不自动说明采用 J-lens、支持原结论或完成独立验证。

| 资料 | 原文与核对位置 | 与 J-lens 的关系 |
|---|---|---|
| Concept Lens / Verbalizing Multi-Token Concepts in LLMs | [2608.31084v2](https://arxiv.org/html/2608.31084v2)，References、§§1–3 | 多 token 读出扩展；当前 v2 改了题名、作者和实验范围，保留首次提交及版本更新时间。 |
| Short Horizons and Sparse Concepts | [2608.25347v1](https://arxiv.org/html/2608.25347v1)，References、§§1–2、5.1 | 数学分析与筛选实验；局部线性化与单模型范围可见。 |
| From Latents to Wires | [2609.32434v1](https://arxiv.org/html/2609.32434v1)，References、§§1–2、4、6.4 | J-lens 定位模型编辑目标；同时报告能力损失。 |
| When Does the Concept of “Dog” Emerge in an Audio LLM? | [2609.33458v1](https://arxiv.org/html/2609.33458v1)，Reference 7、§2.2 | 音频概念的读出及任务相关干预；不是普遍因果使用结论。 |
| VERITAS / Verbalising Model's Computation for Chain-of-Thought Faithfulness Detection | [2610.23275v1](https://arxiv.org/html/2610.23275v1)，References、§§2.1、4.2–4.4 | 用带标签分类器和 J-lens 轨迹检测 CoT 忠实性；不是通用回答前预警。 |
| Lexical Reference Frames | [2610.22169v2](https://arxiv.org/html/2610.22169v2)，References、§§1–2 | 与固定方向读出的比较和质疑；最终输出一致性不能直接当作中间概念忠实性。 |
| U-Space | [2610.09087v1](https://arxiv.org/html/2610.09087v1)，References、§§2–3、Appendix A | 不确定性读出与长度控制；不把分数写成校准后的正确概率。 |
| DV-Lens | [2610.04489v1](https://arxiv.org/html/2610.04489v1)，References 与 related work | 参数级 Jacobian 方法；有直接引用，未标为 J-lens 方法继承。 |
| Can We Read the Mind of an Audio LLM? | [2608.24958v1](https://arxiv.org/html/2608.24958v1)，Reference 12、§§1–3、5 | J-space 相关工作，实际采用 logit-lens 代理，未称为 J-lens 复现。 |
| S-Space | [2610.13527v1](https://arxiv.org/html/2610.13527v1)，Reference 24 | 空间工作空间研究；直接引用不等于同一子空间或原实验复现。 |

## 新增作者报告与讨论：6 条

- [概念注入与报告顺序](https://www.lesswrong.com/posts/uvgw5FTS2RXgFFFii/when-and-when-not-llms-can-verbalize-awareness-of-j-space)：单模型协议对照，不能推出一般内省能力。
- [Topic Detector, Not Lie Detector](https://www.lesswrong.com/posts/GZCMmCHZiF8vhsczr/a-topic-detector-not-a-lie-detector-what-j-space-monitoring)：定向 VJP 的有限负结果，不冒充完整 J-lens 实验。
- [VLM hallucinations](https://www.lesswrong.com/posts/T3u6Hctes6vkawsib/reading-into-vlm-hallucinations-using-the-jacobian-lens)：小模型图像案例；部分结果可由普通 logit lens 得到。
- [J-space meta-tokens](https://www.lesswrong.com/posts/6ek6n7yZ5DzfarJHy/towards-surfacing-model-algorithms-with-meta-tokens-in-the-j)：候选计算与具体干预；读出词不自动等于因果机制。
- [J-space auditing might be unreliable](https://www.lesswrong.com/posts/69fachkoAs2ZHeSst/j-space-auditing-might-be-unreliable-1)：奖励黑客审计的有范围负结果。
- [工程成本分析](https://www.lesswrong.com/posts/vHxGD5HKsFuBStirq/anthropic-s-j-lens-a-research-engineer-s-analysis)：拟合、推理与词典范围的成本分析，不将小词表开销外推到全部模型。

另核对 [U-lens 作者导读](https://www.lesswrong.com/posts/hcpiLD8XjK7cqG6Lr/uncertainty-in-the-verbalizable-workspace-1)，其链接指向 U-Space 同一论文及代码。保留作者帖的原始时间与链接，作为对应论文的 companion，不再增加一条独立研究或支持计数。

## 存储与读者状态

- `industry/reading-list.json` 从 14 条扩到 30 条，新增 16 条默认 `selected:false`。30 是资料数，不是全球引用数。
- 本地发布验证为 28 条有日期的相关动态、12 条既有有效精选；两条无日期资料保留详情入口，没有制造发表日期。
- 10 篇新论文逐条保存作品 ID、版本、原始日期、版本更新时间、直接引用定位和核对日期。新讨论分别标为直接原文链接或相关讨论。
- 首轮七节点图保持精选阅读路径，没有因引用检索自动建立支持、质疑或假设修订边。
- `/all` 使用原模块插槽显示一行覆盖说明，链接到导读的 `#search-coverage`。覆盖明细、引用论文和同研究作者帖按需展开。
- 新来源只展示摘要和原文，全文展示及再分发关闭。采集、模型、推送与 IndexNow 开关没有开启。

仍缺少完整引用索引同步、历史讨论回填、X 覆盖和后续版本监测。它们不能用一次关键词搜索或 RSS 近期窗口代替。

本次检查：类型检查、前端构建、16 项模块测试、6 项浏览器验收通过；真实目录及页面数量与上述统计一致，原精选未被覆盖，重复导入没有新增条目。页面和机器出口 smoke 的唯一未通过项仍是本地开发免登录的 `/admin/login` 返回 302，而脚本期望 200；没有把它或原生 Windows 全套测试记录为全部通过。
