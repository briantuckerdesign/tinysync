import { airtable } from '../airtable'
import type { UpdateRecordPayload } from '../airtable/update-records'
import type { RecordWithErrors, Sync } from '../types'
import { findAllSpecialFields } from '../utils/find-special-field'
import type { CreatedItem } from './create-items'
import type { DeletedItem } from './delete-items'
import type { SyncEmit } from './emitter'
import type { UpdatedItem } from './update-items'

const batchSize = 10

interface RecordUpdate {
    recordId: string
    payload: UpdateRecordPayload
    sourceType: 'created' | 'updated' | 'deleted' | 'failed'
    sourceRecord: CreatedItem | UpdatedItem | DeletedItem | RecordWithErrors
}

export async function updateRecords(
    sync: Sync,
    createdItems: CreatedItem[],
    updatedItems: UpdatedItem[],
    deletedItems: DeletedItem[],
    failedRecords: RecordWithErrors[],
    airtableToken: string,
    emit: SyncEmit
) {
    const specialFields = findAllSpecialFields(sync)

    // Build all record updates upfront
    const allUpdates: RecordUpdate[] = []

    // Created items
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
        allUpdates.push({
            recordId: createdItem.record.id,
            payload: {
                id: createdItem.record.id,
                fields: {
                    [specialFields.itemIdField.airtable.id]: createdItem.itemId,
                    [specialFields.lastPublishedField.airtable.id]:
                        new Date().toISOString(),
                    [specialFields.slugField.airtable.id]: createdItem.slug,
                    [specialFields.stateField.airtable.id]: stateValue,
                    [specialFields.errorsField.airtable.id]: '',
                },
            },
            sourceType: 'created',
            sourceRecord: createdItem,
        })
    }

    // Updated items
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
        allUpdates.push({
            recordId: updatedItem.record.id,
            payload: {
                id: updatedItem.record.id,
                fields: {
                    [specialFields.lastPublishedField.airtable.id]:
                        new Date().toISOString(),
                    [specialFields.slugField.airtable.id]: updatedItem.slug,
                    [specialFields.stateField.airtable.id]: stateValue,
                    [specialFields.errorsField.airtable.id]: '',
                },
            },
            sourceType: 'updated',
            sourceRecord: updatedItem,
        })
    }

    // Deleted items
    for (const deletedItem of deletedItems) {
        allUpdates.push({
            recordId: deletedItem.record.id,
            payload: {
                id: deletedItem.record.id,
                fields: {
                    [specialFields.lastPublishedField.airtable.id]: '',
                    [specialFields.slugField.airtable.id]: '',
                    [specialFields.itemIdField.airtable.id]: '',
                    [specialFields.errorsField.airtable.id]: '',
                },
            },
            sourceType: 'deleted',
            sourceRecord: deletedItem,
        })
    }

    // Failed records
    for (const failedRecord of failedRecords) {
        const errorsAsString = failedRecord.errors.join(', ')
        allUpdates.push({
            recordId: failedRecord.record.id,
            payload: {
                id: failedRecord.record.id,
                fields: {
                    [specialFields.errorsField.airtable.id]: errorsAsString,
                },
            },
            sourceType: 'failed',
            sourceRecord: failedRecord,
        })
    }

    const totalRecords = allUpdates.length
    if (totalRecords === 0) return

    // Emit progress start with total number of records to update
    emit.progressStart(
        'updating-records',
        `Updating ${totalRecords} Airtable records...`,
        totalRecords
    )

    let processedCount = 0
    const failedUpdates: RecordUpdate[] = []

    // Process in batches of 10
    for (let offset = 0; offset < allUpdates.length; offset += batchSize) {
        const batch = allUpdates.slice(offset, offset + batchSize)

        try {
            await processBatch(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                batch
            )
            processedCount += batch.length
            emit.progressAdvance(
                'updating-records',
                `Updated ${processedCount}/${totalRecords} records`,
                batch.length
            )
        } catch (error) {
            // Batch failed, add to retry list
            failedUpdates.push(...batch)
        }
    }

    // Retry failed updates individually to find the culprit
    if (failedUpdates.length > 0) {
        for (const update of failedUpdates) {
            try {
                await processBatch(
                    airtableToken,
                    sync.config.airtable.base.id,
                    sync.config.airtable.table.id,
                    [update]
                )
                processedCount++
                emit.progressAdvance(
                    'updating-records',
                    `Updated ${processedCount}/${totalRecords} records`,
                    1
                )
            } catch (error) {
                // Individual record failed - log it but continue
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error'
                emit.error(
                    new Error(
                        `Failed to update record ${update.recordId}: ${errorMessage}`
                    ),
                    false
                )
                // Still advance progress for failed items
                emit.progressAdvance(
                    'updating-records',
                    `Updated ${processedCount}/${totalRecords} records (1 failed)`,
                    1
                )
            }
        }
    }

    emit.progressEnd(
        'updating-records',
        `Updated ${processedCount} Airtable records`
    )
}

async function processBatch(
    token: string,
    baseId: string,
    tableId: string,
    batch: RecordUpdate[]
): Promise<void> {
    const payloads = batch.map((update) => update.payload)

    const response = await airtable.update.records(
        token,
        baseId,
        tableId,
        payloads
    )

    if (response.error) {
        throw new Error(response.error.message)
    }
}
