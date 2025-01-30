import { ui } from "../ui";

/**
 * itemIdsToDelete expects: [{ id: "itemId" }]
 */
export async function deleteItems(itemIdsToDelete: string[], syncConfig: Sync) {
  try {
    const collectionId = syncConfig.webflow.collection.id;
    const url = `https://api.webflow.com/beta/collections/${collectionId}/items`;
    const myData = JSON.stringify({
      items: itemIdsToDelete,
    });
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${syncConfig.webflow.apiKey}`,
      },
      body: myData,
    };
    const response = await fetch(url, options);

    if (response.status === 204) {
      return;
    }
  } catch (error) {
    ui.prompt.log.error("Error deleting item.");
    throw error;
  }
}
