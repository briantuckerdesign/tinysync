import pack from '../../../package.json'

/**
 * Checks sync compability with created version vs current version.
 *
 * Since 1.0.0 is a complete refactor, all previous versions are breaking
 */
export function checkCompatibility(createdVersion: string): boolean {
    if (createdVersion === pack.version) return true
    return false
}
