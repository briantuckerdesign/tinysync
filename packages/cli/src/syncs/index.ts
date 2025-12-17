import { loadSyncs } from './load'
import { saveSyncs } from './save'

// Re-export syncsDir from centralized paths utility
export { syncsDir } from '../utils/paths'

export const syncs = {
    load: loadSyncs,
    save: saveSyncs,
}
