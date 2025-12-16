export type SyncState =
    | 'Staging'
    | 'Not synced'
    | 'Queued for sync'
    | 'Always sync'

export type RecordAction =
    | { type: 'skip'; preserveItemId: boolean }
    | { type: 'create'; preserveItemId: false }
    | { type: 'update'; preserveItemId: true }
    | { type: 'delete'; preserveItemId: true }
    | { type: 'error'; preserveItemId: boolean; message: string }

interface RecordContext {
    state: string | undefined
    itemId: string | undefined
    hasValidItemId: boolean
}

export function determineRecordAction(ctx: RecordContext): RecordAction {
    const { state, itemId, hasValidItemId } = ctx

    switch (state as SyncState) {
        case 'Staging':
            // Do nothing
            return { type: 'skip', preserveItemId: !!itemId }

        case 'Not synced':
            // Delete orphaned Webflow item
            if (itemId && hasValidItemId)
                return { type: 'delete', preserveItemId: true }

            // Error: Airtable field item ID present but doesn't match a Webflow item
            if (itemId && !hasValidItemId)
                return {
                    type: 'error',
                    preserveItemId: true,
                    message: INVALID_ITEM_ID_ERROR,
                }
            // No item ID - nothing to do
            return { type: 'skip', preserveItemId: false }

        case 'Queued for sync':
        case 'Always sync':
            // No item ID - create new
            if (!itemId) return { type: 'create', preserveItemId: false }

            // Error: Airtable field item ID present but doesn't match a Webflow item
            if (!hasValidItemId)
                return {
                    type: 'error',
                    preserveItemId: true,
                    message: INVALID_ITEM_ID_ERROR,
                }

            // Valid item ID - update
            return { type: 'update', preserveItemId: true }

        default:
            // Error: unknown state value
            return {
                type: 'error',
                preserveItemId: !!itemId,
                message: `State field value "${state}" didn't match any expected values.`,
            }
    }
}

const INVALID_ITEM_ID_ERROR =
    'Airtable record contained an Item ID that was not found in Webflow. To fix, clear the Item ID field in Airtable, or update the Item ID field in Airtable to match the ID of an existing item in Webflow.'
