import { flows } from "../..";
import { toolbelt } from "../../../toolbelt";
import { selectAirtableToken } from "./select-token";
import { airtable } from "../../../airtable";
import { saveAirtableToken } from "./save-token";
import { handleRequiredFields } from "./required-fields";
import { ui } from "../../../ui";

/**
 * This function...
 *
 * 1. Asks user to select an access token
 * 2. Uses the access token to get a list of bases
 * 3. Asks user to select a base
 * 4. Uses the base to get a list of tables/viwews
 * 5. Asks user to select a table
 * 6. Asks user to select a view
 * 7. Select or create required fields
 * 8. Return Airtable settings
 */
export async function createAirtableConfig(): Promise<AirtableConfig> {
  try {
    ui.prompt.log.info(ui.format.bold("Airtable"));

    /* ---------------------------------- 1 & 2 --------------------------------- */
    const { accessToken, bases, createdThisSession } =
      await selectAirtableToken();

    // Ask user if they want to save the API token, save it
    if (createdThisSession) await saveAirtableToken(accessToken);

    /* ------------------------------------ 3 ----------------------------------- */
    // Ask user to select a base
    const base = (await ui.prompt.select({
      message: "Airtable base:",
      options: toolbelt.encapsulateObjectForSelect(bases),
    })) as AirtableBasesListItem;
    if (ui.prompt.isCancel(base)) {
      await flows.viewSyncs();
      process.exit(0);
    }

    /* ------------------------------------ 4 ----------------------------------- */
    ui.spinner.start("Getting tables...");
    // Return tables for selected base
    const tables = await airtable.getTables(accessToken, base.id);
    ui.spinner.stop(`✅ ${ui.format.dim("Tables retrieved.")}`);

    /* ------------------------------------ 5 ----------------------------------- */
    // Ask user to select a table
    const table = (await ui.prompt.select({
      message: "Airtable table:",
      options: toolbelt.encapsulateObjectForSelect(tables),
    })) as AirtableTable;
    if (ui.prompt.isCancel(table)) {
      await flows.viewSyncs();
      process.exit(0);
    }

    /* ------------------------------------ 6 ----------------------------------- */
    // Ask user to select a view
    const view = (await ui.prompt.select({
      message: "Airtable view:",
      options: toolbelt.encapsulateObjectForSelect(table.views),
    })) as AirtableView;
    if (ui.prompt.isCancel(view)) {
      await flows.viewSyncs();
      process.exit(0);
    }

    /* ------------------------------------ 7 ----------------------------------- */
    const { stateField, slugField, webflowItemIdField, lastPublishedField } =
      await handleRequiredFields(base, table, accessToken);

    /* ------------------------------------ 8 ----------------------------------- */
    return {
      accessToken,
      base,
      table,
      view,
      stateField,
      slugField,
      webflowItemIdField,
      lastPublishedField,
    };
  } catch (error) {
    ui.prompt.log.error("Error setting up Airtable sync.");
    console.log(error);
    process.exit(0);
  }
}
