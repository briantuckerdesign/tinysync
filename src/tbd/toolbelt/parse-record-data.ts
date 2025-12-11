import { airtable } from '../core/airtable/index'
import { toolbelt } from './index'

/**
 * Parses the data of a record based on the provided configuration.
 */
export async function parseRecordData(
    record: AirtableRecord,
    selectedSync: Sync
) {
    let recordData: any = {}
    let fieldsUsed = []
    // only fields with webflow.type
    const reducedFields = selectedSync.fields.filter(
        (field) => field.webflow.type
    )
    for (const field of reducedFields) {
        switch (field.specialField) {
            // Handle Special Fields
            case 'name':
                recordData.name = record.fields[field.airtable.name]
                fieldsUsed.push(field.airtable.name)
                break
            case 'slug':
                recordData.slug = record.fields[field.airtable.name]
                break
            case 'itemId':
                break
            case 'lastPublished':
                break
            case 'state':
                break
            // Handle Regular Fields
            default:
                await handleFieldBasedOnType(
                    field,
                    record,
                    recordData,
                    selectedSync
                )
                break
        }
    }
    return recordData
}

async function handleFieldBasedOnType(
    field: MatchedField,
    record: AirtableRecord,
    recordData: any,
    selectedSync: Sync
) {
    if (record.fields[field.airtable.name] === undefined) {
        recordData[field.webflow.slug] = ''
        return
    }

    switch (field.webflow.type) {
        // case "Image" || "File" || ("MultiImage" && !record.fields[field.airtableName]):
        //     recordData[field.webflowSlug] = [];
        //     break;
        //

        case 'RichText':
            parseRichText(field, record, recordData)
            break

        case 'Image':
        case 'File':
            parseImageOrFile(field, record, recordData)
            break

        case 'MultiImage':
            parseMultiImage(field, record, recordData, selectedSync)
            break

        case 'Reference': {
            await parseReference(field, record, recordData, selectedSync)
            break
        }
        case 'MultiReference':
            await parseMultiReference(field, record, recordData, selectedSync)
            break

        default:
            recordData[field.webflow.slug] = record.fields[field.airtable.name]
            break
    }

    return recordData
}

/**
 * Parses rich text field and assigns the corresponding value to the recordData object.
 * If the field is undefined in the record, the value will be set to an empty string.
 * @param {object} field - The field object containing airtableName and webflowSlug properties.
 * @param {object} record - The record object.
 * @param {object} recordData - The recordData object to be updated.
 * @returns {void}
 */
function parseRichText(field, record, recordData) {
    if (record.fields[field.airtableName] === undefined) {
        recordData[field.webflowSlug] = ''
        return
    }
    recordData[field.webflowSlug] = toolbelt.markdownToHtml(
        record.fields[field.airtableName]
    )
}

/**
 * Parses the image field of a record and updates the recordData object.
 * @param {Object} field - The field object containing information about the image field.
 * @param {Object} record - The record object containing the data.
 * @param {Object} recordData - The recordData object to be updated.
 * @returns {void}
 */
function parseImageOrFile(field, record, recordData) {
    if (!record.fields[field.airtableName]) {
        recordData[field.webflowSlug] = []
        return
    }
    recordData[field.webflowSlug] = {
        url: record.fields[field.airtableName][0].url,
        alt: '',
    }
}

function parseMultiImage(field, record, recordData, selectedSync) {
    if (!record.fields[field.airtableName]) {
        recordData[field.webflowSlug] = []
        return
    }
    recordData[field.webflowSlug] = record.fields[field.airtableName].map(
        (image) => {
            return {
                url: image.url,
                alt: '',
            }
        }
    )
}

async function parseReference(field, record, recordData, selectedSync, state) {
    const referencedCollectionId = field.validations.collectionId

    // TODO: Move the field finding/saving to config to initial setup
    const config = state.config
    const referencedSync = config.syncs.find(
        (sync) => sync.webflow.collection.id === referencedCollectionId
    )

    if (!referencedSync) {
        ui.prompt.log.error(
            "Couldn't find the referenced field in any of your saved syncs. Add that table/collection to a new sync and try again."
        )
        return
    }
    const referencedTableId = field.options.linkedTableId

    const referencedRecordId = record.fields[field.airtableName][0]

    // TODO: Throughout, move to airtable Ids instead of names
    // TODO: ARG ORDER CHANGED
    const referencedRecord = await airtable.getRecord(
        selectedSync,
        referencedRecordId,
        referencedTableId
    )

    const referencedItemIdField = toolbelt.findSpecial(
        'itemId',
        referencedSync
    ).airtableName

    const referencedItemId = referencedRecord.fields[referencedItemIdField]

    recordData[field.webflowSlug] = referencedItemId
}

async function parseMultiReference(
    field,
    record,
    recordData,
    selectedSync,
    state
) {
    const referencedCollectionId = field.validations.collectionId
    const config = state.config
    const referencedSync = config.syncs.find(
        (sync) => sync.webflow.collection.id === referencedCollectionId
    )
    if (!referencedSync) {
        ui.prompt.log.error(
            "Couldn't find the referenced field in any of your saved syncs. Add that table/collection to a new sync and try again."
        )
        return
    }

    const referencedTableId = field.options.linkedTableId

    // array of strings
    const referencedRecordIds = record.fields[field.airtableName]

    const referencedItemIds = []

    for (const referencedRecordId of referencedRecordIds) {
        // TODO: Throughout, move to airtable Ids instead of names
        // TODO: ARG ORDER CHANGED
        const referencedRecord = await airtable.getRecord(
            selectedSync,
            referencedRecordId,
            referencedTableId
        )
        // TODO: Move the field finding/saving to config to initial setup

        const referencedItemIdField = toolbelt.findSpecial(
            'itemId',
            referencedSync
        ).airtableName

        const referencedItemId = referencedRecord.fields[referencedItemIdField]

        referencedItemIds.push(referencedItemId)
    }
    recordData[field.webflowSlug] = referencedItemIds
}
