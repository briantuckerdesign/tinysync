/* -------------------------------------------------------------------------- */
/*                    Match fields / Store excluded fields                    */
/* -------------------------------------------------------------------------- */

import { buildFieldMapping } from './build-field-mapping'

/**
 * Stores the excluded fields based on the provided Airtable and Webflow settings.
 *
 * Look, I know this is a mess. But here is what it does...
 * - Manually matches the Name/Slug Airtable <> Webflow fields
 * - Manually saves the Airtable-only fields (Last Published, State, Item ID)
 * - Returns an array of field mappings to be added to the other fields
 *
 */
export function storeExcludedFields(
    airtableConfig: AirtableConfig,
    webflowConfig: WebflowConfig
): Array<any> {
    /* --------------------------- Name/primary field --------------------------- */
    const webflowNameField = webflowConfig.collection.fields.find(
        (field) => field.slug === 'name'
    )
    const airtablePrimaryField = airtableConfig.table.fields.find(
        (field) => field.id === airtableConfig.table.primaryFieldId
    )
    if (!airtablePrimaryField || !webflowNameField) process.exit(0)

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
