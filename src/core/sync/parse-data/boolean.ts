export function parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value

    if (value === 'true' || value === 1) return true
    if (value === 'false' || value === 0) return false

    return Boolean(value)
}
