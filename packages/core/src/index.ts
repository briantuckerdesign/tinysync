/**
 * @tinysync/core
 *
 * Core sync engine for one-way synchronization from Airtable to Webflow CMS.
 * This package provides the sync functionality, Airtable API wrappers, and
 * type definitions for building Airtable → Webflow integrations.
 *
 * @example
 * ```typescript
 * import { runSync, createSyncEmitter } from '@tinysync/core'
 *
 * const emitter = createSyncEmitter()
 * emitter.on('complete', ({ summary }) => console.log('Done!', summary))
 *
 * await runSync(syncConfig, airtableToken, webflowToken, emitter)
 * ```
 *
 * @packageDocumentation
 */

// Main sync functionality
import { runSync } from './sync'
export { runSync }

// Airtable API
export { airtable } from './airtable'

// Types
export type {
    Sync,
    Token,
    Platform,
    State,
    TokenPair,
    RecordWithErrors,
    SyncField,
    SyncActions,
    SpecialField,
    SyncSettings,
} from './types'

// Airtable types
export type {
    AirtableRecord,
    AirtableFieldType,
    AirtableBase,
    AirtableTable,
    AirtableView,
    AirtableField,
    AirtableBasesListItem,
    AirtableBasesResponse,
    AirtablePermissionLevel,
} from './airtable/types'

// Sync emitter
export {
    createSyncEmitter,
    type SyncEmitter,
    type SyncEventType,
    type SyncProgressEvent,
    type SyncProgressEventData,
    type SyncErrorEvent,
    type SyncCompleteEvent,
    type SyncEmit,
    type SyncVerboseLogs,
} from './sync/emitter'

// Convenience export
export const tinysync = {
    sync: runSync,
}

// Re-export utilities if needed
export { checkVersionCompatibility } from './utils/check-version-compatibility'
