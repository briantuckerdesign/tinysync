import { airtable } from '../airtable'
import type { RecordWithErrors, Sync } from '../types'
import { findAllSpecialFields } from '../utils/find-special-field'
import type { CreatedItem } from './create-items'
import type { DeletedItem } from './delete-items'
import type { SyncEmit } from './emitter'
import type { UpdatedItem } from './update-items'

export async function updateRecords(
    sync: Sync,
    createdItems: CreatedItem[],
    updatedItems: UpdatedItem[],
    deletedItems: DeletedItem[],
    failedRecords: RecordWithErrors[],
    airtableToken: string,
    emit: SyncEmit
) {
    emit.progress(
        'updateRecords',
        'Updating Airtable records with sync results...'
    )

    const specialFields = findAllSpecialFields(sync)
    /* ------------------------------ create items ------------------------------ */
    for (const createdItem of createdItems) {
        let stateValue = 'Staging'
        switch (
            createdItem.record.fields[specialFields.stateField.airtable.id]
        ) {
            case 'Always sync':
                stateValue = 'Always sync'
                break
            case 'Queued for sync':
                stateValue = 'Staging'
                break
        }
        const payload = {
            [specialFields.itemIdField.airtable.id]: createdItem.itemId,
            [specialFields.lastPublishedField.airtable.id]:
                new Date().toISOString(),
            [specialFields.slugField.airtable.id]:
                createdItem.collectionItem.fieldData.slug,
            [specialFields.stateField.airtable.id]: stateValue,
            [specialFields.errorsField.airtable.id]: '',
        }

        const response = await airtable.update.record(
            airtableToken,
            sync.config.airtable.base.id,
            sync.config.airtable.table.id,
            createdItem.record.id,
            payload
        )

        if (response.error)
            console.error('Error updating record:', response.error)
    }

    /* ----------------------------- update records ----------------------------- */
    for (const createdItem of updatedItems) {
        let stateValue = 'Staging'
        switch (
            createdItem.record.fields[specialFields.stateField.airtable.id]
        ) {
            case 'Always sync':
                stateValue = 'Always sync'
                break
            case 'Queued for sync':
                stateValue = 'Staging'
                break
        }
        const payload = {
            [specialFields.lastPublishedField.airtable.id]:
                new Date().toISOString(),
            [specialFields.slugField.airtable.id]:
                createdItem.collectionItem.fieldData.slug,
            [specialFields.stateField.airtable.id]: stateValue,
            [specialFields.errorsField.airtable.id]: '',
        }

        const response = await airtable.update.record(
            airtableToken,
            sync.config.airtable.base.id,
            sync.config.airtable.table.id,
            createdItem.record.id,
            payload
        )

        if (response.error)
            console.error('Error updating record:', response.error)
    }

    /* ----------------------------- delete records ----------------------------- */
    for (const deletedItem of deletedItems) {
        const payload = {
            [specialFields.lastPublishedField.airtable.id]: '',
            [specialFields.slugField.airtable.id]: '',
            [specialFields.itemIdField.airtable.id]: '',
            [specialFields.errorsField.airtable.id]: '',
        }

        const response = await airtable.update.record(
            airtableToken,
            sync.config.airtable.base.id,
            sync.config.airtable.table.id,
            deletedItem.record.id,
            payload
        )

        if (response.error)
            console.error('Error updating record:', response.error)
    }

    /* ----------------------------- failed records ----------------------------- */
    for (const failedRecord of failedRecords) {
        //convert error array to CSV string
        const errorsAsString = failedRecord.errors.join(', ')
        const payload = {
            [specialFields.errorsField.airtable.id]: errorsAsString,
        }

        try {
            await airtable.update.record(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                failedRecord.record.id,
                payload
            )
        } catch (error) {
            console.error('Error updating record:', error)
        }
    }
}
