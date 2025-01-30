/* -------------------------------------------------------------------------- */
/*                         Webflow / Delete all items                         */
/* -------------------------------------------------------------------------- */
/**
 * Deletes all items from a Webflow collection.
 *
 * @param {string} selectedSync - The selected sync, contains the Webflow API key and collection ID.
 * @returns {Promise<void>} - A promise that resolves when all items are deleted.
 */

import { ui } from "../ui";
import { webflow } from "./index";

export async function deleteAllItems(selectedSync: Sync) {
  try {
    const items = await webflow.getItems(selectedSync);
    for (let item of items) {
      const itemId = item.id;
      await webflow.deleteItem(itemId, selectedSync);
    }

    return;
  } catch (error) {
    ui.prompt.log.error("Error deleting all items.");
    throw error;
  }
}
