/**
 * Sync event emitter for tracking progress, errors, and completion.
 *
 * The emitter provides three event types:
 * - `progress` - Emitted during sync with status messages
 * - `error` - Emitted when errors occur (fatal or non-fatal)
 * - `complete` - Emitted when sync finishes with summary stats
 *
 * @example
 * ```typescript
 * const emitter = createSyncEmitter()
 * emitter.on('progress', ({ message }) => console.log(message))
 * emitter.on('error', ({ error, fatal }) => console.error(error))
 * emitter.on('complete', ({ summary }) => console.log(summary))
 * ```
 *
 * @module
 */
import { EventEmitter } from 'events'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, SyncActions } from '../types'
import type { CollectionItemList } from 'webflow-api/api'
import type { CreatedItem } from './create-items'
import type { UpdatedItem } from './update-items'
import type { DeletedItem } from './delete-items'

/** Creates a typed SyncEmitter for use with runSync */
export function createSyncEmitter(): SyncEmitter {
    return new EventEmitter() as SyncEmitter
}

export type SyncEventType = 'progress' | 'error' | 'complete'

export type SyncProgressEventData = {
    advance?: number
    noProgress?: boolean
    [key: string]: any
}

export interface SyncProgressEvent {
    message: string
    data?: SyncProgressEventData
}

export interface SyncErrorEvent {
    error: Error
    fatal: boolean
}

/** Verbose log data emitted on sync complete for optional CLI-side saving */
export interface SyncVerboseLogs {
    airtableRecords: AirtableRecord[]
    webflowItemList: CollectionItemList
    actions: SyncActions
    createdItems: CreatedItem[]
    failedCreateRecords: RecordWithErrors[]
    updatedItems: UpdatedItem[]
    failedUpdateRecords: RecordWithErrors[]
    deletedItems: DeletedItem[]
    failedDeleteRecords: RecordWithErrors[]
}

export interface SyncCompleteEvent {
    timeElapsed: number
    summary: {
        created: number
        updated: number
        deleted: number
        failed: number
    }
    /** Verbose log data - only included when sync.config.verboseLogs is enabled */
    verboseLogs?: SyncVerboseLogs
}

export interface SyncEmitter extends EventEmitter {
    emit(event: 'progress', payload: SyncProgressEvent): boolean
    emit(event: 'error', payload: SyncErrorEvent): boolean
    emit(event: 'complete', payload: SyncCompleteEvent): boolean
    on(event: 'progress', listener: (payload: SyncProgressEvent) => void): this
    on(event: 'error', listener: (payload: SyncErrorEvent) => void): this
    on(event: 'complete', listener: (payload: SyncCompleteEvent) => void): this
}

export interface SyncEmit {
    progress: (message: string, data?: SyncProgressEventData) => void
    error: (error: Error, fatal: boolean) => void
    complete: (
        timeElapsed: number,
        summary: SyncCompleteEvent['summary'],
        verboseLogs?: SyncVerboseLogs
    ) => void
}
