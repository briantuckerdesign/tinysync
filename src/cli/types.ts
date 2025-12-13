import type { WebflowClient } from 'webflow-api'
import type { Sync, Token } from '../core/types'
import type {
    AirtableBasesListItem,
    AirtableField,
    AirtableTable,
    AirtableView,
} from '../core/airtable/types'
import type { Collection, Field, Site } from 'webflow-api/api'

export interface State {
    tokens: Token[]
    syncs: Sync[]
    version: string
    activeSync: Sync | undefined
    history: any
    password: string | null
    webflowClient: WebflowClient | undefined
}

export interface EncryptedData {
    version?: string
    passwordHash?: string
    encryptedData?: string
    iv?: string
    authTag?: string
    salt?: string
}

export interface AirtableConfig {
    token: Token
    base: AirtableBasesListItem
    table: AirtableTable
    view: AirtableView
    stateField: AirtableField
    slugField: AirtableField
    webflowItemIdField: AirtableField
    lastPublishedField: AirtableField
}

export interface WebflowConfig {
    token: Token
    site: Site
    collection: Collection
}
