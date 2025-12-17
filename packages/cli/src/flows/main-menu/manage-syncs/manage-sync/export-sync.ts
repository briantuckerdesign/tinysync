import type { Sync } from '@tinysync/core'
import { ui } from '../../../../ui'
import { manageSync } from '.'
import path from 'path'
import { sanitizeString } from '../../../../utils/sanitize-string'

export async function exportSync(sync: Sync) {
    try {
        // Prompt for directory path
        const directory = await ui.prompt.text({
            message: 'Enter the directory path to export the sync to',
            placeholder: process.cwd(),
        })
        await ui.handleCancel(directory, () => manageSync(sync))

        if (!directory || typeof directory !== 'string') {
            ui.prompt.log.error('Invalid directory path.')
            return await manageSync(sync)
        }

        // Resolve the directory path (handle ~ and relative paths)
        let resolvedDir = directory.trim()
        if (resolvedDir.startsWith('~')) {
            resolvedDir = resolvedDir.replace('~', process.env.HOME || '')
        }
        resolvedDir = path.resolve(resolvedDir)

        // Create a copy of the sync without the tokens property
        const { tokens, ...syncWithoutTokens } = sync

        // Sanitize the sync name for use as a filename
        const sanitizedName = sanitizeString(sync.name)
        const fileName = `${sanitizedName}.json`
        const filePath = path.join(resolvedDir, fileName)

        // Write the sync to the file
        await Bun.write(filePath, JSON.stringify(syncWithoutTokens, null, 2))

        ui.prompt.log.success(`Sync exported to ${ui.format.bold(filePath)}`)
        return await manageSync(sync)
    } catch (error) {
        ui.prompt.log.error(
            'Error exporting sync. Make sure the directory exists.'
        )
        return await manageSync(sync)
    }
}
