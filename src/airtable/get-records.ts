import { ui } from '../ui'
import type { AirtableRecord } from '../types/airtable'

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
            // Can only retrieve 100 records at a time, so this retrieves in batches.
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
                throw new Error('Invalid response from Airtable')

            const someRecords: AirtableRecord[] = data.records

            records.push(...someRecords)

            offset = data.offset
        } while (offset)

        return records
    } catch (error) {
        ui.prompt.log.error('Error getting records from Airtable')
        ui.prompt.log.error(error as string)
        process.exit(0)
    }
}
