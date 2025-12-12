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

    interface State {
        config: Config
        password: string | null
        history: Array<MenuHistory>
        webflowClient?: WebflowClient
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

    interface Token {
        label: string
        name?: string // needed for clack occasionally
        value: string
        platform: string
        id: string
    }

    interface Sync {
        initVersion?: string
        id: string
        name: string
        autoPublish: boolean
        deleteRecords: boolean
        publishToSubdomain: boolean | undefined
        errors: Array<any>
        fields: Array<MatchedField>
        airtable: {
            accessToken: string
            base: {
                id: string
                name: string
            }
            table: {
                id: string
                name: string
                view: AirtableView
                fields: Array<any>
                primaryFieldId: string
                slugFieldId: string
                lastPublishedFieldId: string
                stateFieldId: string
                itemIdFieldId: string
            }
        }
        webflow: {
            api?: WebflowClient
            accessToken: string
            site: {
                id: string
                name: string | undefined
                customDomains: Domain[] | undefined
            }
            collection: {
                id: string
                slug: string | undefined
                name: string | undefined
                fields: Array<WebflowField>
            }
        }
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
