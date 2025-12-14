import type { Field } from 'webflow-api/api'
import type { AirtableField } from '../../../../../../core/airtable/types'
import type { SyncField } from '../../../../../../core/types'

export function buildFieldMapping(
    airtableField: AirtableField,
    webflowField?: Field
): SyncField {
    if (webflowField) {
        return {
            webflow: {
                slug: webflowField.slug as string,
                name: webflowField.displayName,
                id: webflowField.id,
                type: webflowField.type,
                validations: webflowField.validations || {},
            },
            airtable: {
                name: airtableField.name,
                id: airtableField.id as string,
                type: airtableField.type,
                options: airtableField.options || {},
            },
            specialField: undefined,
        }
    } else {
        return {
            airtable: {
                name: airtableField.name,
                id: airtableField.id as string,
                type: airtableField.type,
                options: airtableField.options || {},
            },
            specialField: undefined,
        }
    }
}
