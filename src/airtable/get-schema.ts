import axios from "axios";
import { ui } from "../ui";

export async function getUpdatedSchema(syncConfig: Sync) {
  const apiKey = syncConfig.airtable.apiToken;
  const baseId = syncConfig.airtable.base.id;
  const tableId = syncConfig.airtable.table.id;
  const viewId = syncConfig.airtable.table.view.id;
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const options = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };

  try {
    // Docs: https://airtable.com/developers/web/api/get-base-schema
    const response = await axios.get(url, options);

    const tables = response.data.tables;
    const table = tables.find((table) => {
      return table.id === tableId;
    });
    if (!table) {
      throw new Error("Table not found. It may have been deleted.");
    }

    const views = table.views;
    const view = views.find((view) => {
      return view.id === viewId;
    });
    if (!view) {
      throw new Error("View not found. It may have been deleted.");
    }

    return table;
  } catch (error) {
    ui.prompt.log.error("Error getting Airtable schema:");
    ui.prompt.log.error(error);
    process.exit(0);
  }
}
