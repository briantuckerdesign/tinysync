/* -------------------------------------------------------------------------- */
/*                           Webflow / Publish Items                          */
/* -------------------------------------------------------------------------- */

/**
 * Publishes items to a Webflow collection.
 *
 * @param {Object} syncConfig - The sync configuration object.
 * @param {Array} arrayOfItemIds - An array of item IDs to be published.
 * @returns {Promise} - A promise that resolves with the response data from the API.
 */

import axios from "axios";

export async function publishItems(syncConfig, arrayOfItemIds) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const apiKey = syncConfig.webflow.apiKey;
    const body = { itemIds: arrayOfItemIds };
    const response = await axios.post(
      `https://api.webflow.com/v2/collections/${collectionId}/items/publish`,
      body,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response.status === 409) {
      ui.prompt.log.error(
        "If you site is new, it needs to be published from Webflow before you can publish items to it."
      );
      return;
    }
    ui.prompt.log.error("Error publishing items.");
    throw error;
  }
}
