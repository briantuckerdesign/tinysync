import type { Field } from 'webflow-api/api'
import { manageSyncs } from '../..'
import type { AirtableField, SyncField } from '@tinysync/core'
import type { AirtableConfig, WebflowConfig } from '../../../../../types'
import { ui } from '../../../../../ui'
import { storeExcludedFields } from './store-excluded-fields'
import { userMatchesFields } from './user-matches-fields'

export async function matchFields(
    airtableConfig: AirtableConfig,
    webflowConfig: WebflowConfig
): Promise<SyncField[]> {
    try {
        ui.prompt.log.info(ui.format.bold('Field matching'))
        ui.prompt.log.message('Match Airtable → Webflow fields')

        let matchedFields: SyncField[] = []

        // Airtable fields to match
        // Excluding: Primary Field, Slug, Last Published, State, Item ID
        const airtableFields = removeFieldsById(airtableConfig.table.fields, [
            airtableConfig.table.primaryFieldId as string,
            airtableConfig.stateField.id as string,
            airtableConfig.slugField.id as string,
            airtableConfig.webflowItemIdField.id as string,
            airtableConfig.lastPublishedField.id as string,
            airtableConfig.errorsField.id as string,
        ]) as AirtableField[]

        // Webflow fields to match
        // Excluding: Name and Slug
        const webflowFields = webflowConfig.collection.fields.filter(
            (field) => field.slug !== 'slug' && field.slug !== 'name'
        ) as Field[]

        // Store the excluded fields
        const specialFields = storeExcludedFields(airtableConfig, webflowConfig)
        matchedFields.push(...specialFields)

        // Match the remaining fields
        const userMatchedFields = await userMatchesFields(
            airtableFields,
            webflowFields
        )
        matchedFields.push(...userMatchedFields)

        return matchedFields.filter((field) => field !== null) as SyncField[]
    } catch (error) {
        ui.prompt.log.error('Error matching fields.')
        await manageSyncs()
        process.exit(0)
    }
}

/**
 * Removes fields based on the provided field IDs.
 */
function removeFieldsById(fields: any[], ids: string[]) {
    return fields.filter((field) => !ids.includes(field.id))
}
