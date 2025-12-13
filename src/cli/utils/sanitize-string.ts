export function sanitizeString(string: string): string {
    return string.replace(/[^a-zA-Z0-9\s-_]/g, '')
}
