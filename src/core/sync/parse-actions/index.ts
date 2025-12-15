import { determineRecordAction } from './handle-state-values'
import type { RecordWithErrors, Sync, SyncActions } from '../../types'
import type { AirtableRecord } from '../../airtable/types'
import type { CollectionItem, CollectionItemList } from 'webflow-api/api'
import { findSpecialField } from '../../utils/find-special-field'

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

    const itemsToDelete: CollectionItem[] = []

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
                    errors: [action.message],
                })
                break
            case 'skip':
                break
        }
    }

    // Delete orphaned Webflow items if enabled (has no corresponding Airtable record)
    if (sync.config.deleteOrphanedItems) {
        const orphanedItems = webflowItems.items.filter(
            (item) => !preservedItemIds.has(item.id as string)
        )
        itemsToDelete.push(...orphanedItems)
    }

    return {
        createWebflowItem,
        updateWebflowItem,
        deleteWebflowItem,
        recordsWithErrors,
        recordsToUpdate: [],
        itemsToPublish: [],
        itemsToDelete,
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
