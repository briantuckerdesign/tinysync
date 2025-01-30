async function parseReference(field, record, recordData, selectedSync, state) {
  const referencedCollectionId = field.validations.collectionId;

  // TODO: Move the field finding/saving to config to initial setup
  const config = state.config;
  const referencedSync = config.syncs.find(
    (sync) => sync.webflow.collection.id === referencedCollectionId
  );

  if (!referencedSync) {
    ui.prompt.log.error(
      "Couldn't find the referenced field in any of your saved syncs. Add that table/collection to a new sync and try again."
    );
    return;
  }
  const referencedTableId = field.options.linkedTableId;

  const referencedRecordId = record.fields[field.airtableName][0];

  // TODO: Throughout, move to airtable Ids instead of names
  const referencedRecord = await airtable.getRecord(
    selectedSync,
    referencedRecordId,
    referencedTableId
  );

  const referencedItemIdField = utils.findSpecial(
    "itemId",
    referencedSync
  ).airtableName;

  const referencedItemId = referencedRecord.fields[referencedItemIdField];

  recordData[field.webflowSlug] = referencedItemId;
}
