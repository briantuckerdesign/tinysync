/* -------------------------------------------------------------------------- */
/*                           Webflow / Publish item                           */
/* -------------------------------------------------------------------------- */
/**
 * Publishes an item to a Webflow collection.
 * @param {Object} syncConfig - The sync configuration object.
 * @param {Object} record - The item record to be published.
 * @returns {Promise<Object>} - A promise that resolves with the response data from the Webflow API.
 */

import axios from "axios";
import { ui } from "../ui";

export async function publishItem(syncConfig: Sync, itemId) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const apiKey = syncConfig.webflow.apiKey;
    itemId = [itemId];
    const url = `https://api.webflow.com/beta/collections/${collectionId}/items/publish`;
    const body = { itemIds: itemId };
    const options = {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    };
    const response = await axios.post(url, body, options);

    return response.data;
  } catch (error) {
    ui.prompt.log.error("Error publishing item.");
    throw error;
  }
}
