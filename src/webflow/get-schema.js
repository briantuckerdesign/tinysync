/* -------------------------------------------------------------------------- */
/*                            Webflow / Get schema                            */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the schema for a Webflow collection using the provided sync configuration.
 * @param {Object} syncConfig - The sync configuration object.
 * @returns {Promise<void>} - A promise that resolves when the schema is retrieved.
 */

import axios from "axios";

export async function getSchema(syncConfig, enableReturn = false) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const apiKey = syncConfig.webflow.apiKey;
    const url = `https://api.webflow.com/v2/collections/${collectionId}`;
    const headers = {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    };

    const response = await axios.get(url, { headers });

    if (enableReturn) return response.data;
    syncConfig.webflow.newSchema = response.data;
  } catch (error) {
    ui.prompt.log.error("Error getting schema.");
    throw error;
  }
}
