import { airtable, type AirtableField } from '@tinysync/core'

export async function getFields(
    token: string,
    baseId: string,
    tableId: string,
    viewId: string
): Promise<AirtableField[]> {
    try {
        const schema = await airtable.get.schema(token, baseId, tableId, viewId)

        return schema.fields
    } catch (error) {
        throw new Error('Error getting Airtable fields.')
    }
}
