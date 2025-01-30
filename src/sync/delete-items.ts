/* -------------------------------------------------------------------------- */
/*                             Sync / Delete items                            */
/* -------------------------------------------------------------------------- */
import { airtable } from "../airtable/index.js";
import { ui } from "../ui.js";
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";

// Delete items in Webflow that no longer exist in Airtable
export async function deleteItems(records: SyncRecords, syncConfig: Sync) {
  try {
    // Only delete items if config.deleteRecordsNotInAirtable is true
    if (records.toDelete.length === 0 || !syncConfig.deleteRecords) return;

    let itemsToDelete = records.toDelete;

    // let itemIds = itemsToDelete.map((item) => item["id"]);
    let itemIdField = utils.findSpecial("itemId", syncConfig);
    let lastPublishedField = utils.findSpecial("lastPublished", syncConfig);

    ui.spinner.start("Deleting items...");
    const deleteData = [];

    for (let item of itemsToDelete) {
      const data = {
        id: item.fields[itemIdField.airtable.id],
      };
      deleteData.push(data);
      // let recordUpdates = {
      //   [lastPublishedField.airtable.id]: null,
      //   [itemIdField.airtable.id]: "",
      // };

      // recordUpdates = { fields: recordUpdates };

      // await airtable.updateRecord(
      //   recordUpdates,
      //   item.airtableRecordId,
      //   syncConfig
      // );
    }
    await webflow.deleteItems(deleteData, syncConfig);
    ui.spinner.stop(`✅ ${ui.format.dim("Items deleted.")}`);
  } catch (error) {
    ui.prompt.log.error("Error deleting Webflow items");
    if (error.response && error.response.status === 409) {
      ui.prompt.log.error(
        "Item is referenced by another item. Skipping delete."
      );
      return;
    }
    throw error;
  }
}
