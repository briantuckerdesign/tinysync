import { airtable, type AirtableField } from '@tinysync/core'
import { ui } from '../../../../../ui'
import { manageSyncs } from '../..'
import type { Field } from 'webflow-api/api'

export interface ReferenceConfig {
    linkedTableId: string
    linkedItemIdFieldId: string
    linkedItemIdFieldName: string
}

/**
 * For Reference and MultiReference fields, prompts the user to select
 * which field in the linked Airtable table contains the Webflow item ID.
 */
export async function selectReferenceConfig(
    airtableField: AirtableField,
    _webflowField: Field,
    token: string,
    baseId: string
): Promise<ReferenceConfig | null> {
    try {
        // Get the linked table ID from airtable field options
        const linkedTableId = airtableField.options?.linkedTableId
        if (!linkedTableId) {
            ui.prompt.log.warn(
                `Could not find linked table for field "${airtableField.name}". Skipping reference config.`
            )
            return null
        }

        // Fetch all tables to get the linked table's fields
        const tables = await airtable.get.tables(token, baseId)
        const linkedTable = tables.find((t) => t.id === linkedTableId)

        if (!linkedTable) {
            ui.prompt.log.warn(
                `Could not find linked table "${linkedTableId}". Skipping reference config.`
            )
            return null
        }

        ui.prompt.log.message(
            ui.format.italic(
                `This field links to the "${ui.format.bold(linkedTable.name)}" table.`
            )
        )
        ui.prompt.log.message(
            ui.format.dim(
                `Select the field that stores Webflow Item IDs in that table.`
            )
        )

        // Filter to only show text fields (item IDs are stored as text)
        const textFields = linkedTable.fields.filter(
            (f) =>
                f.type === 'singleLineText' ||
                f.type === 'formula' ||
                f.type === 'rollup'
        )

        if (textFields.length === 0) {
            ui.prompt.log.warn(
                `No text fields found in linked table "${linkedTable.name}". ` +
                    `You may need to create the sync for that table first.`
            )
            return null
        }

        const fieldOptions: Array<{
            label: string
            value: AirtableField | 'skip'
            hint?: string
        }> = textFields.map((field) => ({
            label: field.name,
            value: field,
            hint: field.type,
        }))

        // Add skip option
        fieldOptions.unshift({
            label: 'Skip (do not sync this reference)',
            value: 'skip',
        })

        const selectedField = (await ui.prompt.select({
            message: `Which field in "${linkedTable.name}" contains the Webflow Item ID?`,
            options: fieldOptions,
        })) as AirtableField | 'skip'

        await ui.handleCancel(selectedField, manageSyncs)

        if (selectedField === 'skip') {
            return null
        }

        return {
            linkedTableId,
            linkedItemIdFieldId: selectedField.id as string,
            linkedItemIdFieldName: selectedField.name,
        }
    } catch (error) {
        ui.prompt.log.error('Error configuring reference field.')
        return null
    }
}
