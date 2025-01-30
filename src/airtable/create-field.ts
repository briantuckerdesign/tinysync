import axios from "axios";

export async function createField(
  baseId: string,
  tableId: string,
  apiToken: string,
  field: AirtableField
) {
  try {
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`;
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    };

    // Docs: https://airtable.com/developers/web/api/create-field
    const response = await axios.post(url, field, options);

    const responseData = response.data;

    return responseData;
  } catch (error) {
    ui.prompt.log.error("Error creating field.");
    process.exit(0);
  }
}
