import type { AirtableRecord } from './types'

/**
 * Fetches all records from an Airtable table view with automatic pagination.
 *
 * Uses the listRecords endpoint with POST to support field IDs in response.
 * Continues fetching until no more offset is returned.
 *
 * @param token - Airtable API token
 * @param baseId - The Airtable base ID (e.g., 'appXXXXXXXXXXXXXX')
 * @param tableId - The table ID (e.g., 'tblXXXXXXXXXXXXXX')
 * @param viewId - The view ID to filter records (e.g., 'viwXXXXXXXXXXXXXX')
 * @returns Array of all records in the view
 * @throws Error if the API request fails
 */
export async function getRecords(
    token: string,
    baseId: string,
    tableId: string,
    viewId: string
): Promise<AirtableRecord[]> {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/listRecords`
    try {
        const records: AirtableRecord[] = []
        let offset: string | undefined = undefined

        do {
            const postData = offset
                ? {
                      view: viewId,
                      offset: offset,
                      returnFieldsByFieldId: true,
                  }
                : { view: viewId, returnFieldsByFieldId: true }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                )
            }

            const data: any = await response.json()

            if (!data.records || !Array.isArray(data.records))
                throw new Error('Invalid response from Airtable.')

            const someRecords: AirtableRecord[] = data.records

            records.push(...someRecords)

            offset = data.offset
        } while (offset)

        return records
    } catch (error) {
        throw error
    }
}
