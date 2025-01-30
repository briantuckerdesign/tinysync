/* -------------------------------------------------------------------------- */
/*                          Webflow / Get collection                          */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves a collection item from Webflow API.
 * @param {Object} syncConfig - The sync configuration object.
 * @returns {Promise<Object>} - The response data from the Webflow API.
 * @throws {Error} - If there is an error with the API request or response.
 */

import axios from "axios";

export async function getCollection(syncConfig) {
  try {
    const apiKey = syncConfig.webflow.apiKey;
    const collectionId = syncConfig.webflow.collection.id;
    const url = `https://api.webflow.com/v2/collections/${collectionId}`;
    const options = {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    };
    const response = await axios.get(url, options);

    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error("Request body was incorrectly formatted.");
    } else if (response.status === 401) {
      throw new Error(
        "Provided access token is invalid or does not have access to requested resource"
      );
    } else if (response.status === 404) {
      throw new Error("Requested resource not found");
    } else if (response.status === 429) {
      throw new Error(
        "The rate limit of the provided access_token has been reached."
      );
    } else if (response.status === 500) {
      throw new Error("We had a problem with our server. Try again later.");
    }
  } catch (error) {
    ui.prompt.log.error("Error getting collection.");
    throw error;
  }
}
