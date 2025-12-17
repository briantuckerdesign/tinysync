/**
 * Checks if a sync configuration is compatible with the current version.
 *
 * Since 1.0.0 represents a complete refactor, all previous versions are
 * considered breaking changes. This function helps determine if a sync
 * needs migration before use.
 *
 * @param createdVersion - The version the sync was created with (from sync.initVersion)
 * @param currentVersion - The current package version
 * @returns true if versions match exactly, false otherwise
 *
 * @example
 * ```typescript
 * if (!checkVersionCompatibility(sync.initVersion, packageVersion)) {
 *   throw new Error('Sync was created with incompatible version')
 * }
 * ```
 */
export function checkVersionCompatibility(
    createdVersion: string,
    currentVersion: string
): boolean {
    if (createdVersion === currentVersion) return true
    return false
}
