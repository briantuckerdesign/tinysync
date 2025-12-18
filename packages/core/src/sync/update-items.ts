import type { WebflowClient } from 'webflow-api'
import type { CollectionItemList } from 'webflow-api/api'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, Sync } from '../types'
import {
    parseAirtableRecords,
    type ParsedRecord,
    type ReferenceContext,
} from './parse-data'
import { findSpecialField } from '../utils/find-special-field'
import type { SyncEmit } from './emitter'
import {
    matchResponseToRecord,
    type MatchedItem,
} from './match-response-to-record'

export interface UpdatedItem extends MatchedItem {}

const batchSize = 100
const smallBatchSize = 10

/**
 * Updates existing Webflow items from Airtable records.
 *
 * Uses the same batch-retry strategy as createItems.
 * Requires records to have a valid Webflow item ID in the itemId field.
 *
 * @param sync - The sync configuration
 * @param updateWebflowItems - Airtable records with existing Webflow item IDs
 * @param webflowClient - Initialized Webflow API client
 * @param emit - Event emitter for progress/errors
 * @param referenceContext - Context for resolving Reference fields
 * @returns Updated items and failed records with error details
 */
export async function updateItems(
    sync: Sync,
    updateWebflowItems: AirtableRecord[],
    webflowClient: WebflowClient,
    emit: SyncEmit,
    referenceContext?: ReferenceContext
) {
    const updatedItems: UpdatedItem[] = []
    const failedUpdateRecords: RecordWithErrors[] = []

    const numberOfItems = updateWebflowItems.length
    if (numberOfItems === 0) return { updatedItems, failedUpdateRecords }

    // Emit progress start with total number of items
    emit.progressStart(
        'updating-items',
        `Updating ${numberOfItems} items...`,
        numberOfItems
    )

    // Get the itemId field to extract existing Webflow item IDs
    const itemIdField = findSpecialField('itemId', sync)
    if (!itemIdField)
        throw new Error('itemIdField not found in sync configuration')

    const itemIdFieldId = itemIdField.airtable.id

    const { recordsWithParsingErrors, parsedRecords } =
        await parseAirtableRecords(updateWebflowItems, sync, referenceContext)

    // Add item IDs to parsed records for updates
    const parsedRecordsWithIds: ParsedRecord[] = []
    for (const parsed of parsedRecords) {
        const itemId = parsed.record.fields[itemIdFieldId] as string | undefined
        if (!itemId) {
            recordsWithParsingErrors.push({
                record: parsed.record,
                errors: ['Missing Webflow item ID for update'],
            })
            continue
        }
        parsedRecordsWithIds.push({
            ...parsed,
            collectionItem: {
                ...parsed.collectionItem,
                id: itemId,
            },
        })
    }

    // Immediately push to error array, we will not re-attempt
    failedUpdateRecords.push(...recordsWithParsingErrors)

    // If chunks fail, we will attempt to ascertain
    // the culprit by making chunks of 10
    // then individual items
    // then push the failed item(s) to recordsWithErrors
    const failedBigBatchItems: ParsedRecord[] = []
    const failedSmallBatchItems: ParsedRecord[] = []

    // Big batches
    for (
        let offset = 0;
        offset < parsedRecordsWithIds.length;
        offset += batchSize
    ) {
        const batch = parsedRecordsWithIds.slice(offset, offset + batchSize)

        try {
            const batchResults = await processBatch(sync, batch, webflowClient)
            updatedItems.push(...batchResults)
            emit.progressAdvance(
                'updating-items',
                `Updated ${updatedItems.length}/${numberOfItems} items`,
                batch.length
            )
        } catch (error) {
            failedBigBatchItems.push(...batch)
        }
    }

    // Small batches
    if (!failedBigBatchItems) {
        emit.progressEnd(
            'updating-items',
            `Updated ${updatedItems.length} items`
        )
        return { updatedItems, failedUpdateRecords }
    }
    for (
        let offset = 0;
        offset < failedBigBatchItems.length;
        offset += smallBatchSize
    ) {
        const batch = failedBigBatchItems.slice(offset, offset + smallBatchSize)

        try {
            const batchResults = await processBatch(sync, batch, webflowClient)
            updatedItems.push(...batchResults)
            emit.progressAdvance(
                'updating-items',
                `Updated ${updatedItems.length}/${numberOfItems} items`,
                batch.length
            )
        } catch (error) {
            failedSmallBatchItems.push(...batch)
        }
    }

    // Individual failed items
    if (!failedSmallBatchItems) {
        emit.progressEnd(
            'updating-items',
            `Updated ${updatedItems.length} items`
        )
        return { updatedItems, failedUpdateRecords }
    }
    for (const parsedRecord of failedSmallBatchItems) {
        try {
            const batchResults = await processBatch(
                sync,
                [parsedRecord],
                webflowClient
            )
            updatedItems.push(...batchResults)
            emit.progressAdvance(
                'updating-items',
                `Updated ${updatedItems.length}/${numberOfItems} items`,
                1
            )
        } catch (error) {
            failedUpdateRecords.push({
                errors: [extractWebflowErrorDescription(error)],
                record: parsedRecord.record,
            })
            // Still advance for failed items so progress stays accurate
            emit.progressAdvance(
                'updating-items',
                `Updated ${updatedItems.length}/${numberOfItems} items (${failedUpdateRecords.length} failed)`,
                1
            )
        }
    }

    emit.progressEnd('updating-items', `Updated ${updatedItems.length} items`)

    if (failedUpdateRecords.length > 0) {
        emit.error(
            new Error(`Failed to update ${failedUpdateRecords.length} items`),
            false
        )
    }

    return {
        updatedItems,
        failedUpdateRecords,
    }
}

async function processBatch(
    sync: Sync,
    batch: ParsedRecord[],
    webflowClient: WebflowClient
) {
    try {
        const collectionItems = batch
            .map((parsedRecord) => parsedRecord.collectionItem)
            .filter((item): item is typeof item & { id: string } => !!item.id)

        // Update items in webflow one chunk at a time
        const itemList = (await webflowClient.collections.items.updateItemsLive(
            sync.config.webflow.collection.id,
            {
                items: collectionItems,
                skipInvalidFiles: true,
            }
        )) as CollectionItemList

        const matchedUpdatedItems = matchResponseToRecord(batch, itemList)

        return matchedUpdatedItems
    } catch (error) {
        // If it's the last item in the batch preserve the error
        if (batch.length === 1) throw error

        // When a bulk item update fails, it does not say
        // which failed, it doesn't update any of them
        // so we need to address all items not updated.
        throw new Error('Batch failed')
    }
}

function extractWebflowErrorDescription(error: unknown): string {
    if (!(error instanceof Error)) return 'Webflow validation failed'

    const bodyMatch = error.message.match(/Body: ({[\s\S]*})/)
    const bodyString = bodyMatch?.[1]
    if (!bodyString) return error.message

    try {
        const body = JSON.parse(bodyString)
        if (body.details?.[0]?.description) {
            return body.details[0].description
        }
        return body.message || error.message
    } catch {
        return error.message
    }
}
