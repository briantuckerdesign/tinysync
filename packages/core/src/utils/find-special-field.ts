import type { SpecialField, Sync } from '../types'

/**
 * Finds a special field in the sync configuration by its type.
 *
 * Special fields are system fields required for sync operation:
 * - `itemId` - Stores the Webflow item ID
 * - `state` - Controls sync behavior (Staging, Always sync, etc.)
 * - `slug` - URL slug for the Webflow item
 * - `lastPublished` - Timestamp of last successful sync
 * - `name` - The item name (maps to Webflow's name field)
 * - `errors` - Stores sync error messages
 *
 * @param fieldName - The special field type to find
 * @param sync - The sync configuration
 * @returns The matching SyncField, or undefined if not found
 */
export function findSpecialField(fieldName: SpecialField, sync: Sync) {
    return sync.fields.find((field) => field.specialField === fieldName)
}

export function findAllSpecialFields(sync: Sync) {
    const itemIdField = findSpecialField('itemId', sync)
    if (!itemIdField) throw new Error('itemIdField not found')

    const stateField = findSpecialField('state', sync)
    if (!stateField) throw new Error('stateField not found')

    const slugField = findSpecialField('slug', sync)
    if (!slugField) throw new Error('slugField not found')

    const lastPublishedField = findSpecialField('lastPublished', sync)
    if (!lastPublishedField) throw new Error('lastPublishedField not found')

    const nameField = findSpecialField('name', sync)
    if (!nameField) throw new Error('nameField not found')

    const errorsField = findSpecialField('errors', sync)
    if (!errorsField) throw new Error('errorsField not found')

    return {
        itemIdField,
        stateField,
        slugField,
        lastPublishedField,
        nameField,
        errorsField,
    }
}
