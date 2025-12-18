import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import { listAllItems } from '../webflow'
import type { Sync } from '../types'
import type { SyncEmitter } from './emitter'
import { createEmit, createReferenceContext, executeSync } from './shared'

/**
 * Executes a selective sync operation for specific Airtable records to Webflow.
 *
 * This function works identically to syncAll but only for the specified records:
 * 1. Fetches the specific records from Airtable by their IDs
 * 2. Fetches existing Webflow items
 * 3. Determines which items to create, update, or delete based on record state
 * 4. Performs the mutations in Webflow
 * 5. Updates Airtable records with sync status
 *
 * Note: This function does NOT handle orphaned items since it only operates
 * on the specified records. Use syncAll to handle orphan deletion.
 *
 * @param sync - The sync configuration defining field mappings and settings
 * @param recordIds - Array of Airtable record IDs to sync
 * @param airtableToken - Airtable API token with read/write access
 * @param webflowToken - Webflow API token with CMS and Sites permissions
 * @param emitter - Optional event emitter for progress/error/complete events
 *
 * @throws Error if sync fails fatally (emits error event before throwing)
 *
 * @example
 * ```typescript
 * const emitter = createSyncEmitter()
 * emitter.on('progress', ({ message }) => console.log(message))
 * emitter.on('complete', ({ summary }) => console.log(summary))
 *
 * await syncSelective(
 *   syncConfig,
 *   ['rec123', 'rec456', 'rec789'],
 *   airtableToken,
 *   webflowToken,
 *   emitter
 * )
 * ```
 */
export async function syncSelective(
    sync: Sync,
    recordIds: string[],
    airtableToken: string,
    webflowToken: string,
    emitter?: SyncEmitter
) {
    const emit = createEmit(emitter)
    const referenceContext = createReferenceContext(sync, airtableToken)

    const startTime = new Date().getTime()
    try {
        // Validate that we have record IDs to sync
        if (!recordIds || recordIds.length === 0) {
            emit.complete(0, { created: 0, updated: 0, deleted: 0, failed: 0 })
            return
        }

        const webflowClient = new WebflowClient({
            accessToken: webflowToken,
        })

        emit.spinner('fetching-data', 'Fetching Airtable/Webflow data...')

        const [allAirtableRecords, webflowItemList] = await Promise.all([
            airtable.get.records(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                sync.config.airtable.table.view.id
            ),
            listAllItems(webflowClient, sync.config.webflow.collection.id),
        ])

        // Filter to only the specified record IDs
        const recordIdSet = new Set(recordIds)
        const selectedRecords = allAirtableRecords.filter((record) =>
            recordIdSet.has(record.id)
        )

        const {
            createdItems,
            updatedItems,
            deletedItems,
            failedRecords,
            verboseLogs,
        } = await executeSync({
            sync,
            airtableRecords: selectedRecords,
            webflowItemList,
            webflowClient,
            airtableToken,
            emit,
            referenceContext,
            handleOrphans: false, // Never delete orphans in selective sync
        })

        const timeElapsed = (new Date().getTime() - startTime) / 1000

        emit.complete(
            timeElapsed,
            {
                created: createdItems.length,
                updated: updatedItems.length,
                deleted: deletedItems.length,
                failed: failedRecords.length,
            },
            verboseLogs
        )
    } catch (error) {
        emit.error(
            error instanceof Error ? error : new Error(String(error)),
            true
        )
        throw error
    }
}
