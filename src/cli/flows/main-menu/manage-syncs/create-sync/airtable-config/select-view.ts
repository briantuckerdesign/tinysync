import { manageSyncs } from '../..'
import type {
    AirtableTable,
    AirtableView,
} from '../../../../../../core/airtable/types'
import { ui } from '../../../../../ui'

export async function selectView(table: AirtableTable): Promise<AirtableView> {
    try {
        const view = (await ui.prompt.select({
            message: 'Airtable view:',
            options: table.views.map((view) => ({
                label: view.name,
                value: view,
            })),
        })) as AirtableView

        await ui.handleCancel(view, manageSyncs)

        return view
    } catch (error) {
        throw new Error('There was a problem selecting Airtable table.')
    }
}
