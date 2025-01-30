/* -------------------------------------------------------------------------- */
/*                                   Webflow                                  */
/* -------------------------------------------------------------------------- */
/**
 * Any time we talk to Webflow directly, we use this module.
 *
 * Note, this is not the official webflow js package,
 * as I wasn't happy with how it works with api v2 at this time.
 * These use axios.
 *
 * Future TODO: switch to referencing by ID to simplify... everything.
 */
import { deleteAllItems } from "./delete-all-items";
import { deleteItem } from "./delete-item";
import { getCollection } from "./get-collection";
import { getCollections } from "./get-collections";
import { getFields } from "./get-fields";
import { getItems } from "./get-items";
import { getSchema } from "./get-schema";
import { getSites } from "./get-sites";
import { publishItem } from "./publish-item";
import { publishItems } from "./publish-items";
import { createItem } from "./create-item";
import { createItems } from "./create-items";
import { updateItem } from "./update-item";
import { deleteItems } from "./delete-items";

export const webflow = {
  deleteAllItems,
  deleteItem,
  deleteItems,
  getFields,
  getCollection,
  getCollections,
  getItems,
  getSchema,
  getSites,
  publishItem,
  publishItems,
  createItem,
  createItems,
  updateItem,
};
