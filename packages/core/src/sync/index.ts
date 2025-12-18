import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import { listAllItems } from '../webflow'
import type { RecordWithErrors, Sync } from '../types'
import { parseActions } from './parse-actions'
import { createItems } from './create-items'
import { updateRecords } from './update-records'
import { updateItems } from './update-items'
import { deleteItems } from './delete-items'
import type {
    SyncCompleteEvent,
    SyncEmit,
    SyncEmitter,
    SyncProgressPhase,
    SyncVerboseLogs,
} from './emitter'
import type { ReferenceContext } from './parse-data'

/**
 * Executes a complete sync operation from Airtable to Webflow.
 *
 * This function orchestrates the entire sync process:
 * 1. Fetches records from Airtable and items from Webflow
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
 * await runSync(syncConfig, airtableToken, webflowToken, emitter)
 * ```
 */
export async function runSync(
    sync: Sync,
    airtableToken: string,
    webflowToken: string,
    emitter?: SyncEmitter
) {
    const emit: SyncEmit = {
        spinner: (phase: SyncProgressPhase, message: string) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'spinner', phase },
            })
        },
        progressStart: (
            phase: SyncProgressPhase,
            message: string,
            total: number
        ) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-start', phase, total },
            })
        },
        progressAdvance: (
            phase: SyncProgressPhase,
            message: string,
            increment?: number
        ) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-advance', phase, increment },
            })
        },
        progressEnd: (phase: SyncProgressPhase, message: string) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-end', phase },
            })
        },
        error: (error: Error, fatal = false) => {
            emitter?.emit('error', { error, fatal })
        },
        complete: (
            timeElapsed: number,
            summary: SyncCompleteEvent['summary'],
            verboseLogs?: SyncVerboseLogs
        ) => {
            const payload: SyncCompleteEvent = { timeElapsed, summary }
            if (verboseLogs) {
                payload.verboseLogs = verboseLogs
            }
            emitter?.emit('complete', payload)
        },
    }

    // Reference context for resolving Reference/MultiReference fields
    const referenceContext: ReferenceContext = {
        token: airtableToken,
        baseId: sync.config.airtable.base.id,
    }

    // Start timer
    const startTime = new Date().getTime()
    try {
        // Initialize Webflow client
        const webflowClient = new WebflowClient({
            accessToken: webflowToken,
        })

        emit.spinner('fetching-data', 'Fetching Airtable/Webflow data...')
        // Fetch Airtable records and Webflow items
        const [airtableRecords, webflowItemList] = await Promise.all([
            airtable.get.records(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                sync.config.airtable.table.view.id
            ),
            listAllItems(webflowClient, sync.config.webflow.collection.id),
        ])

        // Sort records into create, update, and delete arrays
        const actions = await parseActions(
            sync,
            airtableRecords,
            webflowItemList
        )

        // Create new items in Webflow
        const { createdItems, failedCreateRecords } = await createItems(
            sync,
            actions.createWebflowItem,
            webflowClient,
            emit,
            referenceContext
        )

        // Update existing items in Webflow
        const { updatedItems, failedUpdateRecords } = await updateItems(
            sync,
            actions.updateWebflowItem,
            webflowClient,
            emit,
            referenceContext
        )

        // Delete relevant Webflow items
        const { deletedItems, failedDeleteRecords } = await deleteItems(
            sync,
            actions.deleteWebflowItem,
            actions.orphanedItems,
            webflowClient,
            emit
        )

        const failedRecords: RecordWithErrors[] = [
            ...failedCreateRecords,
            ...failedUpdateRecords,
            ...failedDeleteRecords,
        ]

        await updateRecords(
            sync,
            createdItems,
            updatedItems,
            deletedItems,
            failedRecords,
            airtableToken,
            emit
        )

        const timeElapsed = (new Date().getTime() - startTime) / 1000

        // Build verbose logs if enabled
        const verboseLogs: SyncVerboseLogs | undefined = sync.config.verboseLogs
            ? {
                  airtableRecords,
                  webflowItemList,
                  actions,
                  createdItems,
                  failedCreateRecords,
                  updatedItems,
                  failedUpdateRecords,
                  deletedItems,
                  failedDeleteRecords,
              }
            : undefined

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
