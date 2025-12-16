import { getTables } from './get-tables'
import type { AirtableTable } from './types'

export async function getSchema(
    token: string,
    baseId: string,
    tableId: string,
    viewId: string
): Promise<AirtableTable> {
    try {
        const tables = await getTables(token, baseId)
        const table = tables.find((table) => {
            return table.id === tableId
        })

        if (!table)
            throw new Error('Table not found. It may have been deleted.')

        const views = table.views
        const view = views.find((view) => {
            return view.id === viewId
        })

        if (!view) throw new Error('View not found. It may have been deleted.')

        return table
    } catch (error) {
        throw error
    }
}
