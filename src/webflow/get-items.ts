/* -------------------------------------------------------------------------- */
/*                             Webflow / Get items                            */
/* -------------------------------------------------------------------------- */
/**
 * Fetches records from Webflow using the provided configuration.
 * @param {Object} syncConfig - The configuration object.
 * @param {Object} selectedSync.webflow - The Webflow configuration.
 * @param {string} config.webflow.collectionId - The ID of the Webflow collection.
 * @param {string} config.webflow.apiKey - The API key for accessing the Webflow API.
 * @returns {Promise<Array>} - A promise that resolves to an array of Webflow records.
 * @throws {Error} - If there is an error fetching the Webflow items.
 */

import axios from "axios";
import { ui } from "../ui";

export async function getItems(syncConfig: Sync) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const apiKey = syncConfig.webflow.accessToken;
    let allItems = [];
    let offset = 0;
    let total = 0;
    let firstRun = true;
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;
    const options = {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: 100,
        offset: offset,
      },
    };

    do {
      const response = await axios.get(url, options);

      const items = response.data.items;
      const pagination = response.data.pagination;
      allItems.push(...items);

      if (firstRun) {
        total = pagination.total;
        firstRun = false;
      }

      offset += items.length;
    } while (offset < total);

    return allItems;
  } catch (error) {
    ui.prompt.log.error("Error getting items.");
    throw error;
  }
}
