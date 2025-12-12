import Airtable from 'airtable'
import { WebflowClient } from 'webflow-api'
import { Collection, Domain, Field, Site } from 'webflow-api/api'
import { checkCompatibility } from './config-tools/check-compatibility'

export {}

declare global {
    interface WebflowField extends Field {
        validations?: any
        type: FieldType | 'VideoLink'
    }

    interface ConfigTools {
        save: typeof saveConfig
        load: typeof loadConfig
        secure: typeof secure
        checkCompatibility: typeof checkCompatibility
    }

    interface MenuHistory {
        function: any
        args?: any
        safeReturn?: boolean
    }

    interface Config {
        syncs: Array<Sync>
        tokens: Array<Token>
        initVersion: string
        version: string
        encryptedData?: any
        selectedSync: Sync | undefined
    }

    interface MatchedField {
        webflow?: {
            slug?: string
            displayName: string
            id: string
            type: string
            validations?: any
        }
        airtable: {
            name: string
            id: string
            type: string
            options: any
        }
        specialField: SpecialField
    }

    type SpecialField = 'lastPublished' | 'itemId' | 'state' | 'slug' | 'name'

    interface SyncSettings {
        syncName: string
        autoPublish: boolean
        deleteRecords: boolean
        publishToSubdomain?: boolean
    }

    /* --------------------------------- Webflow -------------------------------- */

    interface WebflowConfig {
        accessToken: string
        site: Site
        collection: Collection
        recordIdField: Field
    }

    /* -------------------------------- Airtable -------------------------------- */
    interface AirtableConfig {
        accessToken: string
        base: AirtableBasesListItem
        table: AirtableTable
        view: AirtableView
        stateField: AirtableField
        slugField: AirtableField
        webflowItemIdField: AirtableField
        lastPublishedField: AirtableField
    }

    interface SyncRecords {
        toCreate: AirtableRecord[]
        toUpdate: AirtableRecord[]
        withErrors: AirtableRecord[]
        toDelete: AirtableRecord[]
        toPublish: AirtableRecord[]
        toUpdateInAirtable?: AirtableRecord[]
    }
}
