import type { Field } from 'webflow-api/api'
import type { AirtableField } from '../../../../../../core/airtable/types'
import { buildFieldMapping } from './build-field-mapping'
import { getCompatibleAirtableFields } from './get-compatible-airtable-fields'
import { matchField } from './match-fields'

export async function userMatchesFields(
    airtableFields: AirtableField[],
    webflowFields: Field[]
) {
    const fields: SyncField[] = []

    for (const webflowField of webflowFields) {
        // Return compatible Airtable fields
        const compatibleAirtableFields = await getCompatibleAirtableFields(
            webflowField.type,
            airtableFields
        )

        // If there are no compatible fields, skip this field
        if (compatibleAirtableFields.length === 0) continue

        // User selects the Airtable field to match
        const matchedAirtableField = await matchField(
            webflowField,
            compatibleAirtableFields
        )

        if (matchedAirtableField === null) continue

        // Combine the Airtable and Webflow field information
        const field = buildFieldMapping(matchedAirtableField, webflowField)

        // Add the field to the fields array
        fields.push(field)
    }

    return fields
}
