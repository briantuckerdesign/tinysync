/* -------------------------------------------------------------------------- */
/*                            Sync / Publish items                            */
/* -------------------------------------------------------------------------- */
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";
import { utils } from "../utils/index.js";

export async function publishItems(records, syncConfig, state) {
  try {
    const recordsToPublish = records.toPublish;
    if (recordsToPublish.length === 0) {
      return;
    }

    const idsFromNewItems = recordsToPublish.map((record) => record.itemId);
    const itemIdField = syncConfig.fields.find(
      (field) => field.specialField === "itemId"
    );
    const idsFromUpdatedItems = recordsToPublish.map(
      (record) => record.fields[itemIdField.airtableName]
    );

    let ids = [...idsFromNewItems, ...idsFromUpdatedItems];

    // Remove falsy values and ensure uniqueness
    ids = Array.from(new Set(ids.filter(Boolean)));

    if (ids.length === 0) {
      return;
    }

    ui.spinner.start("Publishing items...");

    // Publish items to Webflow
    const response = await webflow.publishItems(syncConfig, ids);

    if (response.errors) {
      // If validation error occurred, republish site (if enabled)
      const validationError = response.errors.find((error) =>
        error.includes("ValidationError")
      );
      if (validationError && syncConfig.autoPublish) {
        ui.spinner.stop(
          `❌ ${ui.format.dim(
            "Validation error occurred. Republishing site..."
          )}`
        );
        ui.spinner.start("Publishing site...");
        await webflow.publishSite(syncConfig);
        ui.spinner.stop(`✅ ${ui.format.dim("Site published.")}`);
      } else if (validationError) {
        ui.spinner.stop(
          `🪲 ${ui.format.dim(
            "Validation error occurred.  Republish site to fix."
          )}`
        );
      }
    }

    ui.spinner.stop(`✅ ${ui.format.dim("Webflow items published.")}`);

    ui.spinner.start("Updating records in Airtable...");
    // Update lastPublished field in Airtable
    for (let record of recordsToPublish) {
      let lastPublishedField = utils.findSpecial("lastPublished", syncConfig);

      let recordUpdates = { [lastPublishedField.airtableName]: new Date() };

      recordUpdates = { fields: recordUpdates };

      await airtable.updateRecord(recordUpdates, record.id, syncConfig);
    }
    ui.spinner.stop(`✅ ${ui.format.dim("Airtable records updated.")}`);

    return response.data;
  } catch (error) {
    ui.prompt.log.error("Error publishing items");
    if (error.response.status === 404) {
      ui.prompt.log.error(
        "Try repubishing your site! Item not found to publish."
      );
      return;
    }
    throw error;
  }
}
