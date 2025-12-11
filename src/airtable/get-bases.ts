import { toolbelt } from "../toolbelt/index";
import { AirtableBasesResponse, AirtableBasesListItem } from "../types/airtable";
import { ui } from "../ui";

export async function getBases(token: string): Promise<AirtableBasesListItem[]> {
    const url = "https://api.airtable.com/v0/meta/bases";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.bases)) throw new Error("Invalid response: bases is not an array");

        const bases = data as AirtableBasesResponse;

        // Filter out bases without create permissions
        const filteredBases = toolbelt.filterByPropertyPath(bases.bases, "permissionLevel", "create");

        return filteredBases;
    } catch (error) {
        ui.prompt.log.error("Error getting bases.");
        ui.prompt.log.error(error as string);
        process.exit(0);
    }
}
