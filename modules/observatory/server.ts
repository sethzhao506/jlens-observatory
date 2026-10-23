import { defineServerModule } from "@aihot/backend/modules";
import { readModulePublication } from "@aihot/backend/publication/modules";
import { v1Items } from "@aihot/backend/publication/v1";
import { QueryError, strictQuery } from "../../apps/api/src/http/respond.ts";
import { publicHandler, sendV1 } from "../../apps/api/src/routes/v1.ts";
import document from "./data/observatory.json" with { type: "json" };
import { researchContext } from "./updates.ts";
import { discussionForItem, type DiscussionDocument } from "./research.ts";

export default defineServerModule({
  name: "observatory",
  publication: { read: () => structuredClone(document) },
  http(app) {
    app.get("/api/v1/observatory", publicHandler(async (request, reply) => {
      strictQuery(request, []);
      return sendV1(request, reply, readModulePublication<object>("observatory"), {
        etagPrefix: "observatory", cacheControl: "public, max-age=60, must-revalidate",
      });
    }));
    app.get("/api/v1/research-discussions", publicHandler(async (request, reply) => {
      const query = strictQuery(request, ["item"]);
      const item = query.item;
      if (!item || [...item].length > 200 || item.trim() !== item || /[\u0000-\u001f\u007f]/.test(item)) throw new QueryError("item must contain 1 to 200 characters without surrounding whitespace or control characters.");
      const { discussions } = readModulePublication<{ discussions: DiscussionDocument }>("observatory");
      return sendV1(request, reply, { ...discussionForItem(discussions, item), checkedAt: discussions.checkedAt }, {
        etagPrefix: "research-discussions", cacheControl: "public, max-age=60, must-revalidate",
      });
    }));
    app.get("/api/v1/research-updates", publicHandler(async (request, reply) => {
      const q = strictQuery(request, ["q", "cursor"]);
      const search = q.q?.trim() || null;
      if (search && ([...search].length < 2 || [...search].length > 200)) throw new QueryError("q must contain 2 to 200 characters.");
      const result = await v1Items({ mode: "all", window: "7d", by: "published", category: null, q: search, limit: 100, cursor: q.cursor ?? null });
      const items = result.items.flatMap((item) => {
        const research = researchContext(item);
        return research ? [{ ...item, research }] : [];
      });
      return sendV1(request, reply, { ...result, items, page: { ...result.page, count: items.length },
        notice: "Editorial associations are candidate research links, not verified scientific relations. Original publication dates define the seven-day window.",
      }, { etagPrefix: "research-updates", cacheControl: "public, max-age=60, must-revalidate" });
    }));
  },
  llms: () => ({
    pages: ["/explore — typed research evolution graph with brief bilingual introductions and original-source links; /try — arithmetic checks; /investigate — personal, unrun proposals"],
    api: ["GET /api/v1/observatory — public versioned sources, claims, evidence and typed relations", "GET /api/v1/research-updates — relevant candidates from the last seven days; not scientific confirmation", "GET /api/v1/research-discussions?item=ID — inspected discussion snapshots and selected viewpoints for a material; not independent validation"],
    usage: ["Source-reported aggregates and arithmetic checks are not independent model replications. Personal proposals stay in the reader's browser and are unrun."],
  }),
});
