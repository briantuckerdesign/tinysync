import type { AirtableRecord, AirtableRecordResponse } from '../types/airtable'
import { ui } from '../ui'

export async function updateRecord(
    token: string,
    baseId: string,
    tableId: string,
    recordId: string,
    record: AirtableRecord
): Promise<AirtableRecordResponse> {
    const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`
    )
    url.searchParams.append('returnFieldsByFieldId', 'true')
    url.searchParams.append('cellFormat', 'json')
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const recordResponse: any = await response.json()
        if (!recordResponse.id)
            throw new Error('Error updating record in Airtable')
        if (recordResponse.details && recordResponse.details.reasons)
            throw new Error(
                `Error updating record: ${recordResponse.details.message} - ${recordResponse.details.reasons}`
            )

        return recordResponse as AirtableRecordResponse
    } catch (error) {
        ui.prompt.log.error('Error updating record in Airtable')
        throw error
    }
}
