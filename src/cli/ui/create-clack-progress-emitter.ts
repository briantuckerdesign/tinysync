import * as p from '@clack/prompts'
import { createSyncEmitter, type SyncEmitter } from '../../core/sync/emitter'

/** Clack progress bar type from @clack/prompts */
type ClackProgress = ReturnType<typeof p.progress>

/** Combined emitter with clack progress bar controls */
export interface ClackProgressEmitter {
    /** The underlying SyncEmitter - pass this to runSync() */
    emitter: SyncEmitter
    /** Direct access to the clack progress bar */
    progress: ClackProgress
    /** Start the progress bar - call before runSync() */
    start: () => void
    /** Manually stop the progress bar (auto-called on complete/fatal error) */
    stop: (message?: string) => void
}

/**
 * Creates a SyncEmitter that integrates with @clack/prompts progress bar.
 * The emitter auto-advances and updates the progress bar on events.
 *
 * @param options - Configuration for the clack progress bar
 * @param options.max - Maximum value for the progress bar (total steps)
 * @param options.size - Width of the progress bar in characters
 * @param options.style - Style of the progress bar: 'light', 'heavy', 'block'
 *
 * @example
 * ```ts
 * const clack = createClackProgressEmitter({ max: 10 })
 * clack.start()
 * await runSync(sync, airtableToken, webflowToken, clack.emitter)
 * // Progress bar auto-stops on complete or fatal error
 * ```
 */
export function createClackProgressEmitter(options?: {
    max?: number
    size?: number
    style?: 'light' | 'heavy' | 'block'
}): ClackProgressEmitter {
    const emitter = createSyncEmitter()
    const progressBar = p.progress({
        max: options?.max ?? 10,
        size: options?.size ?? 10,
        style: options?.style ?? 'heavy',
    })

    // Wire up the emitter events to the clack progress bar
    emitter.on('progress', ({ message, data }) => {
        if (data?.noProgress) return
        progressBar.message(message)
        progressBar.advance(data?.advance ? data?.advance : 1)
    })

    emitter.on('error', ({ error, fatal }) => {
        if (fatal) {
            progressBar.stop(`Error: ${error.message}`)
        }
    })

    emitter.on('complete', ({ timeElapsed, summary }) => {
        const { created, updated, deleted, failed } = summary
        progressBar.stop(
            `Sync completed in ${timeElapsed.toFixed(1)}s — Created: ${created}, Updated: ${updated}, Deleted: ${deleted}${failed > 0 ? `, Failed: ${failed}` : ''}`
        )
    })

    return {
        emitter,
        progress: progressBar,
        start: () => progressBar.start(),
        stop: (message?: string) => progressBar.stop(message),
    }
}
