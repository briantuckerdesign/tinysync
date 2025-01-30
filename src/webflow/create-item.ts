import { ui } from "../ui";

export async function createItem(parsedData, syncConfig: Sync) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const url = `https://api.webflow.com/beta/collections/${collectionId}/items`;
    const apiKey = syncConfig.webflow.apiKey;
    const body = {
      isArchived: false,
      isDraft: false,
      fieldData: { ...parsedData },
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, options);

    if (response && response.status === 202) {
      return response;
    }
  } catch (error) {
    ui.prompt.log.error("Error creating item.");
    throw error;
  }
}
