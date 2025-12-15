import { manageSyncs } from '../..'
import type { AirtableConfig } from '../../../../../types'
import { ui } from '../../../../../ui'
import { selectToken } from '../select-token'
import { handleRequiredFields } from './required-fields'
import { selectBase } from './select-base'
import { selectTable } from './select-table'
import { selectView } from './select-view'

export async function createAirtableConfig(
    syncName: string
): Promise<AirtableConfig> {
    try {
        ui.prompt.log.info(`${ui.format.bold('Airtable')} details`)

        // User selects token, base, table, and view.
        const token = await selectToken('airtable')
        const base = await selectBase(token.token)
        const table = await selectTable(token.token, base)
        const view = await selectView(table)

        const {
            stateField,
            slugField,
            webflowItemIdField,
            lastPublishedField,
            errorsField,
        } = await handleRequiredFields(token.token, base, table, syncName)

        return {
            token,
            base,
            table,
            view,
            stateField,
            slugField,
            webflowItemIdField,
            lastPublishedField,
            errorsField,
        }
    } catch (error) {
        ui.prompt.log.error('Error configuring Airtable.')
        await manageSyncs()
        process.exit(0)
    }
}
