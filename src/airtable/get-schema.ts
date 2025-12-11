import type { AirtableTable } from '../types/airtable'
import { ui } from '../ui'

export async function getSchema(
    token: string,
    viewId: string,
    tableId: string,
    baseId: string
) {
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data: any = await response.json()

        if (!data.tables || !Array.isArray(data.tables))
            throw new Error('Invalid response from Airtable API')

        const tables: AirtableTable[] = data.tables
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
        ui.prompt.log.error('Error getting Airtable schema:')
        ui.prompt.log.error(error as string)
        process.exit(0)
    }
}
