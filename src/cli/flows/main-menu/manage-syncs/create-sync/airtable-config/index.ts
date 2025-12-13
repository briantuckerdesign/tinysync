import type { AirtableConfig } from '../../../../../types'
import { ui } from '../../../../../ui'
import { selectToken } from '../select-token'
import { handleRequiredFields } from './required-fields'
import { selectBase } from './select-base'
import { selectTable } from './select-table'
import { selectView } from './select-view'

export async function createAirtableConfig(): Promise<AirtableConfig> {
    try {
        ui.prompt.log.info(ui.format.bold('Airtable'))

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
        } = await handleRequiredFields(token.token, base, table)

        return {
            token,
            base,
            table,
            view,
            stateField,
            slugField,
            webflowItemIdField,
            lastPublishedField,
        }
    } catch (error) {
        ui.prompt.log.error('Error setting up Airtable sync.')
        console.log(error)
        process.exit(0)
    }
}
