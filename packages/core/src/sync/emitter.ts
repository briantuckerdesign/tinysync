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

/**
 * Progress phases represent distinct stages of the sync operation.
 * Each phase can be displayed with appropriate UI (spinner or progress bar).
 */
export type SyncProgressPhase =
    | 'fetching-data'
    | 'parsing-data'
    | 'creating-items'
    | 'updating-items'
    | 'deleting-items'
    | 'updating-records'

/**
 * Event data for spinner-style progress (indeterminate, no total known).
 * Used for phases like fetching data where we don't know total steps.
 */
export interface SpinnerEventData {
    type: 'spinner'
    phase: SyncProgressPhase
}

/**
 * Event data for starting a progress bar with a known total.
 * Emitted at the beginning of create/update/delete/updateRecords phases.
 */
export interface ProgressStartEventData {
    type: 'progress-start'
    phase: SyncProgressPhase
    total: number
}

/**
 * Event data for advancing a progress bar.
 * Emitted after each batch or item is processed.
 */
export interface ProgressAdvanceEventData {
    type: 'progress-advance'
    phase: SyncProgressPhase
    increment?: number | undefined
}

/**
 * Event data for ending a progress bar.
 * Emitted when a phase completes.
 */
export interface ProgressEndEventData {
    type: 'progress-end'
    phase: SyncProgressPhase
}

/**
 * Union type of all progress event data types.
 * The CLI can use the `type` discriminator to handle each appropriately.
 */
export type SyncProgressEventData =
    | SpinnerEventData
    | ProgressStartEventData
    | ProgressAdvanceEventData
    | ProgressEndEventData

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
    /** Emit a spinner event (indeterminate progress) */
    spinner: (phase: SyncProgressPhase, message: string) => void
    /** Start a progress bar for a phase with a known total */
    progressStart: (
        phase: SyncProgressPhase,
        message: string,
        total: number
    ) => void
    /** Advance the progress bar for a phase */
    progressAdvance: (
        phase: SyncProgressPhase,
        message: string,
        increment?: number
    ) => void
    /** End the progress bar for a phase */
    progressEnd: (phase: SyncProgressPhase, message: string) => void
    /** Emit an error event */
    error: (error: Error, fatal: boolean) => void
    /** Emit the complete event with summary stats */
    complete: (
        timeElapsed: number,
        summary: SyncCompleteEvent['summary'],
        verboseLogs?: SyncVerboseLogs
    ) => void
}
