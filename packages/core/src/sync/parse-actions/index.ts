import { determineRecordAction } from './handle-state-values'
import type { RecordWithErrors, Sync, SyncActions } from '../../types'
import type { AirtableRecord } from '../../airtable/types'
import type { CollectionItem, CollectionItemList } from 'webflow-api/api'
import { findSpecialField } from '../../utils/find-special-field'

/**
 * Determines the sync action for each Airtable record.
 *
 * Compares Airtable records against Webflow items and categorizes each into:
 * - `createWebflowItem` - New records without Webflow item IDs
 * - `updateWebflowItem` - Records with valid Webflow item IDs
 * - `deleteWebflowItem` - Records marked as 'Not synced' with item IDs
 * - `orphanedItems` - Webflow items with no corresponding Airtable record
 * - `recordsWithErrors` - Records with invalid state or missing data
 *
 * @param sync - The sync configuration
 * @param airtableRecords - All records from the Airtable view
 * @param webflowItems - All items from the Webflow collection
 * @returns Categorized actions for the sync operation
 */
export async function parseActions(
    sync: Sync,
    airtableRecords: AirtableRecord[],
    webflowItems: CollectionItemList
): Promise<SyncActions> {
    if (!webflowItems.items) throw new Error('Webflow items not found')

    const { itemIdFieldId, stateFieldId } = getSpecialFieldIds(sync)

    const webflowItemIds = new Set(webflowItems.items.map((item) => item.id))

    const createWebflowItem: AirtableRecord[] = []
    const updateWebflowItem: AirtableRecord[] = []
    const deleteWebflowItem: AirtableRecord[] = []

    const recordsWithErrors: RecordWithErrors[] = []
    const orphanedItems: CollectionItem[] = []

    const preservedItemIds = new Set<string>()

    for (const record of airtableRecords) {
        const itemId = record.fields[itemIdFieldId] as string | undefined
        const state = record.fields[stateFieldId] as string | undefined

        const action = determineRecordAction({
            state,
            itemId,
            hasValidItemId: !!itemId && webflowItemIds.has(itemId),
        })

        if (action.preserveItemId && itemId) preservedItemIds.add(itemId)

        switch (action.type) {
            case 'create':
                createWebflowItem.push(record)
                break
            case 'update':
                updateWebflowItem.push(record)
                break
            case 'delete':
                deleteWebflowItem.push(record)
                break
            case 'error':
                recordsWithErrors.push({
                    record,
                    errors: ['parse-action:', action.message],
                })
                break
            case 'skip':
                break
        }
    }

    // Delete orphaned Webflow items if enabled (has no corresponding Airtable record)
    if (sync.config.deleteOrphanedItems) {
        const filteredItems = webflowItems.items.filter(
            (item) => !preservedItemIds.has(item.id as string)
        )
        orphanedItems.push(...filteredItems)
    }

    return {
        createWebflowItem,
        updateWebflowItem,
        deleteWebflowItem,
        recordsWithErrors,
        orphanedItems,
        recordsToUpdate: [],
    }
}

function getSpecialFieldIds(sync: Sync) {
    const itemIdField = findSpecialField('itemId', sync)
    if (!itemIdField) throw new Error('itemIdField not found')
    const itemIdFieldId = itemIdField.airtable.id

    const stateField = findSpecialField('state', sync)
    if (!stateField) throw new Error('stateField not found')
    const stateFieldId = stateField.airtable.id

    return { itemIdFieldId, stateFieldId }
}
