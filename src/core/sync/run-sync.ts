import { WebflowClient } from 'webflow-api'
import { airtable } from '../airtable'
import type { Sync } from '../types'
import { parseActions } from './parse-actions'
import { createItems } from './create-items'
import { writeToJSONFile } from '../utils/write-to-json-file'

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
        await writeToJSONFile('./src/dev/webflow-items.json', webflowItemList)

        // Sort records into create, update, and delete arrays
        const actions = await parseActions(
            sync,
            airtableRecords,
            webflowItemList
        )

        await writeToJSONFile('./src/dev/actions.json', actions)

        // Create new items in Webflow
        const { createdItems, failedCreateRecords } = await createItems(
            sync,
            actions.createWebflowItem,
            webflowClient
        )
        console.log('🚀 ~ runSync ~ failedCreateRecords:', failedCreateRecords)
        console.log('🚀 ~ runSync ~ createdItems:', createdItems)
        return

        // Update existing items in Webflow
        // // await sync.updateItems(records, syncConfig, state);

        // Publish new and updated items in Webflow
        // // await sync.publishItems(records, syncConfig, state);

        // Delete items in that no longer exist in Airtable if enabled
        // await sync.deleteItems(records, syncConfig)

        // TODO: add airtable update record fx

        const timeElapsed = (new Date().getTime() - startTime) / 1000
        console.log('Sync completed in ' + timeElapsed + ' seconds.')

        // if (syncConfig.errors.length === 0) await viewSync()
    } catch (error) {
        throw error
    }
}
