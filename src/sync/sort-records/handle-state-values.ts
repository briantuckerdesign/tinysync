import { ui } from "../../ui";

export function handleStateValues(
  stateFieldValue: any,
  webflowItemIdInAirtable: any,
  usedItemIds: any[],
  webflowItemsToDelete: any[],
  airtableRecord: AirtableRecord,
  idMatchFound: boolean,
  matchErrorMessage: string,
  recordsWithErrors: any[],
  recordsToCreate: any[],
  recordsToUpdate: any[]
) {
  switch (stateFieldValue) {
    /* --------------------------------- Staging -------------------------------- */
    // - Add to Webflow item ID usedItemIds to prevent deletion
    case "Staging":
      if (webflowItemIdInAirtable) usedItemIds.push(webflowItemIdInAirtable);
      break;
    /* ------------------------------- Not synced ------------------------------- */
    // - If item ID found in Webflow, delete in Webflow
    // - If item ID but not found in Webflow, error
    //   (there should be no item ID in Airtable if the item doesn't exist in Webflow)
    // - If no item ID, do nothing
    case "Not synced":
      if (webflowItemIdInAirtable) {
        usedItemIds.push(webflowItemIdInAirtable);
        webflowItemsToDelete.push(airtableRecord);
      } else if (webflowItemIdInAirtable && !idMatchFound) {
        usedItemIds.push(webflowItemIdInAirtable);
        airtableRecord.error = matchErrorMessage;
        recordsWithErrors.push(airtableRecord);
      } else {
        // No webflowId: do nothing
      }
      break;
    /* ----------------------------- Queud for sync ----------------------------- */
    // - If no item ID, create
    // - If item ID but no match, error
    //   (there should be no item ID in Airtable if the item doesn't exist in Webflow)
    // - If item ID found in Webflow, update
    case "Queued for sync":
      if (!webflowItemIdInAirtable) {
        recordsToCreate.push(airtableRecord); // create
      } else if (!idMatchFound) {
        usedItemIds.push(webflowItemIdInAirtable);
        airtableRecord.error = matchErrorMessage;
        recordsWithErrors.push(airtableRecord); // error
      } else {
        usedItemIds.push(webflowItemIdInAirtable);
        recordsToUpdate.push(airtableRecord); // update
      }
      break;
    /* ------------------------------- Always sync ------------------------------ */
    // - If no item ID, create
    // - If item ID but no match, error
    //   (there should be no item ID in Airtable if the item doesn't exist in Webflow)
    // - If item ID found in Webflow, update
    case "Always sync":
      if (!webflowItemIdInAirtable) {
        recordsToCreate.push(airtableRecord); // create
      } else if (!idMatchFound) {
        ui.prompt.log.error("always sync, no match");
        usedItemIds.push(webflowItemIdInAirtable);
        airtableRecord.error = matchErrorMessage;
        recordsWithErrors.push(airtableRecord); // error
      } else {
        usedItemIds.push(webflowItemIdInAirtable);
        recordsToUpdate.push(airtableRecord); // update
      }
      break;
    /* ---------------------------- All other states ---------------------------- */
    // - State field didn't match any of the expected values
    // - So, error
    default:
      if (webflowItemIdInAirtable) usedItemIds.push(webflowItemIdInAirtable);

      airtableRecord.error =
        "State field didn't match any of the expected values.";
      recordsWithErrors.push(airtableRecord); // error
      break;
  }
}
