/* -------------------------------------------------------------------------- */
/*                                 Sync / Run                                 */
/* -------------------------------------------------------------------------- */
import { airtable } from "../airtable";
import { webflow } from "../webflow";
import { sync } from ".";
import { toolbelt } from "../toolbelt";
import { flows } from "../flows";
import { ui } from "../ui";
import { state } from "../state";
import { checkIfSchemaIsCurrent } from "./schema/check-if-current";
import { WebflowClient } from "webflow-api";
import { handleWebflowItemPagination } from "../webflow/handle-item-pagination";
import { sortRecords } from "./sort-records";
import { writeToJSONFile } from "../toolbelt/write-to-file";

export async function runSync() {
  const syncConfig = state.config.selectedSync;

  try {
    ui.prompt.log.info(ui.format.bold("🌐 Syncing"));

    state.webflowClient = new WebflowClient({
      accessToken: syncConfig.webflow.accessToken,
    });

    // start timer
    const startTime = new Date().getTime();

    // TODO: Rewrite schema checking.
    // 1. Check if schema is current on both ends
    // ui.spinner.start("Validating schemas...");
    // syncConfig = await checkIfSchemaIsCurrent(syncConfig);
    // ui.spinner.stop(`✅ ${ui.format.dim("Schemas validated.")}`);

    // 2. Fetch records from Airtable and Webflow
    // ui.spinner.start("Getting records/items...");
    const [airtableRecords, webflowRecords] = await Promise.all([
      airtable.getRecords(syncConfig),
      handleWebflowItemPagination(syncConfig),
    ]);
    // ui.spinner.stop(`✅ ${ui.format.dim("Records/items retrieved.")}`);
    // 3. Sort records into create, update, and delete arrays
    let records = await sortRecords(
      syncConfig,
      airtableRecords,
      webflowRecords
    );

    writeToJSONFile("./src/dev/config.json", syncConfig);
    writeToJSONFile("./src/dev/airtable-records.json", airtableRecords);
    writeToJSONFile("./src/dev/webflow-records.json", webflowRecords);
    writeToJSONFile("./src/dev/records.json", records);

    // 5. Create new items in Webflow
    await sync.createItems(records, syncConfig);

    // 6. Update items in Webflow
    // await sync.updateItems(records, syncConfig, state);

    // 7. Publish the new and updated items in Webflow
    // await sync.publishItems(records, syncConfig, state);

    // 8. Delete items in that no longer exist in Airtable (optional)
    await sync.deleteItems(records, syncConfig);

    // calculate time elapsed
    const endTime = new Date().getTime();
    const timeElapsed = (endTime - startTime) / 1000;

    ui.prompt.log.success("✅ Sync complete");
    ui.prompt.log.message(`⌛  ${timeElapsed} seconds`);

    if (syncConfig.errors.length === 0) await flows.viewSync();
  } catch (error) {
    ui.prompt.log.error("Error running sync");
    console.log(error);
    process.exit(0);
  }
}
