/* -------------------------------------------------------------------------- */
/*                                    Sync                                    */
/* -------------------------------------------------------------------------- */
import { createItems } from "./create-items.js";
import { updateItems } from "./update-items.js";
import { publishItems } from "./publish-items.js";
import { deleteItems } from "./delete-items.js";
import { runSync } from "./run-sync.js";
import { deleteSync } from "./delete-sync.js";
import { publishWebflowSite } from "./publish-site.js";

export const sync = {
  createItems,
  updateItems,
  publishItems,
  deleteItems,
  delete: deleteSync,
  run: runSync,
  publish: publishWebflowSite,
};
