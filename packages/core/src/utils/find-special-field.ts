import type { SpecialField, Sync } from '../types'

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
