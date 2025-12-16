import pack from '../package.json'
import type { State } from './types'

export const state: State = {
    syncs: [],
    tokens: [],
    version: pack.version,
    activeSync: undefined,
    history: [],
    password: null,
    webflowClient: undefined,
}
