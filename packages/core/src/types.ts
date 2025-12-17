import type {
    CollectionItem,
    FieldType,
    Domain as WebflowDomain,
} from 'webflow-api/api'
import type { AirtableFieldType, AirtableRecord } from './airtable/types'

export interface Sync {
    /**
     * Version the sync was created in.
     * This will help us determine if the sync is compatible with the current version of the app,
     * or needs to be converted to a new schema, or just cannot be used.
     * */
    initVersion: string
    /** UUID of the sync */
    id: string
    /** User-facing name */
    name: string
    /** Auth token UUIDs corresponding to encrypted savefile */
    tokens?: {
        /** UUID corresponding to encrypted file */
        webflow: string
        /** UUID corresponding to encrypted file */
        airtable: string
    }
    config: {
        /** Delete items in Webflow if no corresponding records found in Airtable */
        deleteOrphanedItems: boolean
        /** Publish to the webflow.io staging subdomain */
        publishToStagingSubdomain: boolean
        /** Enable verbose JSON logging to capture detailed sync data */
        verboseLogs?: boolean
        /** Airtable config */
        airtable: {
            base: {
                /** Base ID */
                id: string
                /** Base name */
                name: string
            }
            table: {
                /** Table ID */
                id: string
                /** Table name */
                name: string
                /** Airtable view */
                view: {
                    id: string
                    name: string
                    visibleFieldIds: Array<string>
                }
            }
        }
        /** Webflow config */
        webflow: {
            site: {
                /** Site ID */
                id: string
                /** Site name */
                name: string
                /** Custom domains */
                customDomains: WebflowDomain[]
            }
            collection: {
                /** Collection ID */
                id: string
                /** Collection slug */
                slug: string
                /** Collection name */
                name: string
            }
        }
    }
    /** Fields used by this sync */
    fields: SyncField[]
}

/** The two relevant platforms for tinysync */
export type Platform = 'webflow' | 'airtable'

export interface Token {
    /** UUID referenced in unencrypted sync */
    id: string
    /** User-facing key name */
    name: string
    /** Platform this token is for */
    platform: Platform
    /** Unencrypted token */
    token: string
}

export interface State {}

export interface TokenPair {
    airtable: string
    webflow: string
}

export interface RecordWithErrors {
    record: AirtableRecord
    errors: string[]
}

export interface SyncActions {
    createWebflowItem: AirtableRecord[]
    updateWebflowItem: AirtableRecord[]
    deleteWebflowItem: AirtableRecord[]
    recordsWithErrors: RecordWithErrors[]
    recordsToUpdate: AirtableRecord[]
    orphanedItems: CollectionItem[]
}

export interface SyncField {
    webflow?: {
        slug?: string
        name: string
        id: string
        type: FieldType
        validations?: any
    }
    airtable: {
        name: string
        id: string
        type: AirtableFieldType
        options: any
    }
    specialField: SpecialField | undefined
    /**
     * Configuration for Reference and MultiReference fields.
     * Stores the info needed to resolve Airtable record IDs to Webflow item IDs.
     */
    referenceConfig?: {
        /** The linked Airtable table ID (from airtable field options.linkedTableId) */
        linkedTableId: string
        /** The field ID in the linked table that stores Webflow item IDs */
        linkedItemIdFieldId: string
        /** The field name (for display/debugging) */
        linkedItemIdFieldName: string
    }
}

export type SpecialField =
    | 'lastPublished'
    | 'itemId'
    | 'state'
    | 'slug'
    | 'name'
    | 'errors'

export interface SyncSettings {
    syncName: string
    deleteRecords: boolean
    publishToSubdomain: boolean
}
