import { selectAirtableToken } from './select-token'
import { saveAirtableToken } from './save-token'
import { handleRequiredFields } from './required-fields'
import { ui } from '../../../../ui'
import { encapsulateObjectForSelect } from '../../../../utils/encapsulate-object-for-select'
import type {
    AirtableBasesListItem,
    AirtableTable,
    AirtableView,
} from '../../../../../core/airtable/types'
import { airtable } from '../../../../../core/airtable'

export async function createAirtableConfig(): Promise<AirtableConfig> {
    try {
        ui.prompt.log.info(ui.format.bold('Airtable'))

        /* ---------------------------------- 1 & 2 --------------------------------- */
        const { accessToken, bases, createdThisSession } =
            await selectAirtableToken()

        // Ask user if they want to save the API token, save it
        if (createdThisSession) await saveAirtableToken(accessToken)

        /* ------------------------------------ 3 ----------------------------------- */
        // Ask user to select a base
        const base = (await ui.prompt.select({
            message: 'Airtable base:',
            options: encapsulateObjectForSelect(bases),
        })) as AirtableBasesListItem
        await ui.handleCancel(base)
        /* ------------------------------------ 4 ----------------------------------- */
        ui.spinner.start('Getting tables...')
        // Return tables for selected base
        const tables = await airtable.get.tables(accessToken, base.id)
        ui.spinner.stop(`✅ ${ui.format.dim('Tables retrieved.')}`)

        /* ------------------------------------ 5 ----------------------------------- */
        // Ask user to select a table
        const table = (await ui.prompt.select({
            message: 'Airtable table:',
            options: encapsulateObjectForSelect(tables),
        })) as AirtableTable
        await ui.handleCancel(table)
        /* ------------------------------------ 6 ----------------------------------- */
        // Ask user to select a view
        const view = (await ui.prompt.select({
            message: 'Airtable view:',
            options: encapsulateObjectForSelect(table.views),
        })) as AirtableView
        await ui.handleCancel(view)

        /* ------------------------------------ 7 ----------------------------------- */
        const {
            stateField,
            slugField,
            webflowItemIdField,
            lastPublishedField,
        } = await handleRequiredFields(base, table, accessToken)

        /* ------------------------------------ 8 ----------------------------------- */
        return {
            accessToken,
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
