/* -------------------------------------------------------------------------- */
/*                             Sync / Create items                            */
/* -------------------------------------------------------------------------- */
import { utils } from "../utils/index";
import { webflow } from "../webflow/index";
import { airtable } from "../airtable/index";
import { ui } from "../ui";
import { parseAirtableRecord } from "./parse";

export async function createItems(records: SyncRecords, syncConfig: Sync) {
  records.toUpdateInAirtable = [];

  if (records.toCreate.length === 0) return;

  ui.spinner.start("Creating items...");

  // Process records in batches of 10
  const batchSize = 10;
  for (let i = 0; i < records.toCreate.length; i += batchSize) {
    const itemsToCreate = [];
    const recordsToUpdate = [];
    const end = Math.min(i + batchSize, records.toCreate.length);
    for (let j = i; j < end; j++) {
      const record = records.toCreate[j];
      // Parse data from Airtable to Webflow format
      const parsedData = await parseAirtableRecord(record, syncConfig);
      itemsToCreate.push(parsedData);
      recordsToUpdate.push({
        id: record.id,
        fields: {},
      });
      // Add to publishing queue
      records.toPublish.push(record);
    }

    const response = await webflow.createItems(itemsToCreate, syncConfig);
    // const airtableResponse = await airtable.updateRecords();
    console.log("📣 - createItems - response:", response);

    const format = {
      id: "record id",
      fields: {
        "field id": "field value",
      },
    };
  }

  ui.spinner.stop(`✅ ${ui.format.dim("Webflow items created.")}`);
}

// export async function createItems(records: SyncRecords, syncConfig: Sync) {
//   records.toUpdateInAirtable = [];

//   if (records.toCreate.length === 0) return;

//   ui.spinner.start("Creating items...");
//   // TODO: 10 item pagination
//   let itemsToCreate = [];

//   for (const record of records.toCreate) {
//     // Parse data from Airtable to Webflow format
//     const parsedData = await parseAirtableRecord(record, syncConfig);

//     itemsToCreate.push(parsedData);

//     // Add to publishing queue
//     records.toPublish.push(record);
//   }

//   const response = await webflow.createItems(itemsToCreate, syncConfig);

//   ui.spinner.stop(`✅ ${ui.format.dim("Webflow items created.")}`);
// }

async function updateAirtableRecord(record, response, syncConfig: Sync) {
  // Get value of slug field from Webflow response
  const webflowSlug = response.fieldData.slug;
  // Find field in config where specialField = "Slug"
  const recordSlugField = utils.findSpecial("slug", syncConfig);
  // const recordSlugField = syncConfig.fields.find((field) => field.specialField === "slug");
  // Get value of slug field from Airtable record
  const recordSlug = record.fields[recordSlugField.airtableName];

  // Get value of itemId field from Webflow response
  const webflowItemId = response.id;

  // Find field in config where specialField = "itemId"
  // const recordItemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");
  const recordItemIdField = utils.findSpecial("itemId", syncConfig);
  // Write webflowItemId to record at top level
  record.itemId = response.id;

  // Find field in config where specialField = "State"
  const recordStateField = syncConfig.fields.find(
    (field) => field.specialField === "state"
  );
  const recordState = record.fields[recordStateField.airtableName];

  let updateId, updateSlug, updateState, removeId, updatePublishDate;

  switch (recordState) {
    case "Always sync":
    case "Staging":
      updateId = true;
      updateSlug = true;
      break;
    case "Not synced":
      removeId = true;
      break;
    case "Queued for sync":
      updateId = true;
      updateSlug = true;
      updateState = true;
      break;
  }

  let recordUpdates = {};

  if (updateId) {
    const idUpdate = { [recordItemIdField.airtableName]: webflowItemId };
    recordUpdates = { ...recordUpdates, ...idUpdate };
  }
  if (updateSlug && webflowSlug !== recordSlug) {
    const slugUpdate = { [recordSlugField.airtableName]: webflowSlug };
    recordUpdates = { ...recordUpdates, ...slugUpdate };
  }
  if (updateState) {
    const stateUpdate = { [recordStateField.airtableName]: "Staging" };
    recordUpdates = { ...recordUpdates, ...stateUpdate };
  }

  recordUpdates = { fields: recordUpdates };

  await airtable.updateRecord(recordUpdates, record.id, syncConfig);
}
