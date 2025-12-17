import type { Field } from 'webflow-api/api'
import type { AirtableField, SyncField } from '@tinysync/core'
import { buildFieldMapping } from './build-field-mapping'
import { getCompatibleAirtableFields } from './get-compatible-airtable-fields'
import { matchField } from './match-fields'
import {
    selectReferenceConfig,
    type ReferenceConfig,
} from './select-reference-config'

/** Context needed for reference field configuration */
export interface FieldMatchContext {
    /** Airtable API token */
    token: string
    /** Airtable base ID */
    baseId: string
}

export async function userMatchesFields(
    airtableFields: AirtableField[],
    webflowFields: Field[],
    context: FieldMatchContext
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

        // For Reference and MultiReference fields, prompt for linked table config
        let referenceConfig: ReferenceConfig | undefined = undefined
        if (
            webflowField.type === 'Reference' ||
            webflowField.type === 'MultiReference'
        ) {
            const refConfig = await selectReferenceConfig(
                matchedAirtableField,
                webflowField,
                context.token,
                context.baseId
            )
            // If user skipped reference config, skip this field entirely
            if (refConfig === null) continue
            referenceConfig = refConfig
        }

        // Combine the Airtable and Webflow field information
        const field = buildFieldMapping(
            matchedAirtableField,
            webflowField,
            referenceConfig
        )

        // Add the field to the fields array
        fields.push(field)
    }

    return fields
}
