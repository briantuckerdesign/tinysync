import * as p from '@clack/prompts'
import {
    createSyncEmitter,
    type SyncEmitter,
    type SyncProgressPhase,
    type SyncVerboseLogs,
} from '@tinysync/core'

/** Clack spinner type from @clack/prompts */
type ClackSpinner = ReturnType<typeof p.spinner>

/** Clack progress bar type from @clack/prompts */
type ClackProgress = ReturnType<typeof p.progress>

/** Active UI element - either a spinner or progress bar */
type ActiveUI =
    | { type: 'spinner'; spinner: ClackSpinner }
    | { type: 'progress'; progress: ClackProgress; phase: SyncProgressPhase }

/** Combined emitter with clack UI controls */
export interface ClackProgressEmitter {
    /** The underlying SyncEmitter - pass this to runSync() */
    emitter: SyncEmitter
}

/**
 * Creates a SyncEmitter that integrates with @clack/prompts for UI feedback.
 *
 * Handles two types of progress display:
 * - Spinner: For indeterminate progress (fetching data, parsing)
 * - Progress bar: For determinate progress (creating, updating, deleting items)
 *
 * @param options - Configuration options
 * @param options.progressSize - Width of progress bars in characters (default: 10)
 * @param options.progressStyle - Style of progress bars: 'light', 'heavy', 'block'
 * @param options.onVerboseLogs - Callback to handle verbose logs when sync completes
 *
 * @example
 * ```ts
 * const clack = createClackProgressEmitter()
 * await runSync(sync, airtableToken, webflowToken, clack.emitter)
 * // UI automatically shows spinners and progress bars as needed
 * ```
 */
export function createClackProgressEmitter(options?: {
    progressSize?: number
    progressStyle?: 'light' | 'heavy' | 'block'
    onVerboseLogs?: (logs: SyncVerboseLogs) => Promise<void> | void
}): ClackProgressEmitter {
    const emitter = createSyncEmitter()

    // Track current active UI element
    let activeUI: ActiveUI | null = null

    // Helper to stop current UI
    const stopCurrentUI = (message?: string) => {
        if (!activeUI) return

        if (activeUI.type === 'spinner') {
            activeUI.spinner.stop(message)
        } else {
            activeUI.progress.stop(message)
        }
        activeUI = null
    }

    // Helper to get human-readable phase name
    ;(phase: SyncProgressPhase): string => {
        switch (phase) {
            case 'fetching-data':
                return 'Fetching data'
            case 'parsing-data':
                return 'Parsing data'
            case 'creating-items':
                return 'Creating items'
            case 'updating-items':
                return 'Updating items'
            case 'deleting-items':
                return 'Deleting items'
            case 'updating-records':
                return 'Updating records'
            default:
                return phase
        }
    }

    // Wire up the emitter events to the clack UI
    emitter.on('progress', ({ message, data }) => {
        if (!data) return

        switch (data.type) {
            case 'spinner': {
                // Stop any current UI and start a new spinner
                stopCurrentUI()
                const spinner = p.spinner()
                spinner.start(message)
                activeUI = { type: 'spinner', spinner }
                break
            }

            case 'progress-start': {
                // Stop any current UI and start a new progress bar
                stopCurrentUI()
                const progress = p.progress({
                    max: data.total,
                    size: options?.progressSize ?? 10,
                    style: options?.progressStyle ?? 'heavy',
                })
                progress.start(message)
                activeUI = { type: 'progress', progress, phase: data.phase }
                break
            }

            case 'progress-advance': {
                // Advance the current progress bar
                if (activeUI?.type === 'progress') {
                    activeUI.progress.message(message)
                    activeUI.progress.advance(data.increment ?? 1)
                }
                break
            }

            case 'progress-end': {
                // Stop the current progress bar with final message
                if (activeUI?.type === 'progress') {
                    stopCurrentUI(message)
                }
                break
            }
        }
    })

    emitter.on('error', ({ error, fatal }) => {
        if (fatal) {
            stopCurrentUI(`Error: ${error.message}`)
        }
    })

    emitter.on('complete', ({ timeElapsed, summary, verboseLogs }) => {
        // Stop any remaining UI
        stopCurrentUI()

        const { created, updated, deleted, failed } = summary
        p.log.success(
            `Sync completed in ${timeElapsed.toFixed(1)}s — Created: ${created}, Updated: ${updated}, Deleted: ${deleted}${failed > 0 ? `, Failed: ${failed}` : ''}`
        )

        // Call verbose logs callback if provided and logs exist
        if (verboseLogs && options?.onVerboseLogs) {
            options.onVerboseLogs(verboseLogs)
        }
    })

    return {
        emitter,
    }
}
