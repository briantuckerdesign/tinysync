/**
 * @tinysync/core
 *
 * Core sync engine for one-way synchronization from Airtable to Webflow CMS.
 * This package provides the sync functionality, Airtable API wrappers, and
 * type definitions for building Airtable → Webflow integrations.
 *
 * @example
 * ```typescript
 * import { syncAll, syncSelective, createSyncEmitter } from '@tinysync/core'
 *
 * const emitter = createSyncEmitter()
 * emitter.on('complete', ({ summary }) => console.log('Done!', summary))
 *
 * // Sync all records
 * await syncAll(syncConfig, airtableToken, webflowToken, emitter)
 *
 * // Or sync specific records by ID
 * await syncSelective(syncConfig, ['rec123', 'rec456'], airtableToken, webflowToken, emitter)
 * ```
 *
 * @packageDocumentation
 */

// Main sync functionality
import { syncAll, syncSelective } from './sync'
export { syncAll, syncSelective }
// Legacy alias for backward compatibility
export { syncAll as runSync }

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
    StateValue,
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
    type SyncProgressPhase,
    type SpinnerEventData,
    type ProgressStartEventData,
    type ProgressAdvanceEventData,
    type ProgressEndEventData,
    type SyncErrorEvent,
    type SyncCompleteEvent,
    type SyncEmit,
    type SyncVerboseLogs,
} from './sync/emitter'

// Convenience export
export const tinysync = {
    syncAll,
    syncSelective,
    /** @deprecated Use syncAll instead */
    sync: syncAll,
}

// Re-export utilities if needed
export { checkVersionCompatibility } from './utils/check-version-compatibility'
