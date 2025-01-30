/* -------------------------------------------------------------------------- */
/*                            Webflow / Get fields                            */
/* -------------------------------------------------------------------------- */

/**
 * Note: this doens't accept the whole syncConfig object, just the webflowConfig object (syncConfig.webflow).
 *
 * It is done this way because it has to be accessed during configuartion where the syncConfig object is not yet available.
 *
 * Retrieves the fields of a collection from the Webflow API.
 * @param {Object} webflowConfig - The configuration object containing the collection ID and API key.
 * @returns {Array} - An array of fields for the collection.
 * @throws {Error} - If an error occurs while making the API request.
 */

import axios from "axios";

export async function getFields(webflowConfig) {
  const collectionId = webflowConfig.collection.id;
  const apiKey = webflowConfig.apiKey;
  const url = `https://api.webflow.com/v2/collections/${collectionId}`;
  const options = {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    },
  };
  try {
    const response = await axios.get(url, options);

    const fields = response.data.fields;

    // Sets name to displayName for consistency
    fields.forEach((field) => {
      field.name = field.displayName;
    });

    return fields;
  } catch (error) {
    ui.prompt.log.error("Error getting fields.");
    throw error;
  }
}
