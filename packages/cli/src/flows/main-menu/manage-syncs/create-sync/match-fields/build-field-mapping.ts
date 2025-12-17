import type { Field } from 'webflow-api/api'
import type { AirtableField, SyncField } from '@tinysync/core'
import type { ReferenceConfig } from './select-reference-config'

export function buildFieldMapping(
    airtableField: AirtableField,
    webflowField?: Field,
    referenceConfig?: ReferenceConfig
): SyncField {
    const baseMapping = {
        airtable: {
            name: airtableField.name,
            id: airtableField.id as string,
            type: airtableField.type,
            options: airtableField.options || {},
        },
        specialField: undefined as undefined,
    }

    if (webflowField) {
        const result: SyncField = {
            webflow: {
                slug: webflowField.slug as string,
                name: webflowField.displayName,
                id: webflowField.id,
                type: webflowField.type,
                validations: webflowField.validations || {},
            },
            ...baseMapping,
        }
        if (referenceConfig) {
            result.referenceConfig = referenceConfig
        }
        return result
    } else {
        const result: SyncField = { ...baseMapping }
        if (referenceConfig) {
            result.referenceConfig = referenceConfig
        }
        return result
    }
}
