import type { AirtableRecordPayload, AirtableRecordResponse } from './types'

export async function updateRecord(
    token: string,
    baseId: string,
    tableId: string,
    recordId: string,
    record: AirtableRecordPayload
): Promise<AirtableRecordResponse> {
    const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`
    )
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                returnFieldsByFieldId: true,
                typecast: true,
                fields: record,
            }),
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
        throw error
    }
}
