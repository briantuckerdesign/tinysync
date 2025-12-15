import { airtable } from '../airtable'
import type { RecordWithErrors, Sync } from '../types'
import { findAllSpecialFields } from '../utils/find-special-field'
import type { CreatedItem } from './create-items'

export async function updateRecords(
    sync: Sync,
    createdItems: CreatedItem[],
    failedCreateRecords: RecordWithErrors[],
    airtableToken: string
) {
    const specialFields = findAllSpecialFields(sync)

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

        console.log('Updated record:', createdItem.record.id)
    }

    for (const failedRecord of failedCreateRecords) {
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
