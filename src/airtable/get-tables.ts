import { ui } from "../ui";

export async function getTables(apiKey: string, baseId: string): Promise<AirtableTable[]> {
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.tables)) throw new Error("Invalid response: tables is not an array");

        const tables: any[] = data.tables;

        tables.forEach((table) => {
            if (!table.name) throw new Error("Invalid table: missing name property");
        });

        return tables as AirtableTable[];
    } catch (error) {
        const errorMessage = "Error getting tables.";
        ui.prompt.log.error(errorMessage);
        ui.prompt.log.error(error);
        process.exit(0);
    }
}
