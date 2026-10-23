# 参考 AISafetyHot：持续来源与 Agent 接入计划

核对日期：2026-10-22（America/Los_Angeles）。以下保留此前公开资料、来源端点和只读 MCP 的核对记录，并补充本次仓库克隆与展示方式审查。不启用自动采集，不安装远程 skills，不改客户端 MCP 配置，不发生付费模型请求。表内早先来源数量与运行状态是当时的检查快照，不代表本次实时统计。

## 结论

当前优先补的是持续信源与跑通采集发布链。复用 AIHOT 的采集、去重、来源、主题、事件与 MCP，保持原有列表排版和配色。根据所有者本次要求，以持续研究动态和讨论为主，移除热点榜、日报与收藏的读者入口；此前关于这些入口的建议不再执行。AISafetyHot 可参考其来源署名、内容分层和 Agent 使用方式，但公开 Hub 不能直接拿来作为爬虫应用或网站模板。

## 本次克隆与来源展示审查

- 已克隆公开仓库至被忽略的 `.data/reference/AISafetyHot-Hub/`，只读检查，未安装或执行其中的脚本，也未将其 Agent 指令作为本项目规则。
- 固定检查版本：[d2fbc937acf8ae51fe4ad0f7d6b693517805c3b7](https://github.com/wuyoscar/AISafetyHot-Hub/tree/d2fbc937acf8ae51fe4ad0f7d6b693517805c3b7)。该版本树中没有应用源码、前端组件、依赖清单、爬虫实现或 GitHub Actions 工作流。`.github/` 只有资助与 Issue 路由配置。
- 公开内容包括中英日报、论文 Markdown/JSON/BibTeX、每日论文推荐和跨日去重账本；`status.json` 保存同步时间、条目 ID、计数与哈希。这些是已发布内容的导出格式，不是采集器模板。
- [英文实时动态页](https://aisafetyhot.com/en/featured)在标题之前展示来源：X 条目写作 `X @账号`，LessWrong 条目明确标为 `LessWrong`，其他条目展示网站名称。聚合报道列出代表来源、来源数与报道数。参考的是这种显式归属，不复制其热度分数或研究判断。
- 本地采用原有动态列表的来源行，分别标出平台与已知来源身份，保留原文链接和原发日期。X 来源可显示 `X @handle`；LessWrong 来源显示 `LessWrong`，作者只在资料中已知时附带。未知账号或作者不补造；采集方式 `external`、`rss` 不是读者需要识别的平台。
- 同一材料有多个来源时可以展示多个来源标识；来源数表示采集到的来源，不能改写成独立实验或独立科学支持的数量。研究图谱的已核实关系仍须另外审核。
- [根 LICENSE](https://github.com/wuyoscar/AISafetyHot-Hub/blob/d2fbc937acf8ae51fe4ad0f7d6b693517805c3b7/LICENSE)将仓库文字内容标为 CC BY-NC 4.0，并排除原始论文、数据与图片。虽然插件元数据有 `license: MIT`，不能据此把整套文字或素材当成 MIT 模板。本次仅参考信息组织与公开接口说明，不批量搬运摘要、品牌、图片或解读。
- `.mcp.json`、四份技能文档和接入指南用于外部 Agent 调只读 MCP。公开 Hub 中没有站内聊天或自主科学实验实现；本次不安装这些技能或改客户端 MCP。

可直接复用的是本地已有来源归属、原文链接、时间线、去重与公开读取层。后续最小采集工作仍是验证目标 LessWrong 订阅、手动运行两轮并核对去重；X 依照所有者此前决定暂缓，不能因为界面增加平台标识就宣称已持续采集。

### 参考站公开了什么

- [README](https://github.com/wuyoscar/AISafetyHot-Hub)：实时新闻、热点、论文库、会议论文、日报，以及外部 Agent 的使用入口。
- [AGENTS.md](https://github.com/wuyoscar/AISafetyHot-Hub/blob/main/AGENTS.md)：Hub 不含应用源码、依赖清单或构建流水线。外部 publisher 每 30 分钟同步内容；这是**归档同步频率**，并非已知的爬虫频率。日报首版北京时间 08:00，后续更新同一期。
- 每日推荐从论文库挑 30 篇，包含新研究及较早重要工作，并用 `pushed.json` 跨日去重；不能理解成每天新发表 30 篇。
- [论文库收录说明](https://aisafetyhot.com/zh/papers)：按相关性收录，与精选、质量和新颖性评价分开。整理状态和发表时间影响排序，顺序不代表质量排名。
- [关于页](https://aisafetyhot.com/zh/about)列出了 X、RSS、网页、接口和浏览器采集。来源数是站点自报且会变化；公开资料没有解释浏览器采集服务如何运行，也没有公开 X 供应商与费用。
- [LICENSE](https://github.com/wuyoscar/AISafetyHot-Hub/blob/main/LICENSE)：Hub 文字为 CC BY-NC 4.0，原始论文、数据和图片仍归原作者。参考流程；本项目的摘要以原始来源为依据，不批量镜像其站内解读。

## 当前能力对照

| 能力 | 当前已有 | 尚缺／本轮核对到的状态 | 最小处理 |
|---|---|---|---|
| RSS / Atom、网页列表、JSON | 六类读取器和后台预览 | 当前 13 个来源都是 `external` 手动资料归属；另 2 个 X 查询暂停 | 增加通过实测的订阅来源 |
| 定期爬取 | worker 每分钟调度到期来源，按来源间隔抓取；每日调整频率 | 本轮进程检查只有 API 与 web，没有 worker；采集开关关闭 | 先手动试抓，再启用现有 worker |
| 去重、修订、来源时间 | `upsertMaterial`、identity_key、article_revisions、fetch_runs | 尚未用本主题真实持续源验证两轮；LW/AF 镜像域名不会自动视为同一 URL | 核对真实重复样本；先避免重叠订阅 |
| 全部动态与精选 | 预筛、双评分、写作、归组、统一发布 | 模型开关关闭；本地 `.env` 未配置模型凭据 | 免费采集与模型处理分开验收；凭据／预算齐备后跑小批次 |
| 热点、主题、日报 | 已有；日报规则成刊，周月报汇编 | 尚无持续运行结果；资料数量少，热点为空 | 使用真实新材料运行，不造今日动态或空日报 |
| 当日日报持续更新 | 当前日报覆盖截至北京时间 08:00 的固定 24 小时；调度跳过已存在的期刊 | 参考站会在当天继续更新同一期；本地没有同等自动滚动机制 | 首版复用固定日报；滚动更新另行定义窗口与版本记录 |
| 独立论文库、会议库 | 可复用 `paper` 分类、主题、搜索、文章页 | 无专门的宽收录论文流程、题录表及会议筛选 | 第一版继续用原页面，验证需求后再做模块 |
| GitHub 每日归档 | RSS/API/MCP 已有 | 没有类似 Hub 的 Markdown/JSON/BibTeX 发布器和去重推荐账本 | 内容流稳定后再做，不影响先上线阅读 |
| 外部 Agent | `/agent`、MCP、Agent Markdown、公开 API 均存在 | 需要真实使用示例；近期工具不能覆盖完整历史资料 | 立即复用；再补长期研究检索 |
| 站内聊天 | 无现成聊天接口或会话模块 | 属于新功能；不能把 `/agent` 当聊天机器人 | 后置，单独设计 worker 任务与预算方案 |
| 中英阅读 | 旧双语资料可迁移 | 当前站 UI 仍是中文，无完整语言切换 | 数据流跑通后统一处理，不让浏览页面调模型 |

源码位置：

- `packages/backend/src/sources/{rss,web-list,json-list,x,collect}.ts`：采集与到期调度。
- `packages/backend/src/content/materials.ts`：身份、来源、修订和历史材料时间。
- `packages/backend/src/editorial/analyze.ts`：预筛、双评分、结构化、摘要。
- `apps/worker/src/schedules.ts`：每分钟来源调度、每 5 分钟热榜、每半小时到期成刊检查。
- `packages/backend/src/reports/compose.ts`：`composeDaily` 默认返回已有日报，`composeDueReports` 跳过已生成期刊；带理由的重编不等于日内自动滚动。
- `site/site.ts` 的 `EDITION_TIMES`：日报 08:00、周报周一 10:00、月报每月 1 日 10:30，均为北京时间。
- `packages/backend/src/publication/`：所有公开出口的读取层。
- `apps/api/src/routes/mcp.ts`、`packages/contracts/src/mcp.ts`：当前 Agent 工具。

## 首批候选持续来源

以下是**候选入口**，不是已启用的订阅清单。选择具体来源由站点所有者确认。保持全文展示和再分发关闭。

| 优先级 | 来源与入口 | 已做的检查 | 接入与注意点 |
|---|---|---|---|
| 首批 | [Transformer Circuits Atom](https://transformer-circuits.pub/feed.xml) | HTTP 200、Atom，解析到 56 条，含原 workspace 论文；主页声明此订阅 | 直接 `rss`，随后按 J-lens/工作空间相关性筛选 |
| 首批 | [Camila Blank 作者 RSS](https://www.lesswrong.com/feed.xml?userId=tCJsGiwvCCXjeqkLq) | 从真实作者页核对 userId；HTTP 200、RSS，含 R-lens 与 WorkspaceBench 两条 | 直接 `rss`；`userId` 参数属于平台未正式支持选项，保留健康检查 |
| 首批 | [JLens-Ouro 研究分支 Atom](https://github.com/VykosMolt/JLens-Ouro/commits/jlens-ouro.atom) | HTTP 200、Atom，20 条；metadata 确认默认研究分支为 `jlens-ouro`，与显式分支 JSON 返回一致 | 直接 `rss`，保留提交 SHA、原文与提交时间；提交不代表实验已运行 |
| 首批 | [Anthropic Jacobian Lens 官方代码 Atom](https://github.com/anthropics/jacobian-lens/commits/main.atom) | HTTP 200、Atom，1 条初始发布；metadata 确认默认分支为 `main` | 直接 `rss`；按真实更新节奏设置低频，不为数量凑更新 |
| 补充发现 | [LessWrong RSS](https://www.lesswrong.com/feed.xml) | HTTP 200、RSS | 全站订阅仅给最近约 10 条，不能每天抓一次便声称覆盖完整；优先目标作者或已验证的主题入口 |
| 补充发现 | [Alignment Forum RSS](https://www.alignmentforum.org/feed.xml) | HTTP 200、RSS | 同样有窗口限制；与 LW 高度重叠，先验证共同帖子身份，避免当成独立支持 |
| 后置 | [nnsight releases JSON](https://api.github.com/repos/ndif-team/nnsight/releases?per_page=3) | HTTP 200、JSON，读到真实发布记录 | `json_list`；这是工具的通用更新，只有关联 J-lens 工作流的更新才纳入 |
| 后置 | [Neuronpedia Blog](https://www.neuronpedia.org/blog) | HTTP 200，原始 HTML 含文章卡片；尚未用仓库 collector 验证选择器 | 可尝试 `web_list`；先预览，不把网页可访问当成已接入 |
| 待验证／筛选 | arXiv J-lens / Jacobian lens / looped LM 关键词检索与版本更新；[cs.CL RSS](https://rss.arxiv.org/rss/cs.CL) | 关键词 Atom API 本次超时；cs.CL RSS HTTP 200，但范围过宽 | 先复核关键词入口或筛选策略，避免为全学科材料付费处理；保留 arXiv ID 与版本 |

发现的具体问题：`VykosMolt/JLens-Ouro/commits/main.atom` 虽然 HTTP 200，却指向继承的祖先分支；正确研究分支是 `jlens-ouro`。这不是服务失败，而是读错分支。可直接用正确分支 Atom，无需为它新增 JSON 采集器；[显式分支 commits JSON](https://api.github.com/repos/VykosMolt/JLens-Ouro/commits?sha=jlens-ouro&per_page=2)作为核对证据。

HTTP/格式成功仍不等于 AIHOT 端到端抓取成功：正式加入前要用现有后台 preview 核对日期、链接、正文许可和首轮历史边界。无可靠发表日期的材料保留为空，不把抓取日当原发日。

## 执行顺序与验收

### 1. 先接持续来源，免费预览

交付：首批选定的 RSS/JSON 配置、每个来源的一次真实预览、采集覆盖说明。配置主要放 `industry/sources.json`；已有外部资料来源保留，不改写其历史身份。

- 优先 Transformer Circuits、目标作者 RSS、两个研究代码仓库，泛站订阅只辅助发现。
- 手动调用现有预览，不启用 X/Jina 或模型；记录找到／相关／重复／缺日期的条数和失败原因。
- `scripts/seed.ts` 只新增不覆盖，不能靠修改 JSON 假定现有数据库配置已更新；实际修改用后台版本检查与审计。
- 先复用六类 collector。仅在目标源语义无法表达且有真实失败样本时，补最小适配。

验收：每个被采用来源能正确产出标题、可信日期和原文链接；错误或不完整来源显示为待处理，不能冒充成功。

### 2. 跑一轮完整处理，再运行定时任务

交付：一小批真实材料的采集→预筛→摘要→归组→公开页面，随后跑第二轮检查去重。

- 缺少后端模型凭据与可接受预算时，先完成原始采集验收；不将未处理材料当成已公开结论。
- 付费调用全部经过现有回执与预算；记录本批真实调用量、耗时、错误和成本，不先编一个月费。
- 精选门槛不变，后续用用户标注样本校准。相关但未入选的内容保留在“全部动态”。
- 确认重复抓取不新增同一文章、版本修订不丢历史、旧文不变成今天的新闻后，再启用 worker 的已有调度。
- 来源频率按更新窗口确定；作者／论文可低频，全站最近十条的 feed 要评估漏收风险。不能把 Hub 的 30 分钟归档同步照抄为所有源的抓取频率。

验收：第二轮新增／修订／重复有可核对计数；发布有真实新内容；未启用或失败任务在后台可见。

### 3. 沿用原有排版，收敛为持续研究动态

交付：带明确来源平台的持续研究动态与讨论，保留导读、图谱、论文和代码材料的阅读入口。

- 复用现有 `/all`、`/`、`/topics`、`/story` 和来源行，不增加另一套列表或更换全站样式；热点榜、日报和收藏不再作为读者功能入口。
- 每条动态明确标注 LessWrong、X 或其他真实平台／网站；能核对账号时附上账号，原文链接可直接访问。首页、列表、搜索和详情中的署名保持一致。
- 论文更新、代码、复现、失败结果、批评和公共讨论都可成为材料；转载和多次提及不形成独立科学支持。
- 固定导读与历史研究资料保留原日期；“近期动态”只呈现真实近期更新。
- 等主题材料和查询需求稳定后，再评估独立论文库与 BibTeX 导出；不为小主题硬凑每日 30 篇。

验收：读者能区分今天发生的变化、历史背景和编辑精选，找到原文；同一事件的后续材料可聚合。

### 4. 先用外部 Agent，补长期研究检索

交付：在当前 `/agent` 放 J-lens 实际问法与可验证示例，复用现有 MCP。无需先在网页里嵌入 LLM。

当前可以实际调用：

```json
{"name":"jlens_get_latest","arguments":{"window":"7d","mode":"all","limit":10}}
{"name":"jlens_search","arguments":{"q":"J-lens","window":"7d","limit":10}}
```

注意当前 `jlens_search` 不接受 `mode`；不能照抄参考站参数。协议版本号也不能直接比较功能多少。

读者可以对自己的 Agent 说：“查近一周 J-lens 的更新，每条保留原文链接；分清来源报告、评论与独立复现。没有结果就说明没有。”

真正缺少的研究能力：不限最近 7 天的长期资料搜索、按 ID 读取材料、发现研究主题。后续通过 `modules/observatory` 的 AgentAbility 接入，复用 publication 层的详情与主题读取；避免建立第二份内容库。工具返回来源、日期、适用范围和审核／执行状态，缺值不猜。

站内聊天另作后续切片：先提交问题 → 后端排队 → worker 调模型与可审计工具 → 保存结果 → 前端轮询读取。显式动作触发，有预算与回执；页面打开不调用模型，保留普通搜索与来源导航。

验收：Agent 的回答能追到实际工具输出和原文；默认近期工具、长期资料与站内聊天的能力边界写清。localhost 供本机客户端使用，云端客户端需要日后的正式可访问部署，本轮不公开暴露服务。

### 5. 内容流稳定后再做 Hub 与技能

可选交付：每日 Markdown/JSON/BibTeX 归档、版本／去重账本、中英阅读，以及围绕真实工作流编写的简报、找依据、比较证据技能。先跑通工作流，再形成技能；不安装一批空壳或直接复制对方的账号、许可与科学结论。

## 本轮实际验证

- API 与 web 正在运行；进程检查未发现 worker。
- 本地 MCP：`jlens` 4.0.0，发现 7 个只读工具并实测搜索；原有 `scripts/mcp-check.ts` 通过。
- 参考站 MCP：`aisafetyhot` 2.4.0，发现 7 个只读工具；一次小范围 J-lens 搜索返回可追溯的原文结果。
- 两站本次搜索都成功，但检索覆盖范围不同；没有把某次搜索结果数当成研究领域的讨论总量。
- 当前工具对比：我们有 latest/search/hot/story/daily/weekly/monthly；参考站有 latest/search/hot/story/daily/content/topics。我们已有基础 Agent 交互能力，主要需要补研究资料的长期检索与使用引导。
- 参考站 [.mcp.json](https://github.com/wuyoscar/AISafetyHot-Hub/blob/main/.mcp.json)、[Agent 指南](https://github.com/wuyoscar/AISafetyHot-Hub/blob/main/docs/agent.md)、[skills 目录](https://github.com/wuyoscar/AISafetyHot-Hub/tree/main/skills)表明其公开用法是外部 Agent 调只读工具；没有证据证明其已经提供站内聊天或自主运行科学实验。
- `.env` 中采集、模型与推送开关继续关闭；本轮没有安装第三方技能或启动付费流程。

本轮日志仅保存在忽略的 `.data/agent-interface-audit.json` 和 `.data/mcp-audit-check.log`。没有修改业务代码，因此不重复运行之前受 Windows 进程语义影响的全量测试。
