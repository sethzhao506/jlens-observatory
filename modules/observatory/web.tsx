import { defineWebModule } from "@aihot/web/modules";
import { IconDoc, IconGrid } from "@aihot/web/components/icons";
import { FeedCoverage } from "./web/coverage.tsx";

export default defineWebModule({
  name: "observatory",
  root: { Top: FeedCoverage },
  sidebar: { section: "研究", items: [{ to: "/understand", label: "研究导读", icon: IconDoc }, { to: "/explore", label: "研究图谱", icon: IconGrid }] },
  tabs: [{ key: "research", to: "/understand", label: "研究", icon: IconGrid }],
  tools: [{ to: "/try", label: "Try · 确定性小检查", icon: <IconGrid /> }, { to: "/investigate", label: "Investigate · 调查计划", icon: <IconDoc /> }],
});
