import { v4 as uuidv4 } from "uuid";

/**
 * Sync object output
 *
 * This is the format for a sync object.
 * This is encrypted before saving.
 *
 */

export function buildSync(
  airtableConfig: AirtableConfig,
  webflowConfig: WebflowConfig,
  fields: MatchedField[],
  settings: SyncSettings
): Promise<Sync> {
  const sync: Sync = {
    id: uuidv4(),
    name: settings.syncName,
    autoPublish: settings.autoPublish,
    deleteRecords: settings.deleteRecords,
    publishToSubdomain: settings.publishToSubdomain,
    errors: [],
    fields: fields,
    airtable: {
      accessToken: airtableConfig.accessToken,
      base: {
        id: airtableConfig.base.id,
        name: airtableConfig.base.name,
      },
      table: {
        id: airtableConfig.table.id,
        name: airtableConfig.table.name,
        view: airtableConfig.view,
        fields: airtableConfig.table.fields,
        primaryFieldId: airtableConfig.table.primaryFieldId,
        slugFieldId: airtableConfig.slugField.id,
        lastPublishedFieldId: airtableConfig.lastPublishedField.id,
        stateFieldId: airtableConfig.stateField.id,
        itemIdFieldId: airtableConfig.webflowItemIdField.id,
      },
    },
    webflow: {
      accessToken: webflowConfig.accessToken,
      site: {
        id: webflowConfig.site.id,
        name: webflowConfig.site.displayName,
        customDomains: webflowConfig.site.customDomains,
      },
      collection: {
        id: webflowConfig.collection.id,
        slug: webflowConfig.collection.slug,
        name: webflowConfig.collection.displayName,
        fields: webflowConfig.collection.fields,
      },
    },
  };
  return Promise.resolve(sync);
}
