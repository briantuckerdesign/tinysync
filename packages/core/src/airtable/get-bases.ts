import { filterByPropertyPath } from '../utils/filter-by-property-path'
import type { AirtableBasesResponse, AirtableBasesListItem } from './types'

export async function getBases(
    token: string
): Promise<AirtableBasesListItem[]> {
    const url = 'https://api.airtable.com/v0/meta/bases'
    try {
        const response = await fetch(url, {
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

        const data: any = await response.json()

        if (!Array.isArray(data.bases))
            throw new Error('Invalid response from Airtable.')

        const bases = data as AirtableBasesResponse

        // Filter out bases without create permissions
        const filteredBases = filterByPropertyPath(
            bases.bases,
            'permissionLevel',
            'create'
        )

        return filteredBases
    } catch (error) {
        throw error
    }
}
