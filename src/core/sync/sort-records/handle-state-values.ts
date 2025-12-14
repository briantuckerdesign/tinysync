export type SyncState = 'Staging' | 'Not synced' | 'Queued for sync' | 'Always sync'

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
            // Preserve item ID to prevent deletion, but don't sync
            return { type: 'skip', preserveItemId: !!itemId }

        case 'Not synced':
            // Delete from Webflow if item exists there
            if (itemId && hasValidItemId) {
                return { type: 'delete', preserveItemId: true }
            }
            // Item ID present but doesn't exist in Webflow - error
            if (itemId && !hasValidItemId) {
                return { type: 'error', preserveItemId: true, message: INVALID_ITEM_ID_ERROR }
            }
            // No item ID - nothing to do
            return { type: 'skip', preserveItemId: false }

        case 'Queued for sync':
        case 'Always sync':
            // No item ID - create new
            if (!itemId) {
                return { type: 'create', preserveItemId: false }
            }
            // Item ID doesn't exist in Webflow - error
            if (!hasValidItemId) {
                return { type: 'error', preserveItemId: true, message: INVALID_ITEM_ID_ERROR }
            }
            // Valid item ID - update
            return { type: 'update', preserveItemId: true }

        default:
            // Unknown state - error
            return {
                type: 'error',
                preserveItemId: !!itemId,
                message: `State field value "${state}" didn't match any expected values.`,
            }
    }
}

const INVALID_ITEM_ID_ERROR =
    'Airtable record contained an Item ID that was not found in Webflow. To fix, clear the Item ID field in Airtable, or update the Item ID field in Airtable to match the ID of an existing item in Webflow.'
