import type { Sync } from '@tinysync/core'
import { state } from '../../../state'
import { syncs } from '../../../syncs'
import { ui } from '../../../ui'
import { manageSyncs } from '.'
import path from 'path'

/**
 * Validates that an object has the required sync properties.
 * Does NOT validate tokens - that will be done when the user views/runs the sync.
 */
function isValidSync(obj: any): obj is Omit<Sync, 'tokens'> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.initVersion === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.config === 'object' &&
        obj.config !== null
    )
}

/**
 * Checks if a sync with the given ID already exists in state.
 */
function syncExists(id: string): boolean {
    return state.syncs.some((sync) => sync.id === id)
}

export async function importSyncs() {
    try {
        // Prompt for file path
        const filePath = await ui.prompt.text({
            message: 'Enter the path to the sync JSON file to import',
            placeholder: `${process.cwd()}/tinysync-export.json`,
        })
        await ui.handleCancel(filePath, manageSyncs)

        if (!filePath || typeof filePath !== 'string') {
            ui.prompt.log.error('Invalid file path.')
            return await manageSyncs()
        }

        // Resolve the file path (handle ~ and relative paths)
        let resolvedPath = filePath.trim()
        if (resolvedPath.startsWith('~')) {
            resolvedPath = resolvedPath.replace('~', process.env.HOME || '')
        }
        resolvedPath = path.resolve(resolvedPath)

        // Check if file exists
        const file = Bun.file(resolvedPath)
        const exists = await file.exists()
        if (!exists) {
            ui.prompt.log.error(`File not found: ${resolvedPath}`)
            return await manageSyncs()
        }

        // Parse the JSON file
        let data: any
        try {
            data = await file.json()
        } catch {
            ui.prompt.log.error('Invalid JSON file.')
            return await manageSyncs()
        }

        // Handle both array and single sync formats
        const syncsToImport: Omit<Sync, 'tokens'>[] = Array.isArray(data)
            ? data
            : [data]

        // Validate all syncs
        const validSyncs: Omit<Sync, 'tokens'>[] = []
        const invalidCount = { value: 0 }
        const duplicateCount = { value: 0 }

        for (const syncData of syncsToImport) {
            if (!isValidSync(syncData)) {
                invalidCount.value++
                continue
            }

            if (syncExists(syncData.id)) {
                duplicateCount.value++
                continue
            }

            validSyncs.push(syncData)
        }

        if (validSyncs.length === 0) {
            if (duplicateCount.value > 0) {
                ui.prompt.log.warn(
                    `All ${duplicateCount.value} sync(s) already exist in your library.`
                )
            } else if (invalidCount.value > 0) {
                ui.prompt.log.error(
                    `No valid syncs found in file. ${invalidCount.value} invalid sync(s) skipped.`
                )
            } else {
                ui.prompt.log.warn('No syncs found in file.')
            }
            return await manageSyncs()
        }

        // Show summary and confirm import
        let summaryMessage = `Found ${ui.format.bold(String(validSyncs.length))} sync(s) to import`
        if (invalidCount.value > 0) {
            summaryMessage += ` (${invalidCount.value} invalid skipped)`
        }
        if (duplicateCount.value > 0) {
            summaryMessage += ` (${duplicateCount.value} duplicates skipped)`
        }
        ui.prompt.log.info(summaryMessage)

        // List the syncs to be imported
        for (const sync of validSyncs) {
            ui.prompt.log.message(`  • ${sync.name}`)
        }

        ui.prompt.log.warn(
            'Note: Imported syncs will need tokens assigned before they can be run.'
        )

        const confirmImport = await ui.prompt.confirm({
            message: 'Import these syncs?',
        })
        await ui.handleCancel(confirmImport, manageSyncs)

        if (!confirmImport) {
            ui.prompt.log.info('Import cancelled.')
            return await manageSyncs()
        }

        // Add syncs to state (without tokens - they'll be validated when viewed)
        for (const syncData of validSyncs) {
            // Cast to Sync - tokens will be undefined/missing which is handled by validateSyncTokens
            state.syncs.push(syncData as Sync)
        }

        // Save to files
        const saved = await syncs.save()
        if (!saved) {
            ui.prompt.log.error('Error saving imported syncs.')
            return await manageSyncs()
        }

        ui.prompt.log.success(
            `Successfully imported ${ui.format.bold(String(validSyncs.length))} sync(s)!`
        )
        return await manageSyncs()
    } catch (error) {
        ui.prompt.log.error('Error importing syncs.')
        return await manageSyncs()
    }
}
