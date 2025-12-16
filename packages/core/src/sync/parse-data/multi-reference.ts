// async function parseMultiReference(
//     field,
//     record,
//     recordData,
//     selectedSync,
//     state
// ) {
//     const referencedCollectionId = field.validations.collectionId
//     const config = state.config
//     const referencedSync = config.syncs.find(
//         (sync) => sync.webflow.collection.id === referencedCollectionId
//     )
//     if (!referencedSync) {
//         ui.prompt.log.error(
//             "Couldn't find the referenced field in any of your saved syncs. Add that table/collection to a new sync and try again."
//         )
//         return
//     }

//     const referencedTableId = field.options.linkedTableId

//     // array of strings
//     const referencedRecordIds = record.fields[field.airtableName]

//     const referencedItemIds = []

//     for (const referencedRecordId of referencedRecordIds) {
//         // TODO: Throughout, move to airtable Ids instead of names
//         // TODO: ARG ORDER CHANGED
//         const referencedRecord = await airtable.getRecord(
//             selectedSync,
//             referencedRecordId,
//             referencedTableId
//         )
//         // TODO: Move the field finding/saving to config to initial setup

//         const referencedItemIdField = toolbelt.findSpecial(
//             'itemId',
//             referencedSync
//         ).airtableName

//         const referencedItemId = referencedRecord.fields[referencedItemIdField]

//         referencedItemIds.push(referencedItemId)
//     }
//     recordData[field.webflowSlug] = referencedItemIds
// }
