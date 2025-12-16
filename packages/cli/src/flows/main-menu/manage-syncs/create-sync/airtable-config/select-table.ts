import { manageSyncs } from '../..'
import { airtable } from '@tinysync/core'
import type { AirtableBasesListItem, AirtableTable } from '@tinysync/core'
import { ui } from '../../../../../ui'

export async function selectTable(
    token: string,
    base: AirtableBasesListItem
): Promise<AirtableTable> {
    try {
        // Get tables from provided base
        ui.spinner.start('Getting tables...')
        const tables = await airtable.get.tables(token, base.id)
        ui.spinner.stop(`✅ ${ui.format.dim('Tables retrieved.')}`)

        // Ask user to select a table
        const table = (await ui.prompt.select({
            message: 'Airtable table:',
            options: tables.map((table) => ({
                label: table.name,
                value: table,
            })) as any[],
        })) as AirtableTable
        await ui.handleCancel(table, manageSyncs)

        return table
    } catch (error) {
        throw new Error('There was a problem selecting Airtable table.')
    }
}
