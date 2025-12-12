import type { Field } from 'webflow-api/api'
import type { AirtableField } from '../../../../../core/airtable/types'
import { ui } from '../../../../ui'
import { viewSyncs } from '../../view-syncs'
import { encapsulateObjectForSelect } from '../../../../utils/encapsulate-object-for-select'

/**
 * Prompts user to match a Webflow field with Airtable fields.
 */
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

    // Deep copy of airtableFields
    const airtableFieldsCopy = airtableFields.map((field) => ({
        ...field,
    })) as any

    if (!webflowField.isRequired) {
        // Can't skip required fields
        const skipOption = {
            name: 'Skip',
            message: 'Skip...',
        }
        airtableFieldsCopy.unshift(skipOption) // Ensure to unshift the skipOption, not the fieldsCopy
    }

    let fieldsToSelect = encapsulateObjectForSelect(airtableFieldsCopy)

    const matchedField = (await ui.prompt.select({
        message: message,
        options: fieldsToSelect,
    })) as AirtableField

    if (ui.prompt.isCancel(matchedField)) {
        await viewSyncs()
        process.exit(0)
    }

    if (matchedField.name === 'Skip') return null

    return matchedField
}
