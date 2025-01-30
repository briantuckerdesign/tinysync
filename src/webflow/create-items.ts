import { ui } from "../ui";
import { webflowEndpoint } from "./endpoint";

export async function createItems(parsedData, syncConfig: Sync) {
  try {
    const wId = syncConfig.webflow.collection.id;
    const url = `${webflowEndpoint}/collections/${wId}/items/bulk`;
    const apiKey = syncConfig.webflow.apiKey;
    const body = {
      isArchived: false,
      isDraft: false,
      fieldData: parsedData,
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
    if (response && response.status === 202) return response.json();
  } catch (error) {
    ui.prompt.log.error("Error creating items.");
  }
}
