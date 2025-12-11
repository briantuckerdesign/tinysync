import { AirtableField } from '../types/airtable'
import { ui } from '../ui'

export async function createField(
    token: string,
    baseId: string,
    tableId: string,
    field: AirtableField
): Promise<AirtableField> {
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(field),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const createdField = await response.json()

        if (!createdField.id)
            throw new Error(
                'Invalid response: created field is missing id property'
            )

        return createdField as AirtableField
    } catch (error) {
        ui.prompt.log.error('Error creating field.')
        ui.prompt.log.error(error as string)
        process.exit(0)
    }
}
