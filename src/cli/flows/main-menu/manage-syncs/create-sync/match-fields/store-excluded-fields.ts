import type { AirtableConfig, WebflowConfig } from '../../../../../types'
import { buildFieldMapping } from './build-field-mapping'

export function storeExcludedFields(
    airtableConfig: AirtableConfig,
    webflowConfig: WebflowConfig
): SyncField[] {
    /* --------------------------- Name field --------------------------- */
    const webflowNameField = webflowConfig.collection.fields.find(
        (field) => field.slug === 'name'
    )
    if (!webflowNameField) throw new Error('Webflow name field not found')

    const airtablePrimaryField = airtableConfig.table.fields.find(
        (field) => field.id === airtableConfig.table.primaryFieldId
    )
    if (!airtablePrimaryField)
        throw new Error('Airtable primary field not found')

    const nameField = buildFieldMapping(airtablePrimaryField, webflowNameField)
    // This flag is used throughout the application
    nameField.specialField = 'name'

    /* ---------------------------------- Slug ---------------------------------- */
    const webflowSlugField = webflowConfig.collection.fields.find(
        (field) => field.slug === 'slug'
    )
    const slugField = buildFieldMapping(
        airtableConfig.slugField,
        webflowSlugField
    )
    // This flag is used throughout the application
    slugField.specialField = 'slug'

    /* ----------------------------- Last published ----------------------------- */
    const lastPublishedField = buildFieldMapping(
        airtableConfig.lastPublishedField
    )
    // This flag is used throughout the application
    lastPublishedField.specialField = 'lastPublished'

    /* ---------------------------------- State --------------------------------- */
    const stateField = buildFieldMapping(airtableConfig.stateField)
    // This flag is used throughout the application
    stateField.specialField = 'state'

    /* ---------------------------------- Item ID ------------------------------- */
    const itemIdField = buildFieldMapping(airtableConfig.webflowItemIdField)
    itemIdField.specialField = 'itemId'

    return [nameField, slugField, lastPublishedField, stateField, itemIdField]
}
