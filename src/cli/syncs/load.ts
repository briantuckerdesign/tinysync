import { syncsDir } from '.'
import type { Sync } from '../../core/types'
import { state } from '../state'
import { ui } from '../ui'

export async function loadSyncs(): Promise<boolean> {
    try {
        // Get all .json files in the syncs directory
        const files = await Array.fromAsync(
            new Bun.Glob('*.json').scan({ cwd: syncsDir })
        )

        // Load and parse each sync file
        for (const filename of files) {
            const filePath = `${syncsDir}${filename}`
            const file = Bun.file(filePath)
            const sync: Sync = await file.json()

            if (!sync.id || !sync.initVersion || !sync.name || !sync.config) {
                ui.prompt.log.warn(`Skipping an invalid JSON file: ${filename}`)
                continue
            }

            state.syncs.push(sync)
        }

        return true
    } catch (error) {
        ui.prompt.log.error('Error loading syncs.')
        return false
    }
}
