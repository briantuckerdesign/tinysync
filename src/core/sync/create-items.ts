import type { WebflowClient } from 'webflow-api'
import type { CollectionItemList } from 'webflow-api/api'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, Sync } from '../types'
import { parseAirtableRecords, type ParsedRecord } from './parse-data'
import type { SyncEmit } from './emitter'

export interface CreatedItem extends ParsedRecord {
    itemId: string
    slug: string
}

const batchSize = 100
const smallBatchSize = 10

export async function createItems(
    sync: Sync,
    createWebflowItems: AirtableRecord[],
    webflowClient: WebflowClient,
    emit: SyncEmit
) {
    const createdItems: CreatedItem[] = []
    const failedCreateRecords: RecordWithErrors[] = []

    const numberOfItems = createWebflowItems.length
    if (numberOfItems === 0) return { createdItems, failedCreateRecords }

    emit.progress(`Creating ${createWebflowItems.length} Webflow items`)

    const { recordsWithParsingErrors, parsedRecords } = parseAirtableRecords(
        createWebflowItems,
        sync
    )

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

    emit.progress(
        `Created ${createdItems.length} items, ${failedCreateRecords.length} failed`,
        {
            noProgress: true,
            created: createdItems.length,
            failed: failedCreateRecords.length,
        }
    )

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

function matchResponseToRecord(
    batch: ParsedRecord[],
    itemList: CollectionItemList
): CreatedItem[] {
    if (!itemList.items) return []

    // Webflow returns items in the same order they were submitted
    return itemList.items
        .map((item, index) => {
            const record = batch[index]
            if (!item.id || !record) return null
            return {
                ...record,
                itemId: item.id,
                slug: item.fieldData.slug,
            }
        })
        .filter((item): item is CreatedItem => item !== null)
}
