import axios from "axios";
import { ui } from "../ui";

export async function getRecords(syncConfig: Sync): Promise<AirtableRecord[]> {
  try {
    const baseId = syncConfig.airtable.base.id;
    const tableId = syncConfig.airtable.table.id;
    const viewId = syncConfig.airtable.table.view.id;
    const apiToken = syncConfig.airtable.apiToken;
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/listRecords`;
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    };
    let allRecords = [];
    let offset;

    do {
      // Can only retrieve 100 records at a time, so this retrieves in batches.
      const postData = offset
        ? {
            view: viewId,
            offset: offset,
            returnFieldsByFieldId: true,
          }
        : { view: viewId, returnFieldsByFieldId: true };

      // Docs: https://airtable.com/developers/web/api/list-records
      const response = await axios.post(url, postData, options);

      const { records, offset: newOffset } = response.data;

      allRecords = allRecords.concat(records);

      offset = newOffset;
    } while (offset);

    return allRecords;
  } catch (error) {
    ui.prompt.log.error("Error getting records from Airtable");
    process.exit(0);
  }
}
