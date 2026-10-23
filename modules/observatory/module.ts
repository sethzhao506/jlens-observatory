import { defineModule } from "@aihot/contracts/modules";

export default defineModule({
  name: "observatory",
  pages: [
    { path: "explore", file: "web/page.tsx", id: "observatory-explore" },
    { path: "try", file: "web/page.tsx", id: "observatory-try" },
    { path: "investigate", file: "web/page.tsx", id: "observatory-investigate" },
    { path: "evidence", file: "web/page.tsx", id: "observatory-evidence" },
    { path: "branches/:branch", file: "web/page.tsx", id: "observatory-branch" },
  ],
  redirects: [
    { match: "regex", path: "^/understand/?$", status: 302, location: "/explore", keepQuery: true, why: "Research introductions now live in the evolution graph" },
    { match: "exact", path: "/research-updates", status: 302, location: "/all", keepQuery: true, why: "Research news and discussion use the existing feed" },
  ],
  apiPaths: [/^\/api\/v1\/(observatory|research-updates|research-discussions)$/],
});
