import { syncsDir } from '.'
import { state } from '../state'

export async function saveSyncs(): Promise<boolean> {
    try {
        // Save each sync to a JSON file in the syncs directory
        for (const sync of state.syncs) {
            const filePath = `${syncsDir}${sync.id}.json`
            await Bun.write(filePath, JSON.stringify(sync, null, 2))
        }

        return true
    } catch (error) {
        return false
    }
}
