import { v4 as uuidv4 } from 'uuid'
import pack from '../../../../../package.json'
import type { AirtableConfig, WebflowConfig } from '../../../../types'
import type { Sync, SyncField, SyncSettings } from '@tinysync/core'

export function buildSync(
    airtableConfig: AirtableConfig,
    webflowConfig: WebflowConfig,
    fields: SyncField[],
    settings: SyncSettings
): Promise<Sync> {
    const sync: Sync = {
        initVersion: pack.version,
        id: uuidv4(),
        name: settings.syncName,
        tokens: {
            airtable: airtableConfig.token.id,
            webflow: webflowConfig.token.id,
        },
        config: {
            autoPublishOnValidationError: settings.autoPublish,
            deleteOrphanedItems: settings.deleteRecords,
            publishToStagingSubdomain: settings.publishToSubdomain,
            airtable: {
                base: {
                    id: airtableConfig.base.id,
                    name: airtableConfig.base.name,
                },
                table: {
                    id: airtableConfig.table.id,
                    name: airtableConfig.table.name,
                    view: {
                        id: airtableConfig.view.id,
                        name: airtableConfig.view.name,
                        visibleFieldIds:
                            airtableConfig.view.visibleFieldIds || [],
                    },
                },
            },
            webflow: {
                site: {
                    id: webflowConfig.site.id,
                    name: webflowConfig.site.displayName as string,
                    customDomains: webflowConfig.site.customDomains || [],
                },
                collection: {
                    id: webflowConfig.collection.id,
                    slug: webflowConfig.collection.slug as string,
                    name: webflowConfig.collection.displayName,
                },
            },
        },
        fields,
    }
    return Promise.resolve(sync)
}
