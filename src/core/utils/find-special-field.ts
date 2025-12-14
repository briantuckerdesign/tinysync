import type { Sync } from '../types'

export function findSpecial(fieldName: SpecialField, sync: Sync) {
    return sync.fields.find((field) => field.specialField === fieldName)
}
