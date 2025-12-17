import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync, existsSync } from 'fs'

/**
 * Get the appropriate data directory for tinysync based on the platform.
 *
 * - macOS: ~/.tinysync/
 * - Linux: ~/.tinysync/ (or $XDG_DATA_HOME/tinysync if set)
 * - Windows: %APPDATA%\tinysync\
 *
 * This ensures user data persists correctly regardless of how the CLI is installed
 * (npm global, bun global, compiled binary, etc.)
 */
function getDataDir(): string {
    const platform = process.platform

    let baseDir: string

    if (platform === 'win32') {
        // Windows: Use APPDATA
        baseDir = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
    } else if (platform === 'darwin') {
        // macOS: Use ~/.tinysync for simplicity (could also use ~/Library/Application Support)
        baseDir = homedir()
    } else {
        // Linux/other: Respect XDG_DATA_HOME or fall back to home
        baseDir = process.env.XDG_DATA_HOME || homedir()
    }

    // Use .tinysync for Unix-like, tinysync for Windows (no dot)
    const folderName = platform === 'win32' ? 'tinysync' : '.tinysync'

    return join(baseDir, folderName)
}

/**
 * The root data directory for tinysync user data.
 */
export const dataDir = getDataDir()

/**
 * Path to the tokens.json file.
 */
export const tokenFilePath = join(dataDir, 'tokens.json')

/**
 * Path to the syncs directory.
 */
export const syncsDir = join(dataDir, 'syncs/')

/**
 * Path to the logs directory.
 */
export const logsDir = join(dataDir, 'logs/')

/**
 * Ensures all required data directories exist.
 * Call this at startup before any file operations.
 */
export function ensureDataDirs(): void {
    const dirs = [dataDir, syncsDir, logsDir]

    for (const dir of dirs) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
        }
    }
}
