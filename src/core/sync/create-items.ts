import type { WebflowClient } from 'webflow-api'
import type { PayloadFieldData } from 'webflow-api/api'
import type { ItemsCreateItemLiveRequest } from 'webflow-api/wrapper/schemas'
import type { AirtableRecord } from '../airtable/types'
import type { Sync, SyncActions } from '../types'
import { findSpecial } from '../utils/find-special-field'
import { parseAirtableRecord } from './parse-data'

export async function createItems(
    sync: Sync,
    actions: SyncActions,
    webflowClient: WebflowClient
) {
    const numberOfItems = actions.createWebflowItem.length
    if (numberOfItems === 0) return

    const batchSize = 100
    for (let i = 0; i < numberOfItems; i += batchSize) {
        const itemsToCreate: PayloadFieldData[] = []
        const recordsToUpdate: AirtableRecord[] = []
        const end = Math.min(i + batchSize, numberOfItems)
        for (let j = i; j < end; j++) {
            const record = actions.createWebflowItem[j] as AirtableRecord

            // Parse data from Airtable to Webflow format
            const fieldData = await parseAirtableRecord(record, sync)
            if (!fieldData) continue

            itemsToCreate.push(fieldData)

            recordsToUpdate.push({
                id: record.id,
                fields: {},
            })

            const itemIdField = findSpecial('itemId', sync)
            if (!itemIdField)
                throw new Error('itemId field not found in sync config')

            // Add to publishing queue
            actions.itemsToPublish.push(record.fields[itemIdField.airtable.id])
        }

        const items: ItemsCreateItemLiveRequest = {
            items: [],
            skipInvalidFiles: true,
        }

        const response = await webflowClient.collections.items.createItemLive(
            sync.config.webflow.collection.id,
            items
        )
        // const airtableResponse = await airtable.updateRecords();
        console.log('📣 - createItems - response:', response)

        const format = {
            id: 'record id',
            fields: {
                'field id': 'field value',
            },
        }
    }
}

// export async function createItems(records: SyncRecords, syncConfig: Sync) {
//   records.toUpdateInAirtable = [];

//   if (records.toCreate.length === 0) return;

//   ui.spinner.start("Creating items...");
//   // TODO: 10 item pagination
//   let itemsToCreate = [];

//   for (const record of records.toCreate) {
//     // Parse data from Airtable to Webflow format
//     const parsedData = await parseAirtableRecord(record, syncConfig);

//     itemsToCreate.push(parsedData);

//     // Add to publishing queue
//     records.toPublish.push(record);
//   }

//   const response = await webflow.createItems(itemsToCreate, syncConfig);

//   ui.spinner.stop(`✅ ${ui.format.dim("Webflow items created.")}`);
// }

async function updateAirtableRecord(record, response, sync: Sync) {
    // Get value of slug field from Webflow response
    const webflowSlug = response.fieldData.slug
    // Find field in config where specialField = "Slug"
    const recordSlugField = findSpecial('slug', sync)
    if (!recordSlugField) throw new Error('Slug field not found in sync config')
    // Get value of slug field from Airtable record
    const recordSlug = record.fields[recordSlugField.airtable.id]

    // Get value of itemId field from Webflow response
    const webflowItemId = response.id

    // Find field in config where specialField = "itemId"
    // const recordItemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");
    const recordItemIdField = findSpecial('itemId', sync)
    if (!recordItemIdField)
        throw new Error('itemId field not found in sync config')
    // Write webflowItemId to record at top level
    record.itemId = response.id

    // Find field in config where specialField = "State"
    const recordStateField = sync.fields.find(
        (field) => field.specialField === 'state'
    )
    const recordState = record.fields[recordStateField?.airtable.id]

    let updateId, updateSlug, updateState, removeId, updatePublishDate

    switch (recordState) {
        case 'Always sync':
        case 'Staging':
            updateId = true
            updateSlug = true
            break
        case 'Not synced':
            removeId = true
            break
        case 'Queued for sync':
            updateId = true
            updateSlug = true
            updateState = true
            break
    }

    let recordUpdates = {}

    if (updateId) {
        const idUpdate = { [recordItemIdField.airtableName]: webflowItemId }
        recordUpdates = { ...recordUpdates, ...idUpdate }
    }
    if (updateSlug && webflowSlug !== recordSlug) {
        const slugUpdate = { [recordSlugField.airtableName]: webflowSlug }
        recordUpdates = { ...recordUpdates, ...slugUpdate }
    }
    if (updateState) {
        const stateUpdate = { [recordStateField.airtableName]: 'Staging' }
        recordUpdates = { ...recordUpdates, ...stateUpdate }
    }

    recordUpdates = { fields: recordUpdates }

    await airtable.updateRecord(recordUpdates, record.id, sync)
}
