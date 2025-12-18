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
    const totalRecords =
        createdItems.length +
        updatedItems.length +
        deletedItems.length +
        failedRecords.length

    if (totalRecords === 0) return

    // Emit progress start with total number of records to update
    emit.progressStart(
        'updating-records',
        `Updating ${totalRecords} Airtable records...`,
        totalRecords
    )

    let processedCount = 0

    try {
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
                [specialFields.slugField.airtable.id]: createdItem.slug,
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

            if (response.error) throw new Error(response.error)

            processedCount++
            emit.progressAdvance(
                'updating-records',
                `Updated ${processedCount}/${totalRecords} records`,
                1
            )
        }

        /* ----------------------------- update records ----------------------------- */
        for (const updatedItem of updatedItems) {
            let stateValue = 'Staging'
            switch (
                updatedItem.record.fields[specialFields.stateField.airtable.id]
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
                [specialFields.slugField.airtable.id]: updatedItem.slug,
                [specialFields.stateField.airtable.id]: stateValue,
                [specialFields.errorsField.airtable.id]: '',
            }

            const response = await airtable.update.record(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                updatedItem.record.id,
                payload
            )

            if (response.error) throw new Error(response.error)

            processedCount++
            emit.progressAdvance(
                'updating-records',
                `Updated ${processedCount}/${totalRecords} records`,
                1
            )
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

            if (response.error) throw new Error(response.error)

            processedCount++
            emit.progressAdvance(
                'updating-records',
                `Updated ${processedCount}/${totalRecords} records`,
                1
            )
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

                processedCount++
                emit.progressAdvance(
                    'updating-records',
                    `Updated ${processedCount}/${totalRecords} records`,
                    1
                )
            } catch (error) {
                throw error
            }
        }

        emit.progressEnd(
            'updating-records',
            `Updated ${processedCount} Airtable records`
        )
    } catch (error) {
        emit.progressEnd(
            'updating-records',
            `Updated ${processedCount}/${totalRecords} records (failed)`
        )
        emit.error(new Error(`Failed to update Airtable records`), false)
    }
}
