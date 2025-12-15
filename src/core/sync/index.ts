import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import type { RecordWithErrors, Sync } from '../types'
import { parseActions } from './parse-actions'
import { createItems } from './create-items'
import { writeToJSONFile } from '../utils/write-to-json-file'
import { updateRecords } from './update-records'
import { updateItems } from './update-items'
import { deleteItems } from './delete-items'
import type { SyncCompleteEvent, SyncEmit, SyncEmitter } from './emitter'

export async function runSync(
    sync: Sync,
    airtableToken: string,
    webflowToken: string,
    emitter?: SyncEmitter
) {
    const emit: SyncEmit = {
        progress: (step: string, message: string, data?: any) => {
            emitter?.emit('progress', { step, message, data })
        },
        error: (step: string, error: Error, fatal = false) => {
            emitter?.emit('error', { step, error, fatal })
        },
        complete: (
            timeElapsed: number,
            summary: SyncCompleteEvent['summary']
        ) => {
            emitter?.emit('complete', { timeElapsed, summary })
        },
    }

    // Start timer
    const startTime = new Date().getTime()
    try {
        emit.progress('tinySync', 'Initializing sync...')

        // Initialize Webflow client
        const webflowClient = new WebflowClient({
            accessToken: webflowToken,
        })

        emit.progress('Fetch', 'Fetching Airtable records and Webflow items...')
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
        emit.progress(
            'Fetch',
            `Fetched ${airtableRecords.length} Airtable records and ${webflowItemList.items?.length ?? 0} Webflow items`,
            {
                airtableCount: airtableRecords.length,
                webflowCount: webflowItemList.items?.length ?? 0,
            }
        )
        await writeToJSONFile(
            './src/dev/airtable-records.json',
            airtableRecords
        )
        await writeToJSONFile(
            './src/dev/run-sync/webflow-items.json',
            webflowItemList
        )

        // Sort records into create, update, and delete arrays
        const actions = await parseActions(
            sync,
            airtableRecords,
            webflowItemList,
            emit
        )
        await writeToJSONFile('./src/dev/run-sync/actions.json', actions)

        // Create new items in Webflow
        const { createdItems, failedCreateRecords } = await createItems(
            sync,
            actions.createWebflowItem,
            webflowClient,
            emit
        )

        await writeToJSONFile(
            './src/dev/run-sync/created-items.json',
            createdItems
        )
        await writeToJSONFile(
            './src/dev/run-sync/failed-create-items.json',
            failedCreateRecords
        )

        // Update existing items in Webflow
        const { updatedItems, failedUpdateRecords } = await updateItems(
            sync,
            actions.updateWebflowItem,
            webflowClient,
            emit
        )

        await writeToJSONFile(
            './src/dev/run-sync/updated-items.json',
            updatedItems
        )
        await writeToJSONFile(
            './src/dev/run-sync/failed-update-items.json',
            failedUpdateRecords
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

        emit.complete(timeElapsed, {
            created: createdItems.length,
            updated: updatedItems.length,
            deleted: deletedItems.length,
            failed: failedRecords.length,
        })
    } catch (error) {
        emit.error(
            'fatal',
            error instanceof Error ? error : new Error(String(error)),
            true
        )
        throw error
    }
}
