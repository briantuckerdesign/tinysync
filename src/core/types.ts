import type { Domain as WebflowDomain } from 'webflow-api/api'

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
        /** Automatically publish Webflow site if validation occurs */
        autoPublishOnValidationError: boolean
        /** Delete items in Webflow if no corresponding records found in Airtable */
        deleteNonCorrespondingItems: boolean
        /** Publish to the webflow.io staging subdomain */
        publishToStagingSubdomain: boolean
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

export type SpecialField =
    | 'lastPublished'
    | 'itemId'
    | 'state'
    | 'slug'
    | 'name'

/** The two relevant platforms for tinySync */
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
