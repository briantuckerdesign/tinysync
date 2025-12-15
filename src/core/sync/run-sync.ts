import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import type { RecordWithErrors, Sync } from '../types'
import { parseActions } from './parse-actions'
import { createItems } from './create-items'
import { writeToJSONFile } from '../utils/write-to-json-file'
import { updateRecords } from './update-records'
import { updateItems } from './update-items'
import { deleteItems } from './delete-items'

export async function runSync(
    sync: Sync,
    airtableToken: string,
    webflowToken: string
) {
    // Start timer
    const startTime = new Date().getTime()
    try {
        // Initialize Webflow client
        const webflowClient = new WebflowClient({
            accessToken: webflowToken,
        })

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
            webflowItemList
        )

        await writeToJSONFile('./src/dev/run-sync/actions.json', actions)

        // Create new items in Webflow
        const { createdItems, failedCreateRecords } = await createItems(
            sync,
            actions.createWebflowItem,
            webflowClient
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
            webflowClient
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
            webflowClient
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
            airtableToken
        )

        const timeElapsed = (new Date().getTime() - startTime) / 1000

        console.log('Sync completed in ' + timeElapsed + ' seconds.')
    } catch (error) {
        throw error
    }
}
