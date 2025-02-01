import axios from "axios";
import { toolbelt } from "../toolbelt/index";

export async function getBases(
  apiKey: string
): Promise<Array<AirtableBasesListItem>> {
  try {
    // Docs: https://airtable.com/developers/web/api/list-bases
    const url = "https://api.airtable.com/v0/meta/bases";
    const options = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };
    // Gets all bases
    const response = await axios.get(url, options);
    const bases = response.data as AirtableBases;

    // Filter out bases without create permissions
    const filteredBases = toolbelt.filterByPropertyPath(
      bases.bases,
      "permissionLevel",
      "create"
    );

    return filteredBases;
  } catch (error) {
    ui.prompt.log.error("Error getting bases.");
    process.exit(0);
  }
}
