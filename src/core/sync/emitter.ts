import { EventEmitter } from 'events'

/** Creates a typed SyncEmitter for use with runSync */
export function createSyncEmitter(): SyncEmitter {
    return new EventEmitter() as SyncEmitter
}

export type SyncEventType = 'progress' | 'error' | 'complete'

export interface SyncProgressEvent {
    step: string
    message: string
    data?: any
}

export interface SyncErrorEvent {
    step: string
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
    progress: (step: string, message: string, data?: any) => void
    error: (step: string, error: Error, fatal: boolean) => void
    complete: (
        timeElapsed: number,
        summary: SyncCompleteEvent['summary']
    ) => void
}
