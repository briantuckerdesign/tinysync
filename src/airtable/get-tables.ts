import axios from "axios";
import { ui } from "../ui";

export async function getTables(
  apiKey: string,
  baseId: string
): Promise<AirtableTable[]> {
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const options = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };
  try {
    // Docs: https://airtable.com/developers/web/api/get-base-schema
    const response = await axios.get(url, options);

    let tables = response.data.tables;
    tables.forEach((table) => {
      table.label = table.name;
    });

    return tables as AirtableTable[];
  } catch (error) {
    const errorMessage = "Error getting tables.";
    ui.prompt.log.error(errorMessage);
    ui.prompt.log.error(error);
    process.exit(0);
  }
}
