import axios from "axios";
import { ui } from "../ui";

// TODO: Type record
export async function updateRecord(record, recordId: string, syncConfig: Sync) {
  try {
    const baseId = syncConfig.airtable.base.id;
    const tableId = syncConfig.airtable.table.id;
    const apiToken = syncConfig.airtable.apiToken;
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    };

    // Docs: https://airtable.com/developers/web/api/update-record
    const response = await axios.patch(url, record, options);

    return response.data;
  } catch (error) {
    ui.prompt.log.error("Error updating record in Airtable");
    process.exit(0);
  }
}
