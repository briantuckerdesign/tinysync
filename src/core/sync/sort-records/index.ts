import { determineRecordAction } from './handle-state-values'
import type { Sync } from '../../types'
import type { AirtableRecord } from '../../airtable/types'
import type { CollectionItem, CollectionItemList } from 'webflow-api/api'
import { findSpecial } from '../../utils/find-special-field'

export async function sortRecords(
    sync: Sync,
    airtableRecords: AirtableRecord[],
    webflowItems: CollectionItemList
): Promise<SyncRecords> {
    if (!webflowItems.items) throw new Error('Webflow items not found')

    const { itemIdFieldId, stateFieldId } = getSpecialFieldIds(sync)
    const webflowItemIds = new Set(webflowItems.items.map((item) => item.id))

    const toCreate: AirtableRecord[] = []
    const toUpdate: AirtableRecord[] = []
    const withErrors: AirtableRecord[] = []
    const toDelete: (AirtableRecord | CollectionItem)[] = []
    const preservedItemIds = new Set<string>()

    for (const record of airtableRecords) {
        const itemId = record.fields[itemIdFieldId] as string | undefined
        const state = record.fields[stateFieldId] as string | undefined

        const action = determineRecordAction({
            state,
            itemId,
            hasValidItemId: !!itemId && webflowItemIds.has(itemId),
        })

        if (action.preserveItemId && itemId) {
            preservedItemIds.add(itemId)
        }

        switch (action.type) {
            case 'create':
                toCreate.push(record)
                break
            case 'update':
                toUpdate.push(record)
                break
            case 'delete':
                toDelete.push(record)
                break
            case 'error':
                record.error = action.message
                withErrors.push(record)
                break
            case 'skip':
                break
        }
    }

    // Delete Webflow items that have no corresponding Airtable record
    if (sync.config.deleteNonCorrespondingItems) {
        const orphanedItems = webflowItems.items.filter(
            (item) => !preservedItemIds.has(item.id as string)
        )
        toDelete.push(...orphanedItems)
    }

    return {
        toCreate,
        toUpdate,
        withErrors,
        toDelete,
        toPublish: [],
    }
}

function getSpecialFieldIds(sync: Sync) {
    const itemIdField = findSpecial('itemId', sync)
    if (!itemIdField) throw new Error('itemIdField not found')
    const itemIdFieldId = itemIdField.airtable.id

    const stateField = findSpecial('state', sync)
    if (!stateField) throw new Error('stateField not found')
    const stateFieldId = stateField.airtable.id

    return { itemIdFieldId, stateFieldId }
}
