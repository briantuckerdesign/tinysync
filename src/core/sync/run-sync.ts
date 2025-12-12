import { WebflowClient } from 'webflow-api'

import type { Sync } from '../types'
import { airtable } from '../airtable'
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

        // Validate schemas on both ends // TODO:
        // const schemasValidated = await validateSchemas();

        // Fetch Airtable records and Webflow items ✅
        const [airtableRecords, webflowItems] = await Promise.all([
            airtable.get.records(
                airtableToken,
                sync.config.airtable.base.id,
                sync.config.airtable.table.id,
                sync.config.airtable.table.view.id
            ),
            webflowClient.collections.items.listItems(
                sync.config.webflow.collection.id
            ),
        ])

        // TODO: remove dev logging
        await writeToJSONFile(
            `./src/dev/temp/${new Date().toISOString()}_airtable-records.json`,
            airtableRecords
        )
        await writeToJSONFile(
            `./src/dev/temp/${new Date().toISOString()}_webflow-items.json`,
            webflowItems
        )

        // 3. Sort records into create, update, and delete arrays
        // let records = await sortRecords(
        //     syncConfig,
        //     airtableRecords,
        //     webflowRecords
        // )

        // writeToJSONFile('./src/dev/config.json', syncConfig)
        // writeToJSONFile('./src/dev/airtable-records.json', airtableRecords)
        // writeToJSONFile('./src/dev/webflow-records.json', webflowRecords)
        // writeToJSONFile('./src/dev/records.json', records)

        // Create new items in Webflow
        // await sync.createItems(records, syncConfig)

        // Update existing items in Webflow
        // // await sync.updateItems(records, syncConfig, state);

        // Publish new and updated items in Webflow
        // // await sync.publishItems(records, syncConfig, state);

        // Delete items in that no longer exist in Airtable if enabled
        // await sync.deleteItems(records, syncConfig)

        const timeElapsed = (new Date().getTime() - startTime) / 1000
        console.log('Sync completed in ' + timeElapsed + ' seconds.')

        // if (syncConfig.errors.length === 0) await viewSync()
    } catch (error) {
        throw error
    }
}
