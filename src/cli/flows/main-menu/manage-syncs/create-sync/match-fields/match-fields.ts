import type { Field } from 'webflow-api/api'
import { manageSyncs } from '../..'
import type { AirtableField } from '../../../../../../core/airtable/types'
import { ui } from '../../../../../ui'
import { sortFieldsByMatch } from './sort-fields-by-match'

export async function matchField(
    webflowField: Field,
    airtableFields: AirtableField[]
) {
    if (!webflowField.isEditable) return null

    ui.prompt.log.message(
        ui.format.italic(
            `Webflow field: ${webflowField.displayName} matches to:`
        )
    )

    const message = `${ui.format.bold('Airtable')} field:`

    const fieldsToSelect = airtableFields.map((field) => ({
        label: field.name,
        value: field,
    })) as any[]

    // Sort fields to put matching or near matching field names at the beginning
    sortFieldsByMatch(webflowField.displayName, fieldsToSelect)

    if (!webflowField.isRequired) {
        // Can't skip required fields
        const skipOption = {
            label: 'Skip...',
            value: 'skip',
        }
        fieldsToSelect.unshift(skipOption) // Ensure to unshift the skipOption, not the fieldsCopy
    }

    const matchedField = (await ui.prompt.select({
        message: message,
        options: fieldsToSelect,
    })) as AirtableField | string
    await ui.handleCancel(matchedField, manageSyncs)

    if (matchedField === 'skip') return null

    return matchedField as AirtableField
}
