/**
 * Checks sync compability with created version vs current version.
 *
 * Since 1.0.0 is a complete refactor, all previous versions are breaking
 *
 * @param createdVersion - The version the sync was created with
 * @param currentVersion - The current version of the package (pass from package.json)
 */
export function checkVersionCompatibility(
    createdVersion: string,
    currentVersion: string
): boolean {
    if (createdVersion === currentVersion) return true
    return false
}
