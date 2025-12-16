import { EventEmitter } from 'events'

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

export interface SyncCompleteEvent {
    timeElapsed: number
    summary: {
        created: number
        updated: number
        deleted: number
        failed: number
    }
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
        summary: SyncCompleteEvent['summary']
    ) => void
}
