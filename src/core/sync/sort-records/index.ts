import { Webflow } from 'webflow-api'
import { ui } from '../../ui'
import { AsciiTable3 } from 'ascii-table3'
import { handleStateValues } from './handle-state-values'

export async function sortRecords(
    selectedSync: Sync,
    airtableRecords: AirtableRecord[],
    webflowItems: Webflow.CollectionItem[]
): Promise<SyncRecords> {
    try {
        let recordsToCreate = []
        let recordsToUpdate = []
        let recordsWithErrors = []
        let webflowItemsToDelete = []

        // Get existing itemIds from webflow
        let webflowItemIds = new Set(webflowItems.map((item) => item.id))
        let usedItemIds = []
        const matchErrorMessage =
            'Airtable record contained an Item ID that was not found in Webflow. To fix, clear the Item ID field in Airtable, or update the Item ID field in Airtable to match the ID of an existing item in Webflow.'

        for (let airtableRecord of airtableRecords) {
            // Get Webflow item ID from airtable record
            const webflowItemIdInAirtable =
                airtableRecord.fields[selectedSync.airtable.table.itemIdFieldId]
            // Check if the ID matches an existing item in Webflow
            const idMatchFound = webflowItemIds.has(webflowItemIdInAirtable)
            // Get the state field value from the airtable record
            const stateFieldValue =
                airtableRecord.fields[selectedSync.airtable.table.stateFieldId]

            /* ----------------------------- Possible states ---------------------------- */
            handleStateValues(
                stateFieldValue,
                webflowItemIdInAirtable,
                usedItemIds,
                webflowItemsToDelete,
                airtableRecord,
                idMatchFound,
                matchErrorMessage,
                recordsWithErrors,
                recordsToCreate,
                recordsToUpdate
            )
        }

        // Create a set of usedItemIds to prevent deletion of items
        let usedItemIdsSet = new Set(usedItemIds)

        // Only delete items if config.deleteRecordsNotInAirtable is true
        if (selectedSync.deleteRecords) {
            // These are the records that are in Webflow but not in Airtable...
            // If selectedSync.deleteRecords is true, these webflow items will be deleted.
            const webflowItemsNotInAirtable = webflowItems.filter(
                (item) => !usedItemIdsSet.has(item.id)
            )
            webflowItemsToDelete = webflowItemsToDelete.concat(
                webflowItemsNotInAirtable
            )
        }

        // Log the number of records to create, update, and delete (and errors)
        let table = new AsciiTable3().setHeading('', 'Records').addRowMatrix([
            ['To Create', recordsToCreate.length],
            ['To Update', recordsToUpdate.length],
            ['To Delete', webflowItemsToDelete.length],
            ['Errors', recordsWithErrors.length],
        ])
        ui.prompt.note(`${table.toString()}`)

        return {
            toCreate: recordsToCreate,
            toUpdate: recordsToUpdate,
            withErrors: recordsWithErrors,
            toDelete: webflowItemsToDelete,
            toPublish: [],
        }
    } catch (error) {
        ui.prompt.log.error('Error sorting records.')
        process.exit(0)
    }
}
