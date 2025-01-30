import { ui } from "../../../ui";
import { state } from "../../../state";
import { utils } from "../../../utils";
import { selectWebflowKey } from "./select-key";
import { saveWebflowKey } from "./save-key";
import { flows } from "../..";
import { Collection, Site } from "webflow-api/api";
import { handleRequiredFields } from "./required-fields";

/**
 *
 * 1. Ask user for API key and return sites from Webflow
 * 2. Ask user to select a site
 * 3. Get collections for selected site from Webflow
 * 4. Ask user to select a collection
 * 5. Get fields for selected collection from Webflow
 * 6. Return Webflow settings
 *
 */

export async function createWebflowConfig(): Promise<WebflowConfig> {
  try {
    {
      ui.prompt.log.info(ui.format.bold("Webflow"));

      /* ---------------------------------- 1 & 2 --------------------------------- */
      const { apiKey, sites, createdThisSession } = await selectWebflowKey();

      // Ask user if they want to save the API token, save it
      if (createdThisSession) await saveWebflowKey(apiKey);

      /* ------------------------------------ 3 ----------------------------------- */
      // Ask user to select a site
      const site = (await ui.prompt.select({
        message: "Webflow site:",
        options: utils.encapsulateObjectForSelect(sites),
      })) as Site;
      if (ui.prompt.isCancel(site)) {
        await flows.viewSyncs();
        process.exit(0);
      }

      /* ------------------------------------ 4 ----------------------------------- */
      ui.spinner.start("Getting collections...");
      // Return collections for selected site
      const collections = await state.webflowClient?.collections.list(site.id);
      ui.spinner.stop(`✅ ${ui.format.dim("Sites retrieved.")}`);

      /* ------------------------------------ 5 ----------------------------------- */
      // Ask user to select a collection
      const collectionToGet = (await ui.prompt.select({
        message: "Webflow collection:",
        options: utils.encapsulateObjectForSelect(collections?.collections),
      })) as Collection;
      if (ui.prompt.isCancel(collectionToGet)) {
        await flows.viewSyncs();
        process.exit(0);
      }

      /* ------------------------------------ 6 ----------------------------------- */
      // Get collection details, including fields
      const collection = await state.webflowClient?.collections.get(
        collectionToGet.id
      );

      if (!collection) process.exit(0);

      const recordIdField = await handleRequiredFields(base, table, apiKey);

      return {
        apiKey,
        site,
        collection,
        recordIdField,
      };
    }
  } catch (error) {
    ui.prompt.log.error("There was an error configuring Webflow.");
    process.exit(0);
  }
}
