import axios from "axios";
import { ui } from "../ui";

// TODO: Type record
export async function updateRecords(record, syncConfig: Sync) {
  try {
    const baseId = syncConfig.airtable.base.id;
    const tableId = syncConfig.airtable.table.id;
    const apiToken = syncConfig.airtable.accessToken;
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    };
    const body = {
      returnFieldsByFieldId: true,
      records: record,
    };

    // Docs: https://airtable.com/developers/web/api/update-multiple-records
    const response = await axios.patch(url, body, options);

    return response.data;
  } catch (error) {
    ui.prompt.log.error("Error updating record in Airtable");
    process.exit(0);
  }
}
