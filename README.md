<h1 align="center">J-lens Research Observatory</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-176b75?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Node.js-24.22.1%2B-176b75?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 24.22.1 或更新版本">
  <img src="https://img.shields.io/badge/PostgreSQL-17-176b75?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17">
  <img src="https://img.shields.io/badge/Docker-Compose-176b75?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
</p>

<p align="center">
  <b>看懂 J-lens，沿证据理解研究发展，找到值得检验的下一步。</b><br>
  研究讨论、双语导读、演化图，以及从来源报告到小检查和实验提案的一条阅读路径。
</p>

<p align="center">
  <b>简体中文</b> · <a href="README.en.md">English</a>
</p>

<p align="center">
  <a href="#跑起来">跑起来</a> ·
  <a href="#项目配置">项目配置</a> ·
  <a href="#它是怎么工作的">它是怎么工作的</a> ·
  <a href="#文档">文档</a> ·
  <a href="https://github.com/sethzhao506/jlens-observatory/issues">交流与纠错</a>
</p>

<br>

## 这是什么

J-lens Research Observatory 是基于 [AIHOT 开源框架](https://github.com/KKKKhazix/AIHOT) 开发的研究入口。保留原有排版、色调、动态流、搜索、来源标注、后台和发布机制，在原布局内增加研究工具。

首个主题是 **J-lens**，首个完整案例是 **J-lens on looped language models / Ouro**。希望帮助读者沿着这条路径进入研究：

**看懂问题 → 沿演化图理解发展 → 找到主张的原文依据 → 查看来源曲线 → 完成小检查 → 比较竞争解释 → 保存并导出调查提案。**

内容以 LessWrong 讨论、论文、代码和直接相关进展为主；X 讨论是计划追踪的来源，目前暂缓接入。通用 AI 新闻、融资、人事和营销不进入默认研究范围。关注的是新证据改变了什么判断，而不只是热度。

## 为什么做这个项目

进入一个研究方向，通常不缺链接，缺的是把问题、方法、证据和下一步行动连接起来的解释：一种读出究竟测量了什么？结论在哪些条件下成立？什么仍有争议？哪个可负担的小实验能区分竞争解释？

这个项目先做好一个可点击、可追溯的案例，不声称已经完成全面综述、独立复现或自动化科研。

## 说在前面

- **研究页面默认英文，可以切换中文。** 使用 `?lang=zh` 切换；原框架导航、后台及部分工具页仍为中文，尚未完成全站翻译。
- **阅读和确定性检查无需登录或模型密钥。** 当前使用人工整理的阅读目录，本地采集、模型调用、推送和 IndexNow 均关闭。从上游模板生成新 `.env` 后，需要先关闭相关开关，见[跑起来](#跑起来)。
- **收录数量不等于全部引用。** 当前目录有 30 条资料，28 条有日期、进入动态流，另两条未知日期资料保留详情入口。演化图的 7 个核心来源是阅读路径，不是完整 citation graph；J-lens 全球引用总数仍未知。
- **作者报告、算术重算和独立复现是不同状态。** Try 重算来源汇总值，没有运行 Ouro 模型实验。个人提案尚未公共审核，也尚未运行。
- **延续原框架，精简读者入口。** 热点榜、日报和收藏入口已隐藏，保留历史记录和上游机器接口。`site/site.ts` 已停用自动日报、周报和月报排程。
- **当前为本地开发版本。** 尚未配置正式 Observatory 域名。正式部署前需要确认管理员认证、条款、隐私与来源权限；本站使用自己的名称，不使用上游 AIHOT 品牌。

## 它是怎么工作的

沿用原有 API、数据库和 worker，复用信源管理、去重、内容诊断、人工修改和统一发布读取层。前端只通过 HTTP 读取后端，数据库与模型密钥保留在后端；普通页面浏览不触发模型调用。

研究模块保存来源、主张、证据、带类型的关系及提案模板。导读、图谱、Try 和 Investigate 共享这些标识，通过原有发布边界读取研究文档，没有另建一套网站框架。

### 来源与研究动态

目标流程是 **采集 → 去重 → 候选更新 → 核查 → 更新证据与图谱 → 发布**。当前通过脚本导入人工整理的阅读目录，尚未开启无人值守的持续检索与发布。

动态卡片和详情标出 LessWrong、X、GitHub、arXiv 等平台，并保留具体来源名及原文链接。来源配置共 34 条：30 个手动归属记录、2 个暂停的 LessWrong RSS 草案、2 个暂停的 X 搜索。来源归属不是订阅，配置存在也不代表已经采集成功。

沿用现有评分结构、维度和门槛；热度不能替代证据质量。同一研究的论文、代码和作者解读可以相互关联，不算多次独立验证。已核对的引用及访问失败记录见[引用补查](docs/citation-search-2026-10-22.md)。

### 证据与研究状态

图谱区分直接引用、方法改进、评测、质疑、编辑性阅读顺序、证据支持和真实提案修订。节点从左到右的位置表示阅读顺序，不证明继承关系。发表、版本更新、首次收录、机器检查和人工审核分别记录；未知日期保留为空。

Ouro 的 Try 示例从来源四舍五入后的均值重算 **34.17 − 22.60 = 11.57 个百分点**。这不能证明机制、因果使用、统计显著性，也不能在缺少样本数据时产生置信区间。不同估计器家族的分数不能错误拼接；未运行提案不会生成实验结果节点。

## 你会得到什么

| | |
|---|---|
| **研究动态与讨论** | 沿用精选、全部动态、主题与搜索，聚焦 J-lens、读出方法和 looped LM/Ouro，保留来源平台与原文链接。 |
| **Understand 导读** | 英中短导读，完整长文、公式和技术细节按需展开。 |
| **Research Evolution Graph** | 从 7 个核心来源开始，保留五个研究分支；点击查看关系类型、方向、原文定位与核查状态，并可切换证据和假设视图。手机提供列表阅读。 |
| **Evidence 证据** | 一个有范围的 Ouro 主张、固定版本来源、报告曲线、估计器说明、局限和审核状态；不补造判断历史或运行结果。 |
| **Try 小检查** | 重算来源汇总值，检查结果是否可比；明确结果能说明什么、不能说明什么。 |
| **Investigate 调查计划** | 人工修改竞争解释、预测、控制、预算及结果判据；浏览器保存真实版本和父子关系，导出 JSON/Markdown，并关联回假设图。 |
| **阅读体验** | 保留原排版、色调、深浅色与阅读设置；手机底栏为“精选、研究、我的”，隐藏收藏和报告入口。 |
| **给 Agent 用** | 复用 RSS、公开 API、MCP、Agent Markdown 和 `llms.txt`，增加研究文档和候选更新出口。这些是读取接口，不是已接入的聊天研究助手。 |
| **后台** | 复用信源试抓、诊断、人工修改、评测、付费回执、预算熔断和运行记录；付费处理仍在 worker 内执行。 |
| **开发端研究 skills** | 项目内安装四个 K-Dense 技能，用于文献检索、引用核对、综述与批判性审查；不会自动开启网站采集或读者 Agent。 |

## 看一眼

本地启动后可打开：

| 页面 | 可以检查什么 |
|---|---|
| [精选](http://localhost:3000/) / [全部动态](http://localhost:3000/all) | 论文、研究讨论、来源平台与原文链接。 |
| [Understand](http://localhost:3000/understand) | 从短导读进入，按需展开技术细节和检索覆盖说明。 |
| [Explore](http://localhost:3000/explore) | 从左到右阅读，点击节点和连线，追到主张与原文。 |
| [Try](http://localhost:3000/try) | 重算报告值，并理解算术检查的边界。 |
| [Investigate](http://localhost:3000/investigate) | 比较竞争解释，保存一次真实修订，下载提案。 |
| [主题](http://localhost:3000/topics) / [后台](http://localhost:3000/admin) | 查看研究分类与既有管理工具。 |

首个调查问题是：**匹配剩余计算距离、校准预算及独立测得的概念强度后，源轮次或目标出口是否仍影响可恢复性？** 当前提供调查计划，不声称完成了这个实验。

## 跑起来

需要 [Node.js 24.22.1 或更新版本](https://nodejs.org/en/download) 和 [Docker Compose](https://docs.docker.com/compose/install/)。Compose 提供 PostgreSQL 17。查看人工整理的阅读路径不需要模型 API Key。

```bash
git clone --branch setup/jlens-observatory https://github.com/sethzhao506/jlens-observatory.git
cd jlens-observatory
node scripts/init-env.ts
```

启动服务前，编辑生成的 `.env`，设置：

```dotenv
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
```

`FEISHU_*_ENABLED` 和 `INDEXNOW_SUBMIT_ENABLED` 也保持 false。上游 `.env.example` 中采集与模型调用默认是 true，`init-env` 会复制这些值并提示配置模型密钥；本次无模型预览无需填写 `LLM_API_KEY`，但必须显式关闭这两个开关。不要提交 `.env`，也不要把密钥发到聊天。

```bash
docker compose up -d --build
docker compose exec api node scripts/import-reading-list.ts
```

打开 <http://localhost:3000>。Compose 的 setup 只执行迁移和信源初始化，第二条命令导入阅读目录。重复导入会保留已有条目与后台修改，不重复新增；导入不代表启动持续采集。管理员密码由 `init-env` 生成，保存在 `.env` 的 `ADMIN_PASSWORD`。

已有数据库与本机运行环境可以执行：

```bash
node --env-file=.env scripts/seed.ts
node --env-file=.env scripts/import-reading-list.ts
```

原生运行、域名、HTTPS、备份与进程配置见[部署](docs/deploy.md)。部署文档也介绍上游可选的付费采集与模型流程；人工目录预览仍保持开关关闭。当前开发机器的便携 Node/PostgreSQL 位于忽略的 `.data/`，不随仓库提交。

运行后，`/agent` 提供 MCP、RSS 和 API 接入说明，`/api/v1/agent` 是机器入口，`/openapi-v1.json` 是公开接口描述。`/api/v1/observatory` 提供研究文档；`/api/v1/research-updates` 仅返回七天发布窗口内的相关候选，不是完整档案，也不自动确认科学关系。

### 运行检查

代码变更沿用已有检查，测试数据库名称必须以 `_test` 或 `_ci` 结尾：

```bash
npm ci
npm run typecheck
DATABASE_URL=postgres://127.0.0.1:5432/jlens_test npm test
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
```

上面环境变量写法用于 POSIX shell；PowerShell 使用 `$env:DATABASE_URL`。当前阅读路径已有类型、构建、定向后端/模块与浏览器验证记录；原生 Windows 完整测试尚未全部通过，工具条件与本地免登录 smoke 例外见[本地预览](docs/local-preview.md)。旧原型报告不能代替当前网站验收。

## 项目配置

本仓库已经按 J-lens 配置。继续在现有文件中扩充内容与行为，保留原网站布局：

| 文件 | 负责什么 |
|---|---|
| `site/site.ts` | 项目名称、原布局文案、导航可见性、停用自动报告。 |
| `industry/taxonomy.ts`、`industry/topics.json` | 研究分类、标签和主题。 |
| `industry/sources.json` | 手动来源归属与暂停的采集草案。 |
| `industry/reading-list.json`、`scripts/import-reading-list.ts` | 阅读目录及可重复执行的导入。 |
| `industry/prompts/`、`industry/selection.ts` | 研究相关性、写作要求及原有门槛；数字调整需要人工标注样本校准。 |
| `site/models.ts` | 将来启用付费处理时，各步骤使用的后端模型。 |
| `site/brand/`、`site/pages/`、`site/public/`、`site/changelog.json` | 品牌、条款与隐私模板、根文件及真实更新记录。 |
| `modules/observatory/` | 双语导读、图谱、证据、小检查、个人提案修订与导出。 |
| `modules/observatory/data/observatory.json`、`updates.json` | 研究记录和双语动态文案。 |
| `.agents/skills/` | 固定版本的 K-Dense 开发技能、许可证与安装来源。 |

来源存在、来源支持某条主张、主张得到独立验证要分别判断。个人浏览器草稿与公共审核内容分开。启用新采集源前，先试抓少量资料，检查相关性与噪声，并重复抓取验证去重。

## 文档

| 文档 | 内容 |
|---|---|
| [本地预览](docs/local-preview.md) | 可打开的页面、内容数量、实际检查记录与已知限制。 |
| [读者路径与实现](docs/observatory-reader-path.md) | 路由、架构复用、图谱、确定性检查、提案修订与采集范围。 |
| [研究来源与迁移](docs/research-provenance.md) | 复用资料、固定版本原文、数值快照、科学边界与缺失历史。 |
| [引用补查](docs/citation-search-2026-10-22.md) | 已核查的引用论文、作者讨论、去重和检索缺口。 |
| [项目研究 skills](docs/research-skills.md) | 四个 K-Dense 技能、来源版本、依赖与安装验证。 |
| [AISafetyHot 参考审查](docs/aisafetyhot-reference-plan.md) | 公开 Hub 实际提供什么、来源标注参考与许可边界。 |
| [定制](docs/customize.md) | 原框架站点配置、分类、信源、提示词、门槛、模型和品牌。 |
| [信源](docs/sources.md) | 采集类型、分级、权限、频率、旧文与外部推送。 |
| [精选与校准](docs/selection.md) | 原有评分流程及人工样本校准。 |
| [事件归组](docs/grouping.md) / [综述评测](docs/story-digest-evaluation.md) | 事件关系与综述评测；事件归组不等于科学证据支持。 |
| [部署](docs/deploy.md) | Docker、域名、更新、备份、进程设置和正式部署条件。 |
| [架构](docs/architecture.md) | API/web/worker 边界、模块、迁移、统一发布层与测试。 |

技术栈：Node.js 24 · TypeScript · React Router（服务端渲染）· Fastify · PostgreSQL · pg-boss · Tailwind CSS · Docker Compose。

## 交流与贡献

来源补充、纠错、研究提案和实现问题请提交到[本站仓库 Issues](https://github.com/sethzhao506/jlens-observatory/issues)。涉及主张或关系时，附上原始 URL、版本和具体段落。提交来源只是进入候选审核，不会自动变成已确认结论。

修改代码前阅读 [AGENTS.md](AGENTS.md)。[CONTRIBUTING.md](CONTRIBUTING.md) 保留上游框架的贡献要求；J-lens 专属内容留在本站，不作为通用框架能力提交上游。安全报告说明见 [SECURITY.md](SECURITY.md)。

## 下一步

先审核首条主张与图谱关系，人工试抓少量 LessWrong 来源并重复检查去重，再记录候选更新。X 等合适的服务配置后接入。

真实模型检查另行推进：固定源码 commit、checkpoint、数据、环境、预期结果、容限和预算，先尝试复现一个参考结果，再检验新假设。来源报告的数字和保存的提案不能替代实际运行。

## 许可

代码保留上游 [MIT 许可证](LICENSE) 与**数字生命卡兹克（Khazix）**的版权署名。AIHOT 名称和 Logo 不在该许可范围内；本站使用自己的身份。字体等说明见 [NOTICE](NOTICE)。

项目内 K-Dense skills 保留其上游 MIT 许可与来源记录。论文、帖子、外部代码和其他研究材料仍适用各自权利人的条款；代码许可证不代表可以任意转载这些内容。网站默认展示摘要与原文链接。
