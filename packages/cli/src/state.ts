/**
 * Global application state for the CLI.
 *
 * This module holds the runtime state including:
 * - Decrypted tokens (in memory only, never persisted unencrypted)
 * - Loaded sync configurations
 * - Current session password (for re-encryption on save)
 * - Webflow client instance
 *
 * @module
 */
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
