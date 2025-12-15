import type { SyncField, SpecialField } from '../../../../../../core/types'
import type { AirtableConfig, WebflowConfig } from '../../../../../types'
import { buildFieldMapping } from './build-field-mapping'

function createSpecialField(
    specialFieldName: SpecialField,
    ...args: Parameters<typeof buildFieldMapping>
): SyncField {
    const field = buildFieldMapping(...args)
    field.specialField = specialFieldName
    return field
}

export function storeExcludedFields(
    airtableConfig: AirtableConfig,
    webflowConfig: WebflowConfig
): SyncField[] {
    const webflowNameField = webflowConfig.collection.fields.find(
        (field) => field.slug === 'name'
    )
    if (!webflowNameField) throw new Error('Webflow name field not found')

    const airtablePrimaryField = airtableConfig.table.fields.find(
        (field) => field.id === airtableConfig.table.primaryFieldId
    )
    if (!airtablePrimaryField)
        throw new Error('Airtable primary field not found')

    const webflowSlugField = webflowConfig.collection.fields.find(
        (field) => field.slug === 'slug'
    )

    return [
        createSpecialField('name', airtablePrimaryField, webflowNameField),
        createSpecialField('slug', airtableConfig.slugField, webflowSlugField),
        createSpecialField('lastPublished', airtableConfig.lastPublishedField),
        createSpecialField('state', airtableConfig.stateField),
        createSpecialField('itemId', airtableConfig.webflowItemIdField),
        createSpecialField('errors', airtableConfig.errorsField),
    ]
}
