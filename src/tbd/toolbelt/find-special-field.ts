export function findSpecial(fieldName: SpecialField, syncConfig: Sync) {
    return syncConfig.fields.find((field) => field.specialField === fieldName)
}
