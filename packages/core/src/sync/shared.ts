import { WebflowClient } from 'webflow-api'
import type { CollectionItemList } from 'webflow-api/api'
import type { AirtableRecord } from '../airtable/types'
import type { RecordWithErrors, Sync } from '../types'
import { parseActions } from './parse-actions'
import { createItems } from './create-items'
import { updateRecords } from './update-records'
import { updateItems } from './update-items'
import { deleteItems } from './delete-items'
import type {
    SyncCompleteEvent,
    SyncEmit,
    SyncEmitter,
    SyncProgressPhase,
    SyncVerboseLogs,
} from './emitter'
import type { ReferenceContext } from './parse-data'

/**
 * Creates a SyncEmit object that wraps the optional emitter.
 * This helper standardizes progress, error, and complete event emission.
 */
export function createEmit(emitter?: SyncEmitter): SyncEmit {
    return {
        spinner: (phase: SyncProgressPhase, message: string) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'spinner', phase },
            })
        },
        progressStart: (
            phase: SyncProgressPhase,
            message: string,
            total: number
        ) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-start', phase, total },
            })
        },
        progressAdvance: (
            phase: SyncProgressPhase,
            message: string,
            increment?: number
        ) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-advance', phase, increment },
            })
        },
        progressEnd: (phase: SyncProgressPhase, message: string) => {
            emitter?.emit('progress', {
                message,
                data: { type: 'progress-end', phase },
            })
        },
        error: (error: Error, fatal = false) => {
            emitter?.emit('error', { error, fatal })
        },
        complete: (
            timeElapsed: number,
            summary: SyncCompleteEvent['summary'],
            verboseLogs?: SyncVerboseLogs
        ) => {
            const payload: SyncCompleteEvent = { timeElapsed, summary }
            if (verboseLogs) {
                payload.verboseLogs = verboseLogs
            }
            emitter?.emit('complete', payload)
        },
    }
}

/**
 * Creates the reference context for resolving Reference/MultiReference fields.
 */
export function createReferenceContext(
    sync: Sync,
    airtableToken: string
): ReferenceContext {
    return {
        token: airtableToken,
        baseId: sync.config.airtable.base.id,
    }
}

/**
 * Options for the core sync execution.
 */
export interface ExecuteSyncOptions {
    /** The sync configuration */
    sync: Sync
    /** Airtable records to sync */
    airtableRecords: AirtableRecord[]
    /** Webflow items list */
    webflowItemList: CollectionItemList
    /** Initialized Webflow client */
    webflowClient: WebflowClient
    /** Airtable API token */
    airtableToken: string
    /** Event emitter helper */
    emit: SyncEmit
    /** Reference context for resolving fields */
    referenceContext: ReferenceContext
    /** Whether to handle orphaned items (default: use sync config) */
    handleOrphans?: boolean
}

/**
 * Core sync execution logic shared by syncAll and syncSelective.
 *
 * This function performs the actual sync operations:
 * 1. Parses actions to determine create/update/delete
 * 2. Creates new items in Webflow
 * 3. Updates existing items in Webflow
 * 4. Deletes items from Webflow
 * 5. Updates Airtable records with sync status
 *
 * @returns Summary of sync results
 */
export async function executeSync(options: ExecuteSyncOptions): Promise<{
    createdItems: Awaited<ReturnType<typeof createItems>>['createdItems']
    updatedItems: Awaited<ReturnType<typeof updateItems>>['updatedItems']
    deletedItems: Awaited<ReturnType<typeof deleteItems>>['deletedItems']
    failedRecords: RecordWithErrors[]
    verboseLogs: SyncVerboseLogs | undefined
}> {
    const {
        sync,
        airtableRecords,
        webflowItemList,
        webflowClient,
        airtableToken,
        emit,
        referenceContext,
        handleOrphans = true,
    } = options

    // Create sync config for parseActions (may override orphan handling)
    const syncForParsing: Sync = handleOrphans
        ? sync
        : {
              ...sync,
              config: {
                  ...sync.config,
                  deleteOrphanedItems: false,
              },
          }

    // Sort records into create, update, and delete arrays
    const actions = await parseActions(
        syncForParsing,
        airtableRecords,
        webflowItemList
    )

    // Create new items in Webflow
    const { createdItems, failedCreateRecords } = await createItems(
        sync,
        actions.createWebflowItem,
        webflowClient,
        emit,
        referenceContext
    )

    // Update existing items in Webflow
    const { updatedItems, failedUpdateRecords } = await updateItems(
        sync,
        actions.updateWebflowItem,
        webflowClient,
        emit,
        referenceContext
    )

    // Delete relevant Webflow items
    const { deletedItems, failedDeleteRecords } = await deleteItems(
        sync,
        actions.deleteWebflowItem,
        actions.orphanedItems,
        webflowClient,
        emit
    )

    const failedRecords: RecordWithErrors[] = [
        ...failedCreateRecords,
        ...failedUpdateRecords,
        ...failedDeleteRecords,
    ]

    // Update Airtable records with sync status
    await updateRecords(
        sync,
        createdItems,
        updatedItems,
        deletedItems,
        failedRecords,
        airtableToken,
        emit
    )

    // Build verbose logs if enabled
    const verboseLogs: SyncVerboseLogs | undefined = sync.config.verboseLogs
        ? {
              airtableRecords,
              webflowItemList,
              actions,
              createdItems,
              failedCreateRecords,
              updatedItems,
              failedUpdateRecords,
              deletedItems,
              failedDeleteRecords,
          }
        : undefined

    return {
        createdItems,
        updatedItems,
        deletedItems,
        failedRecords,
        verboseLogs,
    }
}
