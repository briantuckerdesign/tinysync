import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
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
    SyncVerboseLogs,
} from './emitter'
import type { ReferenceContext } from './parse-data'

export async function runSync(
    sync: Sync,
    airtableToken: string,
    webflowToken: string,
    emitter?: SyncEmitter
) {
    const emit: SyncEmit = {
        progress: (message: string, data?: any) => {
            emitter?.emit('progress', { message, data })
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

        emit.progress('Fetching Airtable/Webflow data...')
        // Fetch Airtable records and Webflow items
        const [airtableRecords, webflowItemList] = await Promise.all([
            airtable.get.records(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                sync.config.airtable.table.view.id
            ),
            // TODO: Test pagination/calls over 100
            webflowClient.collections.items.listItems(
                sync.config.webflow.collection.id
            ),
        ])

        emit.progress('Parsing data...')
        // Sort records into create, update, and delete arrays
        const actions = await parseActions(
            sync,
            airtableRecords,
            webflowItemList,
            emit
        )

        if (actions.createWebflowItem.length) emit.progress('Creating items...')
        // Create new items in Webflow
        const { createdItems, failedCreateRecords } = await createItems(
            sync,
            actions.createWebflowItem,
            webflowClient,
            emit,
            referenceContext
        )

        if (actions.updateWebflowItem.length) emit.progress('Updating items...')
        // Update existing items in Webflow
        const { updatedItems, failedUpdateRecords } = await updateItems(
            sync,
            actions.updateWebflowItem,
            webflowClient,
            emit,
            referenceContext
        )

        if (actions.deleteWebflowItem.length || actions.orphanedItems.length)
            emit.progress('Deleting items...')
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

        emit.progress('Updating records...')
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
