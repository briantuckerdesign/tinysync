import type { WebflowClient } from 'webflow-api'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, Sync } from '../types'
import { findSpecialField } from '../utils/find-special-field'
import type { CollectionItem } from 'webflow-api/api'
import type { ItemsDeleteItemsLiveRequestItemsItem } from 'webflow-api/api/resources/collections'

export interface DeletedItem {
    record: AirtableRecord
    itemId: string
}

export interface DeletedOrphanedItem {
    itemId: string
}

const batchSize = 100
const smallBatchSize = 10

export async function deleteItems(
    sync: Sync,
    deleteWebflowItems: AirtableRecord[],
    orphanedItems: CollectionItem[],
    webflowClient: WebflowClient
) {
    const deletedItems: DeletedItem[] = []
    const deletedOrphanedItems: DeletedOrphanedItem[] = []
    const failedDeleteRecords: RecordWithErrors[] = []

    const numberOfOrphanedItems = orphanedItems.length
    const numberOfItems = deleteWebflowItems.length
    if (numberOfItems === 0 && numberOfOrphanedItems === 0)
        return { deletedItems, deletedOrphanedItems, failedDeleteRecords }

    // Get the itemId field to extract existing Webflow item IDs
    const itemIdField = findSpecialField('itemId', sync)
    if (!itemIdField)
        throw new Error('itemIdField not found in sync configuration')

    const itemIdFieldId = itemIdField.airtable.id

    // Process orphaned items (items in Webflow but not in Airtable)
    if (numberOfOrphanedItems > 0) {
        const orphanedItemIds = orphanedItems
            .map((item) => item.id)
            .filter((id): id is string => !!id)

        const failedBigBatchOrphans: string[] = []
        const failedSmallBatchOrphans: string[] = []

        // Big batches for orphaned items
        for (let offset = 0; offset < orphanedItemIds.length; offset += batchSize) {
            const batch = orphanedItemIds.slice(offset, offset + batchSize)
            try {
                await deleteItemBatch(sync, batch, webflowClient)
                deletedOrphanedItems.push(...batch.map((id) => ({ itemId: id })))
            } catch {
                failedBigBatchOrphans.push(...batch)
            }
        }

        // Small batches for failed orphaned items
        for (let offset = 0; offset < failedBigBatchOrphans.length; offset += smallBatchSize) {
            const batch = failedBigBatchOrphans.slice(offset, offset + smallBatchSize)
            try {
                await deleteItemBatch(sync, batch, webflowClient)
                deletedOrphanedItems.push(...batch.map((id) => ({ itemId: id })))
            } catch {
                failedSmallBatchOrphans.push(...batch)
            }
        }

        // Individual failed orphaned items (we don't track these as errors since they have no Airtable record)
        for (const itemId of failedSmallBatchOrphans) {
            try {
                await deleteItemBatch(sync, [itemId], webflowClient)
                deletedOrphanedItems.push({ itemId })
            } catch {
                // Orphaned items have no Airtable record, so we can't add them to failedDeleteRecords
                // They will simply not be deleted
            }
        }
    }

    // Process Airtable records marked for deletion
    if (numberOfItems > 0) {
        // Extract item IDs from Airtable records
        const recordsWithIds: { record: AirtableRecord; itemId: string }[] = []
        for (const record of deleteWebflowItems) {
            const itemId = record.fields[itemIdFieldId] as string | undefined
            if (!itemId) {
                failedDeleteRecords.push({
                    record,
                    errors: ['Missing Webflow item ID for deletion'],
                })
                continue
            }
            recordsWithIds.push({ record, itemId })
        }

        const failedBigBatchItems: { record: AirtableRecord; itemId: string }[] = []
        const failedSmallBatchItems: { record: AirtableRecord; itemId: string }[] = []

        // Big batches
        for (let offset = 0; offset < recordsWithIds.length; offset += batchSize) {
            const batch = recordsWithIds.slice(offset, offset + batchSize)
            try {
                await deleteItemBatch(sync, batch.map((r) => r.itemId), webflowClient)
                deletedItems.push(...batch.map((r) => ({ record: r.record, itemId: r.itemId })))
            } catch {
                failedBigBatchItems.push(...batch)
            }
        }

        // Small batches
        for (let offset = 0; offset < failedBigBatchItems.length; offset += smallBatchSize) {
            const batch = failedBigBatchItems.slice(offset, offset + smallBatchSize)
            try {
                await deleteItemBatch(sync, batch.map((r) => r.itemId), webflowClient)
                deletedItems.push(...batch.map((r) => ({ record: r.record, itemId: r.itemId })))
            } catch {
                failedSmallBatchItems.push(...batch)
            }
        }

        // Individual failed items
        for (const item of failedSmallBatchItems) {
            try {
                await deleteItemBatch(sync, [item.itemId], webflowClient)
                deletedItems.push({ record: item.record, itemId: item.itemId })
            } catch (error) {
                failedDeleteRecords.push({
                    errors: [extractWebflowErrorDescription(error)],
                    record: item.record,
                })
            }
        }
    }

    return { deletedItems, deletedOrphanedItems, failedDeleteRecords }
}

async function deleteItemBatch(
    sync: Sync,
    itemIds: string[],
    webflowClient: WebflowClient
) {
    await webflowClient.collections.items.deleteItemsLive(
        sync.config.webflow.collection.id,
        { items: itemIds as unknown as ItemsDeleteItemsLiveRequestItemsItem[] }
    )
}

function extractWebflowErrorDescription(error: unknown): string {
    if (!(error instanceof Error)) return 'Webflow deletion failed'

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
