/* -------------------------------------------------------------------------- */
/*                            Webflow / Update item                           */
/* -------------------------------------------------------------------------- */
import axios from "axios";

export async function updateItem(parsedData, syncConfig, itemId) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const apiKey = syncConfig.webflow.apiKey;
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;
    const body = {
      isArchived: false,
      isDraft: false,
      fieldData: { ...parsedData },
    };
    const options = {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    };

    const response = await axios.patch(url, body, options);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    ui.prompt.log.error("Error updating item.");
    throw error;
  }
}
