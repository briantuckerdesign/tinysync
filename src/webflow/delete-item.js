/* -------------------------------------------------------------------------- */
/*                            Webflow / Delete item                           */
/* -------------------------------------------------------------------------- */

/**
 * Deletes an item from a Webflow collection.
 *
 * @param {string} itemIdToDelete - The ID of the item to delete.
 * @param {Object} syncConfig - The sync configuration object.
 * @param {string} syncConfig.webflow.collection.id - The ID of the Webflow collection the item is in.
 * @param {string} syncConfig.webflow.apiKey - The API key for accessing the Webflow API.
 * @returns {Promise<void>} - A promise that resolves when the item is successfully deleted.
 */

import axios from "axios";

export async function deleteItem(itemIdToDelete, syncConfig) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemIdToDelete}`;
    const options = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${syncConfig.webflow.apiKey}`,
      },
    };
    const response = await axios.delete(url, options);

    if (response.status === 204) {
      return;
    }
  } catch (error) {
    ui.prompt.log.error("Error deleting item.");
    throw error;
  }
}
