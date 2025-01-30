import { Webflow } from "webflow-api";
import { state } from "../state";
import { ui } from "../ui";

export async function handleWebflowItemPagination(
  syncConfig: Sync
): Promise<Webflow.CollectionItem[]> {
  try {
    let items: Webflow.CollectionItem[] = [];

    // Helper function to handle pagination recursively
    async function fetchItems(offset = 0) {
      let response = await state.webflowClient?.collections.items.listItems(
        syncConfig.webflow.collection.id,
        { limit: 1, offset: offset }
      );
      items.push(...response.items);

      // Check if there are more items to fetch
      if (response.pagination.total > items.length) {
        await fetchItems(items.length);
      }
    }

    // Start fetching from the first page
    await fetchItems();

    return items;
  } catch (error) {
    ui.prompt.log.error("Error fetching items from Webflow.");
    process.exit(0);
  }
}
