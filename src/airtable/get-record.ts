import axios from "axios";
import { ui } from "../ui";

export async function getRecord(
  syncConfig: Sync,
  recordId: string,
  tableId = syncConfig.airtable.table.id,
  baseId = syncConfig.airtable.base.id
) {
  try {
    const apiToken = syncConfig.airtable.apiToken;
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      params: {
        returnFieldsByFieldId: true,
      },
    };

    // Docs: https://airtable.com/developers/web/api/get-record
    const response = await axios.get(url, options);

    return response.data;
  } catch (error) {
    ui.prompt.log.error("Error getting record from Airtable");
    process.exit(0);
  }
}
