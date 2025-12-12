import type { AirtableRecord } from './types'

export async function getRecord(
    token: string,
    baseId: string,
    tableId: string,
    recordId: string
): Promise<AirtableRecord> {
    const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`
    )
    try {
        url.searchParams.append('returnFieldsByFieldId', 'true')
        url.searchParams.append('cellFormat', 'json')

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const record: any = await response.json()

        if (!record.id) throw new Error('Invalid response from Airtable.')

        return record as AirtableRecord
    } catch (error) {
        throw error
    }
}
