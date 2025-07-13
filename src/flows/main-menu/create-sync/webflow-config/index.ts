import { selectWebflowtoken } from "./select-token";
import { saveWebflowToken } from "./save-token";
import { Collection, Site } from "webflow-api/api";
import { handleRequiredFields } from "./required-fields";
import { ui } from "../../../../ui";
import { toolbelt } from "../../../../toolbelt";
import { viewSyncs } from "../../view-syncs";
import { state } from "../../../../state";

/**
 *
 * 1. Ask user for access token and return sites from Webflow
 * 2. Ask user to select a site
 * 3. Get collections for selected site from Webflow
 * 4. Ask user to select a collection
 * 5. Get fields for selected collection from Webflow
 * 6. Return Webflow settings
 *
 */

export async function createWebflowConfig(
  airtableConfig: AirtableConfig
): Promise<WebflowConfig> {
  try {
    {
      ui.prompt.log.info(ui.format.bold("Webflow"));

      /* ---------------------------------- 1 & 2 --------------------------------- */
      const { accessToken, sites, createdThisSession } =
        await selectWebflowtoken();

      // Ask user if they want to save the API token, save it
      if (createdThisSession) await saveWebflowToken(accessToken);

      /* ------------------------------------ 3 ----------------------------------- */
      // Ask user to select a site
      const site = (await ui.prompt.select({
        message: "Webflow site:",
        options: toolbelt.encapsulateObjectForSelect(sites),
      })) as Site;
      if (ui.prompt.isCancel(site)) {
        await viewSyncs();
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
        options: toolbelt.encapsulateObjectForSelect(collections?.collections),
      })) as Collection;
      if (ui.prompt.isCancel(collectionToGet)) {
        await viewSyncs();
        process.exit(0);
      }

      /* ------------------------------------ 6 ----------------------------------- */
      // Get collection details, including fields
      const collection = await state.webflowClient?.collections.get(
        collectionToGet.id
      );

      if (!collection) process.exit(0);
      const recordIdField = await handleRequiredFields(
        airtableConfig.base,
        airtableConfig.table,
        accessToken
      );
      // TODO: Create WEBFLOW field for Airtable record ID

      return {
        accessToken,
        site,
        collection,
        recordIdField,
      };
    }
  } catch (error) {
    console.log(error);
    ui.prompt.log.error("There was an error configuring Webflow.");
    process.exit(0);
  }
}
