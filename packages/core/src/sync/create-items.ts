import type { WebflowClient } from 'webflow-api'
import type { CollectionItemList } from 'webflow-api/api'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, Sync } from '../types'
import {
    parseAirtableRecords,
    type ParsedRecord,
    type ReferenceContext,
} from './parse-data'
import type { SyncEmit } from './emitter'
import {
    matchResponseToRecord,
    type MatchedItem,
} from './match-response-to-record'

export interface CreatedItem extends MatchedItem {}

const batchSize = 100
const smallBatchSize = 10

/**
 * Creates new items in Webflow from Airtable records.
 *
 * Uses a batch-retry strategy:
 * 1. First attempts batches of 100 items
 * 2. Failed batches are retried in batches of 10
 * 3. Still-failing items are attempted individually
 *
 * This approach maximizes throughput while identifying problem records.
 *
 * @param sync - The sync configuration
 * @param createWebflowItems - Airtable records to create as Webflow items
 * @param webflowClient - Initialized Webflow API client
 * @param emit - Event emitter for progress/errors
 * @param referenceContext - Context for resolving Reference fields
 * @returns Created items and failed records with error details
 */
export async function createItems(
    sync: Sync,
    createWebflowItems: AirtableRecord[],
    webflowClient: WebflowClient,
    emit: SyncEmit,
    referenceContext?: ReferenceContext
) {
    const createdItems: CreatedItem[] = []
    const failedCreateRecords: RecordWithErrors[] = []

    const numberOfItems = createWebflowItems.length
    if (numberOfItems === 0) return { createdItems, failedCreateRecords }

    const { recordsWithParsingErrors, parsedRecords } =
        await parseAirtableRecords(createWebflowItems, sync, referenceContext)

    // Immediately push to error array, we will not re-attempt
    failedCreateRecords.push(...recordsWithParsingErrors)

    // If chunks fail, we will attempt to ascertain
    // the culprit by making chunks of 10
    // then individual items
    // then push the failed item(s) to recordsWithErrors
    const failedBigBatchItems: ParsedRecord[] = []
    const failedSmallBatchItems: ParsedRecord[] = []

    // Big batches
    for (let offset = 0; offset < parsedRecords.length; offset += batchSize) {
        const batch = parsedRecords.slice(offset, offset + batchSize)

        try {
            createdItems.push(
                ...(await processBatch(sync, batch, webflowClient))
            )
        } catch (error) {
            failedBigBatchItems.push(...batch)
        }
    }

    // Small batches
    if (!failedBigBatchItems) return { createdItems, failedCreateRecords }
    for (
        let offset = 0;
        offset < failedBigBatchItems.length;
        offset += smallBatchSize
    ) {
        const batch = failedBigBatchItems.slice(offset, offset + smallBatchSize)

        try {
            createdItems.push(
                ...(await processBatch(sync, batch, webflowClient))
            )
        } catch (error) {
            failedSmallBatchItems.push(...batch)
        }
    }

    // Individual failed items
    if (!failedSmallBatchItems) return { createdItems, failedCreateRecords }
    for (const parsedRecord of failedSmallBatchItems) {
        try {
            createdItems.push(
                ...(await processBatch(sync, [parsedRecord], webflowClient))
            )
        } catch (error) {
            failedCreateRecords.push({
                errors: [extractWebflowErrorDescription(error)],
                record: parsedRecord.record,
            })
        }
    }

    if (failedCreateRecords.length > 0) {
        emit.error(
            new Error(`Failed to create ${failedCreateRecords.length} items`),
            false
        )
    }

    return {
        createdItems,
        failedCreateRecords,
    }
}

async function processBatch(
    sync: Sync,
    batch: ParsedRecord[],
    webflowClient: WebflowClient
) {
    try {
        const collectionItems = batch.map(
            (parsedRecord) => parsedRecord.collectionItem
        )

        // Create items in webflow one chunk at a time
        const itemList = (await webflowClient.collections.items.createItemLive(
            sync.config.webflow.collection.id,
            {
                items: [...collectionItems],
                skipInvalidFiles: true,
            }
        )) as CollectionItemList

        const matchedCreatedItems = matchResponseToRecord(batch, itemList)

        return matchedCreatedItems
    } catch (error) {
        // If it's the last item in the batch preserve the error
        if (batch.length === 1) throw error

        // When a bulk item creation fails, it does not say
        // which failed, it doesn't create any of them
        // so we need to address all items not created.
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
