import { WebflowClient } from "webflow-api";
import { airtable } from "../../airtable";
import { configTools } from "../../config-tools";
import { state } from "../../state";
import { compareSchemas } from "./compare";
import { ui } from "../../ui";

export async function checkIfSchemaIsCurrent(syncConfig: Sync) {
  // Saves updated schema to config.newSchema
  try {
    const updatedAirtableSchema = await airtable.getSchema(syncConfig);
    state.webflowClient = new WebflowClient({
      accessToken: syncConfig.webflow.apiKey,
    });
    const updatedWebflowSchema = await state.webflowClient?.collections.get(
      syncConfig.webflow.collection.id
    );

    // Compare the new schema to the existing schema
    await compareSchemas(syncConfig, updatedAirtableSchema, "airtable");
    await compareSchemas(syncConfig, updatedWebflowSchema, "webflow");

    {
      const config = state.config;
      // Find the index of the sync to be updated
      const syncIndex = config.syncs.findIndex(
        (sync) => sync.id === syncConfig.id
      );
      // Overwrite the sync with the updated sync
      config.syncs[syncIndex] = syncConfig;
      // Save the config
      configTools.save();
    }

    return syncConfig;
  } catch (error) {
    ui.prompt.log.error("Error checking schema");
    process.exit(0);
  }
}
