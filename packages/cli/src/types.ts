/**
 * CLI-specific type definitions.
 *
 * Extends core types with CLI-specific interfaces:
 * - `State` - Runtime application state
 * - `EncryptedData` - Structure of encrypted token storage
 * - `AirtableConfig` / `WebflowConfig` - Sync creation wizard state
 *
 * @module
 */
import type { WebflowClient } from 'webflow-api'
import type { Collection, Site } from 'webflow-api/api'
import type {
    AirtableBasesListItem,
    AirtableField,
    AirtableTable,
    AirtableView,
} from '@tinysync/core'
import type { Sync, Token } from '@tinysync/core'

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
    errorsField: AirtableField
}

export interface WebflowConfig {
    token: Token
    site: Site
    collection: Collection
}
