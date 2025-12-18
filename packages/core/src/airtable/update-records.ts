import type { AirtableRecordPayload, AirtableRecordResponse } from './types'

export interface UpdateRecordPayload {
    id: string
    fields: AirtableRecordPayload
}

export interface UpdateRecordsResponse {
    records?: AirtableRecordResponse[]
    error?: {
        type: string
        message: string
    }
}

/**
 * Updates multiple records in Airtable (up to 10 at a time).
 *
 * Uses PATCH to update only the specified fields, leaving others unchanged.
 * Enables typecast to automatically convert values to the correct field type.
 *
 * @param token - Airtable API token
 * @param baseId - The Airtable base ID
 * @param tableId - The table ID
 * @param records - Array of objects with record IDs and field updates (max 10)
 * @returns The updated records response
 * @throws Error if the API request fails or record validation fails
 */
export async function updateRecords(
    token: string,
    baseId: string,
    tableId: string,
    records: UpdateRecordPayload[]
): Promise<UpdateRecordsResponse> {
    if (records.length === 0) {
        return { records: [] }
    }

    if (records.length > 10) {
        throw new Error('Cannot update more than 10 records at a time')
    }

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)

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
                records: records,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            let errorData: any
            try {
                errorData = JSON.parse(errorText)
            } catch {
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                )
            }

            return {
                error: {
                    type: errorData.error?.type || 'UNKNOWN_ERROR',
                    message:
                        errorData.error?.message ||
                        `HTTP error! status: ${response.status}`,
                },
            }
        }

        const recordsResponse: any = await response.json()

        if (recordsResponse.error) {
            return {
                error: {
                    type: recordsResponse.error.type || 'UNKNOWN_ERROR',
                    message:
                        recordsResponse.error.message ||
                        'Unknown error occurred',
                },
            }
        }

        return { records: recordsResponse.records as AirtableRecordResponse[] }
    } catch (error) {
        if (error instanceof Error) {
            return {
                error: {
                    type: 'NETWORK_ERROR',
                    message: error.message,
                },
            }
        }
        throw error
    }
}
