import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import { listAllItems } from '../webflow'
import type { Sync } from '../types'
import type { SyncEmitter } from './emitter'
import { createEmit, createReferenceContext, executeSync } from './shared'

/**
 * Executes a complete sync operation from Airtable to Webflow.
 *
 * This function orchestrates the entire sync process:
 * 1. Fetches all records from Airtable and items from Webflow
 * 2. Determines which items to create, update, or delete
 * 3. Performs the mutations in Webflow
 * 4. Updates Airtable records with sync status
 *
 * @param sync - The sync configuration defining field mappings and settings
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
 * await syncAll(syncConfig, airtableToken, webflowToken, emitter)
 * ```
 */
export async function syncAll(
    sync: Sync,
    airtableToken: string,
    webflowToken: string,
    emitter?: SyncEmitter
) {
    const emit = createEmit(emitter)
    const referenceContext = createReferenceContext(sync, airtableToken)

    const startTime = new Date().getTime()
    try {
        const webflowClient = new WebflowClient({
            accessToken: webflowToken,
        })

        emit.spinner('fetching-data', 'Fetching Airtable/Webflow data...')

        const [airtableRecords, webflowItemList] = await Promise.all([
            airtable.get.records(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                sync.config.airtable.table.view.id
            ),
            listAllItems(webflowClient, sync.config.webflow.collection.id),
        ])

        const {
            createdItems,
            updatedItems,
            deletedItems,
            failedRecords,
            verboseLogs,
        } = await executeSync({
            sync,
            airtableRecords,
            webflowItemList,
            webflowClient,
            airtableToken,
            emit,
            referenceContext,
            handleOrphans: true,
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
