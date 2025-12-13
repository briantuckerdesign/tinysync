import { loadSyncs } from './load'
import { saveSyncs } from './save'

export const syncsDir = './src/cli/data/syncs/'

export const syncs = {
    load: loadSyncs,
    save: saveSyncs,
}
