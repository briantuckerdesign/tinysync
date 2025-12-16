import { manageSyncs } from '../..'
import { airtable, type AirtableBasesListItem } from '@tinysync/core'
import { ui } from '../../../../../ui'

export async function selectBase(
    token: string
): Promise<AirtableBasesListItem> {
    try {
        const bases = await airtable.get.bases(token)
        const base = (await ui.prompt.select({
            message: 'Airtable base:',
            options: bases.map((base) => ({
                label: base.name,
                value: base,
            })),
        })) as AirtableBasesListItem

        await ui.handleCancel(base, manageSyncs)

        return base
    } catch (error) {
        throw new Error('There was a problem selecting Airtable base.')
    }
}
