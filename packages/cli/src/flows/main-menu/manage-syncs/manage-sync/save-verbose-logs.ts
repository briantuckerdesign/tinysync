import { type Sync, type SyncVerboseLogs } from '@tinysync/core'
import { join } from 'path'
import { ui } from '../../../../ui'
import { writeToJSONFile } from '../../../../utils/write-to-json-file'
import { logsDir } from '../../../../utils/paths'

/** Save verbose logs to JSON files */
export async function saveVerboseLogs(
    sync: Sync,
    logs: SyncVerboseLogs
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logDir = join(logsDir, `${sync.id}/${timestamp}/`)

    try {
        await Promise.all([
            writeToJSONFile(
                join(logDir, 'airtable-records.json'),
                logs.airtableRecords
            ),
            writeToJSONFile(
                join(logDir, 'webflow-items.json'),
                logs.webflowItemList
            ),
            writeToJSONFile(join(logDir, 'actions.json'), logs.actions),
            writeToJSONFile(
                join(logDir, 'created-items.json'),
                logs.createdItems
            ),
            writeToJSONFile(
                join(logDir, 'failed-create-records.json'),
                logs.failedCreateRecords
            ),
            writeToJSONFile(
                join(logDir, 'updated-items.json'),
                logs.updatedItems
            ),
            writeToJSONFile(
                join(logDir, 'failed-update-records.json'),
                logs.failedUpdateRecords
            ),
            writeToJSONFile(
                join(logDir, 'deleted-items.json'),
                logs.deletedItems
            ),
            writeToJSONFile(
                join(logDir, 'failed-delete-records.json'),
                logs.failedDeleteRecords
            ),
        ])
    } catch (error) {
        ui.prompt.log.warn('Failed to save verbose logs.')
    }
}
