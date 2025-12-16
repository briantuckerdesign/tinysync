import { join } from 'path'
import { loadSyncs } from './load'
import { saveSyncs } from './save'

// Use import.meta.dir to resolve relative to this package, not cwd
export const syncsDir = join(import.meta.dir, '../../data/syncs/')

export const syncs = {
    load: loadSyncs,
    save: saveSyncs,
}
